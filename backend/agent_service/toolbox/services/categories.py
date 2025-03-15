# methods for:
# determine category for calendar creation
# disrupt and remove agent from the main pipeline to
# decide on the color category
# input: event name, event descriptions, categories available
# output: {color code}
import requests
import os
from agent_service.apps import AgentServiceConfig
from agent_service.toolbox.models.category import Category
import logging

logger = logging.getLogger(__name__)

DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')
MODEL = os.getenv('OPENAI_LLM_STANDARD')
openai_client = AgentServiceConfig.openai_client

def simplify_category(category):
    """
    Extract only essential information from the category.
    """
    simplified = {
        'cat_id': category.get('cat_id', '0'),
        'cat_title': category.get('cat_title', 'Untitled'),
        'cat_description': category.get('cat_description', 'No description.'),
        'cat_examples': category.get('cat_examples', []),
        'cat_color_id': category.get('color', '0')
    }
    return simplified

def get_available_categories():
    """
    Fetch all active categories from the database service.
    """
    url = f"{DATABASE_SERVICE_URL}/categories/?active=true"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        categories = response.json()
        return categories
    except requests.RequestException as e:
        print(f"Error fetching categories: {e}")
        return []

def get_category_by_event(event_name: str, event_description: str) -> dict[str, str]:
    categories = get_available_categories()
    default = { "cat_color_id": "0", "cat_event_prefix": "" }

    # If no categories are available, return a default category
    if not categories:
        logger.error("No categories available.")
        return default
    
    simplified_categories = [{
        'cat_id': '0',
        'cat_title': 'Other',
        'cat_description': 'No specific category found for this event.',
        'cat_examples': [],
        'cat_color_id': '0'
    }] + [simplify_category(category) for category in categories]
    logger.info(f"Available categories: {simplified_categories}")
    
    response = openai_client.beta.chat.completions.parse(
        model=MODEL,
        messages=[
            {
                "role": "system", 
                "content":  f"Choose one category from the available options that best fits the event title and description. You are a category manager for an event scheduler app. The available categories are: {simplified_categories}"
            },
            {"role": "user", "content": f"Assign a category to the event: Event Name: {event_name} - Event Description: {event_description}"}
        ],
        response_format=Category
    )

    category = response.choices[0].message
    if category.refusal:
        logger.error(f"Failed to determine category: {category.refusal}", exc_info=True)
        return default

    try: 
        selected_category_id = category.parsed.cat_id
        logger.info(f"Selected category: {selected_category_id}")

        for cat in categories:
            if cat["cat_id"] == selected_category_id:
                return {
                    "cat_color_id": cat["cat_color_id"],
                    "cat_event_prefix": cat["cat_event_prefix"]
                }
            
        return default
    except Exception as e:
        logger.error(f"Failed to parse category: {e}", exc_info=True)
        return default
    