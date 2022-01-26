#!/usr/bin/env bash
nginx -g "daemon off;" &
uwsgi --ini api.ini