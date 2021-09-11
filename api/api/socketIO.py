import os

from flask_socketio import SocketIO


async_mode = "gevent_uwsgi"
if os.getenv("FLASK_ENV").lower() == "development":
    print("Development mode specified...")
    print("Using threading for SocketIO...")
    async_mode = "threading"

socketIO = SocketIO(None, cors_allowed_origins="*", async_mode=async_mode)
