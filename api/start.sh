#!/usr/bin/env bash
source ./venv/bin/activate
uwsgi --socket 0.0.0.0:5552 --protocol=http -w wsgi:app --enable-threads --gevent 1000 --http-websockets