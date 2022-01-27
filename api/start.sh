#!/usr/bin/env bash
/docker-entrypoint.d/20-envsubst-on-templates.sh

nginx -g "daemon off;" &
uwsgi --ini api.ini