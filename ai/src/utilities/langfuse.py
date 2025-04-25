from src.config.manager import settings
from langfuse import Langfuse

def get_langfuse_client() -> Langfuse:
    """
    Get the Langfuse client instance.

    Returns:
        Langfuse: The Langfuse client instance.
    """
    langfuse_public_key = settings.LANGFUSE_PUBLIC_KEY
    langfuse_secret_key = settings.LANGFUSE_SECRET_KEY
    langfuse_host = settings.LANGFUSE_HOST

    return Langfuse(
        public_key = langfuse_public_key,
        secret_key = langfuse_secret_key,
        host = langfuse_host,
    )
