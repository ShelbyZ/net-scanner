# net-scanner
Gets external IP address and can check if a port is open on that address.

## Purpose
Pet project to play around with containers ([Kubernetes](https://kubernetes.io/) and [Docker](https://www.docker.com/)) and see if that open port on a remote machine can be accessed.

## Version
- 0.0.1
  * Initial Release

## How it Works

### Node
node> net-scanner [port]

- port - optional port to host server on (default 4747)

#### Get External IP
Make a GET request to the server at '/ip' on the configured port:

```
curl -i -X GET localhost:4747/ip
```

#### Check Open Port
Make a POST request to the server at '/scan' on the configured port with a JSON object in the form of:

```
{
  ip - optional, if not supplied external IP will be discoverd first
  port - port to check
}
```

```
curl -i -X POST -H "Content-Type: application/json" -d '{"ip":"1.1.1.1","port":"1234"}' localhost:4747/scan
```

### Docker

TODO

### Kubernetes

TODO

## Dependencies

### Node

- [net](https://nodejs.org/api/net.html) - opening a connection to remote  IP address to check if a port is open
- [http](https://nodejs.org/api/http.html) - hosting web server
- [url](https://nodejs.org/api/url.html) - url processing
- [external-ip](https://www.npmjs.com/package/external-ip) - get external IP address

## References

TODO