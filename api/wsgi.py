#!/usr/bin/env python3.9
from api import app, socketIO

if __name__ == "__main__":
    socketIO.run(app)
