# Game-Server-Manager
Web application designed to allow me to launch game servers on my linux server via a web portal.

Includes a frontend made in React alongside a backend REST API implemented in Flask.

## Installation
This installation relies on you already having set up and understanding how to configure:
- MongoDB server.
- Nginx server.

### 1. Run install script
Get the installation script with the following command:
```shell
wget https://github.com/randomman552/GS-Manager/releases/download/latest/setup.sh
```

Run the script from its download location using the following command:
```shell
sudo chmod +x setup.sh && sudo ./setup.sh
```

### 2. Edit config file
A config file will have been generated in `/home/gsmanager/storage/config.json`.\
It will look like this:
```json
{
    "MONGODB_SETTINGS": {
        "host": "mongodb://localhost:27017/gsmanager?authSource=gsmanager"
    },
    "SECRET_KEY": "3bb08f25e6bf69fd85b9d113290dedfb05fc9a18c1a569c2"
}
```
Edit the `host` field under `MONGODB_SETTINGS` to be the connection URI for your MongoDB database.\
More information [here](https://docs.mongodb.com/manual/reference/connection-string/).

### 3. Start and enable service
A service file will have been added to your systemd files.\
You can start and then enable the service to start on startup using the following commands:
```shell
sudo systemctl start gsmanager
sudo systemctl enable gsmanager
```


### 4. Editing Nginx config
You can edit the hostname gsmanager is hosted at using the nginx config file installed by the install script.\
This config file can be found at `/etc/nginx/sites-available/gsmanager.conf`.\
You can change the field `server_name` in order to editing the hostname of the server.

This should match your domain name.\
More information [here](https://nginx.org/en/docs/http/server_names.html).

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