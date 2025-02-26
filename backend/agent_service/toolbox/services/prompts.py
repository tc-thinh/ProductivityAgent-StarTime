import requests
import os

DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

def create_prompt(prompt: dict, token: int, price: float, section_id: int):
    prompt_object = {
        "pr_role": prompt['role'],
        "pr_content": prompt['content'] 
                        + (f"tool_call_id: {prompt['tool_call_id']},\n" if 'tool_call_id' in prompt else "")
                        + (f"tool_calls: {prompt['tool_calls']}\n" if 'tool_calls' in prompt else ""),
        "pr_token": token,
        "pr_price": price,
        "s_id": section_id
    }

    response = requests.post(DATABASE_SERVICE_URL + "/prompts/", json=prompt_object)
    print(response.json())  # Debugging
    return response.json()['s_id']
