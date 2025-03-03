from openai import OpenAI, pydantic_function_tool
from .models.calendar_event import CreateCalendarEvent
from agent_service.apps import AgentServiceConfig
from .services.tools import tools, tool_map, get_environmental_context_prompt
from .services.messages import create_message
from dotenv import load_dotenv
import os
import json
import threading

load_dotenv()

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_MODEL')

def agent_action(initial_prompt: str, conversation_id: int):
    conversation = [
        get_environmental_context_prompt(),
        {"role": "user", "content": initial_prompt}
    ]
    
    # commit_initial_message_thread = threading.Thread(
    #     target=create_message, 
    #     args=(
    #         {"role": "user", "content": initial_prompt}, 
    #         conversation_id
    #     )
    # )
    # commit_initial_message_thread.start()

    completed = False
    while True:
        print(conversation)
        response = openai_client.chat.completions.create(
            model=MODEL,  
            messages=conversation,
            tools=tools,
            tool_choice="auto",  
            temperature=0.0,
        )
        
        message = response.choices
        usage = response.usage
        print(message)
        for msg in message:
            if msg.message.tool_calls:
                tool_calls = msg.message.tool_calls
                conversation.append({"role": "assistant", "content": "", "tool_calls": tool_calls})
                # create_message(prompt={"role": "assistant", "content": "", "tool_calls": tool_calls}, conversation_id=conversation_id)

                for tool_call in tool_calls:
                    try:
                        tool_name = tool_call.function.name
                        arguments = json.loads(tool_call.function.arguments)
                        tool_output = tool_map[tool_name](**arguments)
                        print(tool_name, arguments, tool_output)
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(tool_output)})
                        # create_message(prompt={"role": "tool", "tool_call_id": tool_call.id, "content": str(tool_output)}, token=0, price=0.0, section_id=section_id)
                    except Exception as e:
                        completed = True
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(e)})
                        # create_message(prompt={"role": "tool", "tool_call_id": tool_call.id, "content": str(e)}, token=0, price=0.0, section_id=section_id)
            else:
                conversation.append({"role": "assistant", "content": msg.message.content})
                # create_message(prompt={"role": "assistant", "content": msg.message.content}, token=usage.total_tokens, price=0.0, section_id=section_id)
                completed = True
        
        if completed:
            break
    
    print(conversation)
    return conversation
