#!/usr/bin/env bash
source ./venv/bin/activate

nginx -g "daemon off;" &
uwsgi --ini api.ini