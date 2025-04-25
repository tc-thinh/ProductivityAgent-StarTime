from src.agents.calendar.create_event_agent import CreateCalendarEventAgent
from src.agents.calendar.query_event_agent import QueryCalendarEventAgent
from agents import Agent
from agents import Agent, Runner
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX
import logging
from src.utilities.langfuse import get_langfuse_client

logger = logging.getLogger(__name__)

class CalendarOrchestrator:
    def __init__(self, user_id: str, google_refresh_token: str, timezone: str = "UTC"):
        self.user_id = user_id
        self.name = "CalendarOrchestrator"
        self.description = "Orchestrates calendar-related tasks."
        self.google_refresh_token = google_refresh_token

        self.create_event_agent = CreateCalendarEventAgent(user_id, google_refresh_token, timezone)
        self.query_event_agent = QueryCalendarEventAgent(user_id, google_refresh_token, timezone)

        self.langfuse_client = get_langfuse_client()

        self.model = self.langfuse_client.get_prompt(
            "CalendarOrchestrator_Model", type="text"
        ).compile()
        self.instructions = self.langfuse_client.get_prompt(
            "CalendarOrchestrator_Instructions", type="text"
        ).compile()

        self.agent = Agent(
            name="Calendar Orchestrator",
            instructions=f"""   {RECOMMENDED_PROMPT_PREFIX}\n
                                {self.instructions}""",
            model=self.model,
            output_type=str,
            handoffs=[self.create_event_agent.agent, self.query_event_agent.agent],
        )

    async def process(self, prompt: str):
        runner = await Runner.run(self.agent, prompt)
        return runner.final_output
