import logging
import websockets
import os
import json
import asyncio

logger = logging.getLogger(__name__)
DATABASE_WS_SERVICE_URL = os.getenv('DATABASE_WS_SERVICE_URL')

class DBConversationWebSocketClient:
    def __init__(self, conversation_id: int):
        self.ws_url = f"{DATABASE_WS_SERVICE_URL}/conversation/{conversation_id}/"
        self.connection = None

    async def __aenter__(self):
        """Async context manager entry point"""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit point"""
        await self.close()

    async def connect(self):
        """Establish WebSocket connection"""
        try:
            self.connection = await websockets.connect(self.ws_url)
            logger.info(f"Connected to WebSocket: {self.ws_url}")
        except Exception as e:
            logger.error(f"Connection failed: {str(e)}", exc_info=True)
            raise

    async def send_message(self, message_type: str, message: dict):
        """Send a message through the WebSocket connection"""
        if not self.connection or self.connection.closed:
            raise ConnectionError("WebSocket connection not established or closed")

        try:
            await self.connection.send(json.dumps({
                "type": message_type,
                "message": message
            }))
            logger.debug(f"Sent message: {message}")
        except websockets.exceptions.ConnectionClosed as e:
            logger.error(f"Connection closed unexpectedly: {e.code}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Failed to send message: {str(e)}", exc_info=True)
            raise

    async def close(self):
        """Close the WebSocket connection gracefully"""
        if self.connection and not self.connection.closed:
            try:
                await self.connection.close()
                logger.info("WebSocket connection closed properly")
            except Exception as e:
                logger.error(f"Error closing connection: {str(e)}", exc_info=True)
            finally:
                self.connection = None
                