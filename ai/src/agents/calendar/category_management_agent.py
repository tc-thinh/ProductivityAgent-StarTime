from typing import List
import requests
from agents import Agent, Runner
from src.utilities.langfuse import get_langfuse_client
from src.models.agent_outputs.category import Category
from src.config.manager import settings


class CategoryManagementAgent:
    def __init__(self, user_id: str):
        self.categories = self._get_categories(user_id)
        self.name = "CategoryManagementAgent"
        self.description = "An agent that manages categories for calendar events."

        self.langfuse_client = get_langfuse_client()

        self.model = self.langfuse_client.get_prompt(
            "CategoryManagementAgent_Model", type="text"
        ).compile()
        self.instructions = self.langfuse_client.get_prompt(
            "CategoryManagementAgent_Instructions", type="text"
        ).compile()

        self.agent = Agent(
            name="Category Management Agent",
            instructions=self.instructions,
            model=self.model,
            output_type=Category
        )

    def _simplify_category(self, category: Category) -> dict[str, str]:
        """
        Extract only essential information from the category.
        """
        simplified = {
            'cat_id': category.get('cat_id', '0'),
            'cat_title': category.get('cat_title', 'Untitled'),
            'cat_description': category.get('cat_description', 'No description.'),
            'cat_examples': category.get('cat_examples', []),
        }
        return simplified

    def _get_categories(self, user_id: str) -> List[Category]:
        """
        Fetch all active categories from the database service.
        """
        url = f"{settings.DATABASE_SERVICE}/categories/?token={user_id}&&active=true"
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for HTTP errors
            categories = response.json()
            return categories
        except requests.RequestException as e:
            print(f"Error fetching categories: {e}")
            return []
    
    async def process(self, event_summary: str, event_description: str) -> dict:
        """
        Process the categories and return a simplified version.
        """
        default = { "cat_color_id": "0", "cat_event_prefix": "" }
        if not self.categories:
            return default
        
        simplified_categories = [{
            'cat_id': '-1',
            'cat_title': 'Other',
            'cat_description': 'No specific category found for this event.',
            'cat_examples': []
        }] + [self._simplify_category(category) for category in self.categories]
        
        prompt = self.langfuse_client.get_prompt("CategoryManagementAgent_Context", type="chat")
        result = await Runner.run(self.agent, prompt.compile(
            simplified_categories=simplified_categories,
            event_name=event_summary,
            event_description=event_description
        ))

        cat_id = result.final_output_as(cls=Category).cat_id
        for cat in self.categories:
            if cat["cat_id"] == cat_id:
                return {
                    "cat_color_id": cat["cat_color_id"],
                    "cat_event_prefix": cat["cat_event_prefix"]
                }

        return default
