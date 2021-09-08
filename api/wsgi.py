#!/usr/bin/env python3.9
from gevent import monkey
monkey.patch_all()

from api import app, socketIO

if __name__ == "__main__":
    socketIO.run(app)
