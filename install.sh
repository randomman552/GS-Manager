#!/usr/bin/env bash

# Setup python venv
python3.9 -m venv /api/venv venv
source ./api/venv/bin/activate
pip install ./api/requirements.txt

# Install npm dependencies and build production website
npm i
npm run build

# Set execute permission on start script
chmod +x ./api/start.sh
