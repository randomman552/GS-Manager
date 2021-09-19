#!/usr/bin/env bash
GIT_REPO="https://github.com/randomman552/GS-Manager.git"
DEV_BRANCH=false
# Defines whether we replace the old NGINX and service config files
REPLACE_CONFIG=false

# Check arguments
if echo $* | grep -e "--develop" -q
then
  DEV_BRANCH=true
fi

if echo $* | grep -e "--replace" -q
then
  REPLACE_CONFIG=true
fi

# Install dependencies
echo "Installing dependencies..."
apt update
apt install python3.9 python3.9-venv python3-pip build-essential python-dev npm

# Create user
echo "Creating user..."
useradd -m gsmanager
cd /home/gsmanager

# Remove old files if present
echo "Removing old files..."
rm -r -f venv api wsgi.py api.ini requirements.txt


# Clone git repo
echo "Cloning git repository..."
# Remove old repo if present
if [ -d "GS-Manager" ]
then
  rm -r -f "GS-Manager"
fi

sudo su gsmanager -c "git clone $GIT_REPO"

if [ "$DEV_BRANCH" = true ]
then
  echo "Switching to development branch..."
  cd GS-Manager
  sudo su gsmanager -c "git checkout develop"
  cd /home/gsmanager
fi


# region Install new config files if requested or required
if [  $REPLACE_CONFIG = true || ! -f "gsmanager.service" ]
then
  # Install service file
  echo "Linking service file..."
  mv -f GS-Manager/gsmanager.service .
  cd /etc/systemd/system
  ln -s /home/gsmanager/gsmanager.service
  systemctl daemon-reload
  cd /home/gsmanager
fi

if [ $REPLACE_CONFIG = true || ! -f "nginx.conf" ]
then
  # Link NGINX config file
  echo "Linking NGINX config"
  mv -f GS-Manager/nginx.conf .
  cd /etc/nginx/sites-enabled
  ln -s /home/gsmanager/nginx.conf gsmanager.conf
  systemctl reload nginx
  cd /home/gsmanager
fi
# endregion


# Build frontend
echo "Building frontend..."
cd GS-Manager
sudo su gsmanager -c "npm install && npm run build"
rm -r -f /var/www/gsmanager
mkdir /var/www/gsmanager
cp -r -f build/* /var/www/gsmanager
cd ..


# Copy files we need from the repo then delete the rest
echo "Copying files..."
sudo su gsmanager -c "mv -f GS-Manager/api/* ."
sudo su gsmanager -c "rm -r -f GS-Manager"

# Build backend
# Setup python venv
echo "Creating python venv..."
sudo su gsmanager -c "python3.9 -m venv venv venv"
echo "Installing python requirements"
sudo su gsmanager -c "bash -c 'source venv/bin/activate && pip install -r requirements.txt'"

# Create config file and allow execution of start.sh
chmod +x start.sh
sudo su gsmanager -c "bash -c 'source venv/bin/activate && python3.9 wsgi.py --config-only'"
