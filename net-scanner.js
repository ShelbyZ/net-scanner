'use strict';

const net = require('net');
const http = require('http');
const url = require('url');
const external_ip = require('external-ip');
const args = process.argv.slice(2);
// default to port 4747 if the first argument isn't provided
const port = args && args.length != 0 && Number.isInteger(Number.parseInt(args[0])) ? Number.parseInt(args[0]) : 4747;

const server = http.createServer((request, response) => {
    const uri = url.parse(request.url);
    const method = request.method.toLowerCase();
    const pathname = uri.pathname.toLowerCase();

    function writeJsonResponse(response, statusCode, obj) {
        const json = JSON.stringify(obj);
        response.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': json.length
        });
        response.end(json);
    }

    function getExternalIp (host) {
        return new Promise((resolve, reject) => {
            if (host) {
                resolve(host);
            } else {
                external_ip()((err, ip) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(ip);
                    }
                });
            }
        });
    }

    function checkTcp (host, port) {
        return new Promise(resolve => {
            const socket = net.createConnection({
                port: port,
                host: host
            }, () => {
                resolve('OPEN');
            });
            socket.on('error', error => {
                resolve(error.code);
            });
        });
    }

    if (method === 'options') {
        response.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        response.end();
    } else if (method === 'get' && pathname === '/ip') {
        getExternalIp().then((ip, error) => {
            writeJsonResponse(response, 200, {
                ip: ip,
                error: error
            });
        });
    } else if (method === 'post' && pathname === '/scan') {
        let buffer = '';
        request.on('data', data => {
            buffer += data;
        });
        request.on('end', () => {
            if (buffer.length === 0) {
                writeJsonResponse(response, 400, {
                    message: 'Parameter validation: missing port and/or ip field'
                });
            } else {
                try {
                    const obj = JSON.parse(buffer);
                    getExternalIp(obj.ip).then((ip, error) => {
                        if (ip) {
                            if (obj.hasOwnProperty('port')) {
                                checkTcp(ip, obj.port).then(value => {
                                    writeJsonResponse(response, 200, {
                                        ip: ip,
                                        port: obj.port,
                                        status: value
                                    });
                                }, error => {
                                    writeJsonResponse(response, 500, {
                                        message: error
                                    });
                                });
                            } else {
                                writeJsonResponse(response, 400, {
                                    message: 'Parameter validation: missing port and/or ip field'
                                });
                            }
                        } else {
                            writeJsonResponse(response, 404, {
                                message: 'Unable to find external IP to scan',
                                error: error
                            });
                        }
                    });
                } catch (e) {
                    writeJsonResponse(response, 400, {
                        message: 'Error getting external ip or scanning port',
                        error: e.message
                    });
                }
            }
        });
    } else {
        writeJsonResponse(response, 405, {
            message: 'The requested resource only supports http method \'OPTIONS\', \'GET\' (/ip), and \'POST\' (/scan).'
        });
    }
}).listen(port, '0.0.0.0');
console.log(`Running server on port: ${port}`);