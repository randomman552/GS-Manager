#!/usr/bin/env python3.9
import os

if not str(os.getenv("FLASK_ENV")).lower() == "development":
    print("Setting up for production environment...")
    from gevent import monkey
    monkey.patch_all()

from api import app, socketIO

if __name__ == "__main__":
    socketIO.run(app)
