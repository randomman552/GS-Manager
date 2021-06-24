# Game-Server-Manager
Web application designed to allow me to launch game servers on my linux server via a web portal.

Includes a frontend made in React alongside a backend REST API implemented in Flask.

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