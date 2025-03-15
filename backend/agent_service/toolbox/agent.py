import os
import json
import asyncio
import logging
from dotenv import load_dotenv

from agent_service.clients.conversation_ws import DBConversationWebSocketClient
from .services.tools import tools, tool_map, get_environmental_context_prompt
from agent_service.apps import AgentServiceConfig

# Initialize logging
logger = logging.getLogger(__name__)
load_dotenv()

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_LLM_STANDARD')

async def agent_action(prompt: str, conv_id: int):
    """Main agent execution with proper async handling"""
    logger.info("Starting agent action for conversation %s", conv_id)
    
    messages = [
        get_environmental_context_prompt(),
        {"role": "user", "content": prompt}
    ]

    try:
        async with DBConversationWebSocketClient(conv_id) as ws_client:
            logger.debug("WebSocket connection established")
            
            # Send initial message
            await ws_client.send_message(
                message_type='conversation_message',
                message={"role": "user", "content": prompt}
            )

            done = False
            while not done:
                logger.debug("Current conversation state: %s", messages)
                
                try:
                    response = openai_client.chat.completions.create(
                        model=MODEL,
                        messages=messages,
                        tools=tools,
                        tool_choice="auto",
                        temperature=0.0,
                    )
                except Exception as e:
                    logger.error(f"API request failed: {e}", exc_info=True)
                    raise
                
                logger.debug("Received response: %s", response.choices)

                for choice in response.choices:
                    if choice.message.tool_calls:
                        await handle_tool_calls(choice.message.tool_calls, messages, ws_client)
                    else:
                        await handle_assistant_response(choice.message.content, messages, ws_client)
                        done = True
                
                if done:
                    break
                
            logger.info("Final conversation state: %s", messages)
            return messages

    except Exception as e:
        logger.error(f"Agent action failed: {e}", exc_info=True)
        raise

async def handle_tool_calls(tool_calls, messages, ws_client):
    """Handle tool call responses"""
    messages.append({
        "role": "assistant",
        "content": "",
        "tool_calls": tool_calls
    })
    
    try:
        # Reformat ChatCompletionMessageToolCall to JSON
        tool_calls_json = []
        for call in tool_calls:
            tool_calls_json.append({
                "id": call.id,
                "function": {
                    "arguments": call.function.arguments,
                    "name": call.function.name
                },
                "type": call.type
            })

        await ws_client.send_message(
            message_type='conversation_message',
            message={"role": "assistant", "content": "", "tool_calls": tool_calls_json}
        )
    except Exception as e:
        logger.error(f"Failed to send tool call message: {e}", exc_info=True)
        raise

    for call in tool_calls:
        try:
            tool_name = call.function.name
            args = json.loads(call.function.arguments)
            logger.info("Executing tool %s with args %s", tool_name, args)
            
            result = await tool_map[tool_name](**args)
            logger.debug("Tool %s returned: %s", tool_name, result)

            tool_response = {
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result)
            }
            
            messages.append(tool_response)
            await ws_client.send_message(
                message_type='conversation_message',
                message=tool_response
            )

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON arguments: {str(e)}", exc_info=True)
            await handle_tool_error(call.id, e, messages, ws_client)
        except KeyError as e:
            logger.error(f"Unknown tool {tool_name}", exc_info=True)
            await handle_tool_error(call.id, e, messages, ws_client)
        except Exception as e:
            logger.error(f"Tool execution error: {str(e)}", exc_info=True)
            await handle_tool_error(call.id, e, messages, ws_client)

async def handle_tool_error(tool_call_id, error, messages, ws_client):
    """Handle tool execution errors"""
    error_response = {
        "role": "tool",
        "tool_call_id": tool_call_id,
        "content": error
    }
    
    messages.append(error_response)
    
    try:
        await ws_client.send_message(
            message_type='conversation_message',
            message=error_response
        )
    except Exception as e:
        logger.error("Failed to send error message: %s", str(e))

async def handle_assistant_response(content, messages, ws_client):
    """Handle normal assistant responses"""
    response = {
        "role": "assistant",
        "content": content
    }
    
    messages.append(response)
    
    try:
        await ws_client.send_message(
            message_type='conversation_message',
            message=response
        )
    except Exception as e:
        logger.error(f"Failed to send assistant response: {e}", exc_info=True)
        raise

def start_agent_action(prompt: str, conv_id: int):
    """Thread entry point with proper event loop handling"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(agent_action(prompt, conv_id))
    except Exception as e:
        logger.error(f"Agent thread failed: {e}", exc_info=True)
    finally:
        if loop.is_running():
            loop.close()
