#!/usr/bin/env bash
cd api
# Setup python venv
python3.9 -m venv venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create config file and allow execution of start.sh
chmod +x start.sh
python3.9 wsgi.py --config-only
cd ..

# Install npm dependencies and build production website
npm i
npm run build

# Set directory ownership
chown gsmanager:gsmanager -R api
