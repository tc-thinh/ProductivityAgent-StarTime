from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import google.auth.exceptions
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError 
from src.config.manager import settings

TOKEN_URI = "https://oauth2.googleapis.com/token"


def get_credentials_from_refresh_token(refresh_token: str) -> Credentials:
    """
    Creates and refreshes Google OAuth 2.0 Credentials using a refresh token.

    Args:
        refresh_token: The refresh token obtained from a previous authorization.
        # Removed client_id and client_secret as they are fetched from settings

    Returns:
        A refreshed google.oauth2.credentials.Credentials object.

    Raises:
        google.auth.exceptions.RefreshError: If refreshing the token fails.
        ValueError: If required arguments are missing or refresh yields no token/invalid creds.
        RuntimeError: For unexpected errors during credential handling.
    """
    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET

    if not all([refresh_token, client_id, client_secret]):
        missing = [name for name, val in [('refresh_token', refresh_token), ('client_id', client_id), ('client_secret', client_secret)] if not val]
        raise ValueError(f"Missing required configuration: {', '.join(missing)}")

    try:
        credentials = Credentials(
            token=None, 
            refresh_token=refresh_token,
            token_uri=TOKEN_URI,
            client_id=client_id,
            client_secret=client_secret
        )

        request = Request()
        credentials.refresh(request) # Refresh the credentials, obtaining an access token internally

        # Check if the refresh actually worked and populated the token and if creds are valid
        if not credentials.token:
             raise ValueError("Credentials refreshed but no access token was obtained.")
        if not credentials.valid:
             # This checks expiry and presence of token
             raise ValueError("Credentials refreshed but are not valid (likely expired or missing token).")

        return credentials # <--- Return the entire credentials object

    except google.auth.exceptions.RefreshError as e:
        raise google.auth.exceptions.RefreshError(f"Failed to refresh access token using refresh token: {e}") from e
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during credential refresh: {e}") from e


def get_calendar_service(refresh_token: str):
    """
    Creates and returns a Google Calendar API service object using a refresh token.

    Args:
        refresh_token: The refresh token obtained from a previous authorization.

    Returns:
        An authorized Google Calendar API service object (Resource).

    Raises:
        google.auth.exceptions.RefreshError: If refreshing the token fails.
        ValueError: If required arguments are missing or refresh yields invalid creds.
        RuntimeError: For unexpected errors during credential handling or service build.
        googleapiclient.errors.HttpError: If the build function encounters API issues.
    """
    creds = get_credentials_from_refresh_token(refresh_token=refresh_token)

    try:
        service = build('calendar', 'v3', credentials=creds, static_discovery=False)
        return service
    except HttpError as e:
        raise HttpError(f"Failed to build Google Calendar service due to API error: {e}", resp=e.resp) from e
    except Exception as e:
        raise RuntimeError(f"Failed to build Google Calendar service: {e}") from e
