import requests
import os

DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

def create_message(message: dict, conversation_id: int):
    payload = {
        "m_role": message['role'],
        "m_content": message['content'],
        "m_raw": message['content']
                        + f"tool_call_id: {message.get('tool_call_id', '')} "
                        + f"tool_calls: {message.get('tool_calls', '')}",
        "c_id": conversation_id
    }

    response = requests.post(DATABASE_SERVICE_URL + "/messages/", json=payload)
    print(response.json())  # Debugging
    return response.json()['m_id']

def create_toolcall(toolcall: dict, message_id: int):
    payload = {
        "tc_name": toolcall.get('tool_call_id', ''),
        "tc_arguments": toolcall.get('arguments', ''),
        "m_id": message_id,  
        "tc_result": toolcall.get('content', '')
    }
    response = requests.post(DATABASE_SERVICE_URL + "/toolcalls/", json=payload)
    print("Toolcall response:", response.json())
    return response.json().get('tc_id')
