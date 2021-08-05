# Game-Server-Manager
Web application designed to allow me to launch game servers on my linux server via a web portal.

Includes a frontend made in React alongside a backend REST API implemented in Flask.

## Installation
This installation relies on you already having a MongoDB server setup and ready to use.
### 1. Python install
Install python and some uWSGI pre-requisites using the following command:
```shell
sudo apt update && sudo apt install python3.9 python3.9-venv python3-pip libpython3.9-dev build-essential
```

### 2. NPM install
Install NPM using the following command:
```shell
sudo apt install npm
```

### 3. Create gsmanager user
As this web application can execute arbitrary scripts and commands, 
it's very important that it does not have permission to do anything dangerous or damaging to your system.

As such, we create a new user with no home directory and no sudo permissions with the following command:
```shell
sudo useradd -M gsmanager
```

Then switch to this user with:
```shell
su - gsmanager
```

### 4. Clone this repository
```shell
git clone https://github.com/randomman552/GS-Manager.git
```

### 5. Run install script
This script sets up the virtual environment and installs requirements for python and npm.
```shell
chmod +x install.sh && ./install.sh
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