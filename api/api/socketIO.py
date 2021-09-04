from flask_socketio import SocketIO


socketIO = SocketIO(None, cors_allowed_origins="*", async_mode="threading")
