# Game-Server-Manager
Web application designed to allow me to launch game servers on my linux server via a web portal.

Includes a frontend made in React alongside a backend REST API implemented in Flask.

## Installation
This installation relies on:
- Functional MongoDB server.
- Functional Nginx server.

### 1. Python install
Install pre-requisites needed for program to function.
```shell
sudo apt update && sudo apt install python3.9 python3.9-venv python3-pip libpython3.9-dev build-essential npm
```

### 2. Create user
As this web application can execute arbitrary scripts and commands, 
it's very important that it does not have permission to do anything dangerous or damaging to your system.

As such, we create a new user with no home directory and no sudo permissions with the following command:
```shell
sudo useradd -M gsmanager
```

### 3. Clone this repository
Clone the repository with the following commands:
```shell
cd /var/www
sudo git clone https://github.com/randomman552/GS-Manager.git
```

### 4. Run install script
This script sets up the virtual environment and installs requirements for python and npm.
```shell
cd GS-Manager
sudo chmod +x install.sh && sudo ./install.sh
```

### 5. Configure API settings.
Open the config file in the api/api sub-folder and configure MongoDB connection URI.\
The default connection URI will work if you have not set up authentication on your MongoDB instance.\
More info can be found on connection uris [here](https://docs.mongodb.com/manual/reference/connection-string/)


### 6. Add service to systemd for backend api
Use the following commands to add a service for the api and allow it to start on startup.
```shell
cd /etc/systemd/system
ln -s /var/www/GS-Manager/gsmanger-api.service
systemctl daemon-reload
systemctl enable gsmanger-api
systemctl start gsmanger-api
```

### 7. Setup NGINX config
Copy the provided gsmanager-nginx.conf file to your nginx sites-available folder.
```shell
sudo cp gsmanager-nginx.conf /etc/nginx/sites-available
```
Replace any server_name attributes with whatever domain name you want the website to be hosted under.\
By default all interfaces will be bound.

Link this file to sites-enabled and restart nginx to see the front-end site hosted at the address you provided as server_name
```shell
cd /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/gsmanager-nginx.conf
sudo systemctl restart nginx
```


## Communication
Endpoints communicate in a standardised way.\
This section defines how requests and responses should be structured.

### Front to back end
Data from the frontend should ALWAYS conform to the following JSON format:
```json
{
  "auth":  {
    "apikey": null,
    "username": null,
    "password": null
  },
  "data": {
    
  }
}
```
`Auth` provides the means of authorisation for the requested action, this can be provided as:
- An `apikey` or
- a `username` `password` combo

`data` contains more JSON encoded data which is used on the server side and varies per end-point

### Back to front end
Data will always be sent back in a standard JSON format as follows:
```json
{
  "code": 200,
  "error": null,
  "data": {
    
  }
}
```