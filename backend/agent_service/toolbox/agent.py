from openai import OpenAI, pydantic_function_tool
from .models.calendar_event import CreateCalendarEvent
from agent_service.apps import AgentServiceConfig
from .services.tools import tools, tool_map, process_initial_prompt
from dotenv import load_dotenv
import os
import json

load_dotenv()

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_MODEL')

def agent_action(initial_prompt: str):
    initial_prompt = process_initial_prompt(initial_prompt)
    conversation = [
        {"role": "user", "content": initial_prompt}
    ]

    completed = False
    while True:
        print(conversation)
        response = openai_client.chat.completions.create(
            model=MODEL,  # Use a model that supports function calling
            messages=conversation,
            tools=tools,
            tool_choice="auto",  # Let the model decide when to call a tool
            temperature=0.0,  # No randomness
        )
        
        message = response.choices
        for msg in message:
            if msg.finish_reason == "tool_calls":
                tool_calls = msg.message.tool_calls
                conversation.append({"role": "assistant", "content": "", "tool_calls": tool_calls})

                for tool_call in tool_calls:
                    try:
                        tool_name = tool_call.function.name
                        arguments = json.loads(tool_call.function.arguments)
                        tool_output = tool_map[tool_name](**arguments)
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(tool_output)})
                    except Exception as e:
                        completed = True
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(e)})
            # elif msg.finish_reason == "stop":
            #     completed = True
            #     print(msg.message.content)
            else:
                conversation.append({"role": "assistant", "content": msg.message.content})
                completed = True
        
        if completed:
            break

    return conversation
