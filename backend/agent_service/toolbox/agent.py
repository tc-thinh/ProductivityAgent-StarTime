from openai import OpenAI, pydantic_function_tool
from .models.calendar_event import CreateCalendarEvent
from agent_service.apps import AgentServiceConfig
from .services.tools import tools, tool_map, get_environmental_context_prompt
from .services.prompts import create_prompt
from dotenv import load_dotenv
import os
import json

load_dotenv()

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_MODEL')

def agent_action(initial_prompt: str, section_id: int):
    conversation = [
        get_environmental_context_prompt(),
        {"role": "user", "content": initial_prompt}
    ]
    create_prompt({"role": "user", "content": initial_prompt}, token=0, price=0.0, section_id=section_id)

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
                create_prompt(prompt={"role": "assistant", "content": "", "tool_calls": tool_calls}, token=usage.total_tokens, price=0.0, section_id=section_id)

                for tool_call in tool_calls:
                    try:
                        tool_name = tool_call.function.name
                        arguments = json.loads(tool_call.function.arguments)
                        tool_output = tool_map[tool_name](**arguments)
                        print(tool_name, arguments, tool_output)
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(tool_output)})
                        create_prompt(prompt={"role": "tool", "tool_call_id": tool_call.id, "content": str(tool_output)}, token=0, price=0.0, section_id=section_id)
                    except Exception as e:
                        completed = True
                        conversation.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(e)})
                        create_prompt(prompt={"role": "tool", "tool_call_id": tool_call.id, "content": str(e)}, token=0, price=0.0, section_id=section_id)
            else:
                conversation.append({"role": "assistant", "content": msg.message.content})
                create_prompt(prompt={"role": "assistant", "content": msg.message.content}, token=usage.total_tokens, price=0.0, section_id=section_id)
                completed = True
        
        if completed:
            break

    return conversation
