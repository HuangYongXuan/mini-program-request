import {AxiosAdapter, AxiosPromise, AxiosRequestConfig, AxiosResponse, HttpOptions} from "../config/HttpConfig";
import utils from "../utils";
import createError from "../core/createError";
// @ts-ignore
const url = require('url');
// @ts-ignore
const zlib = require('zlib');
// @ts-ignore
const http = require('http');
// @ts-ignore
const https = require('https');
import buildURL from "../helpers/buildURL";

// @ts-ignore
import {http as httpFollow, https as httpsFollow} from 'follow-redirects';
import settle from "../core/settle";
import enhanceError from "../core/enhanceError";

const isHttps = /https:?/.test;

export default class HttpAdapter implements AxiosAdapter {
    timer: any;
    config: AxiosRequestConfig;

    constructor() {
    }

    init(config: AxiosRequestConfig): AxiosPromise<any> {
        this.config = config;
        return new Promise((resolvePromise: Function, rejectPromise: Function) => {
            let resolve = (value: any) => {
                clearTimeout(this.timer);
                resolvePromise(value)
            };

            let reject = (value: any) => {
                clearTimeout(this.timer);
                rejectPromise(value)
            };

            let data = this.config.data;
            let headers = this.config.headers;

            if (!headers['User-Agent'] && !headers['user-agent']) {
                headers['User-Agent'] = 'Axios';
            }

            if (data && !utils.isStream(data)) {
                // @ts-ignore
                if (Buffer.isBuffer(data)) {
                    // nothing
                } else if (utils.isArrayBuffer(data)) {
                    // @ts-ignore
                    data = Buffer.from(new Uint8Array(data));
                } else if (utils.isString(data)) {
                    // @ts-ignore
                    data = Buffer.from(data, 'utf-8');
                } else {
                    return reject(createError(
                        'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
                        config
                    ));
                }

                // Add Content-Length header if data exists
                headers['Content-Length'] = data.length;
            }

            let auth = undefined;
            if (config.auth) {
                let username = config.auth.username || '';
                let password = config.auth.password || '';
                auth = username + ':' + password;
            }

            // Parse url
            let parsed = url.parse(config.url);
            let protocol = parsed.protocol || 'http:';

            if (!auth && parsed.auth) {
                let urlAuth = parsed.auth.split(':');
                let urlUsername = urlAuth[0] || '';
                let urlPassword = urlAuth[1] || '';
                auth = urlUsername + ':' + urlPassword;
            }

            if (auth) {
                delete headers.Authorization;
            }

            let isHttpsRequest = isHttps(protocol);
            let agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

            let options: HttpOptions;

            options.path = buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '');
            options.method = config.method.toUpperCase();
            options.headers = headers;
            options.agent = agent;
            options.auth = auth;

            if (config.socketPath) {
                options.socketPath = config.socketPath;
            } else {
                options.hostname = parsed.hostname;
                options.port = parsed.port;
            }

            let proxy = config.proxy;
            if (!proxy && proxy !== false) {
                let proxyEnv = protocol.slice(0, -1) + '_proxy';
                // @ts-ignore
                let proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
                if (proxyUrl) {
                    let parsedProxyUrl = url.parse(proxyUrl);
                    // @ts-ignore
                    let noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
                    let shouldProxy = true;

                    if (noProxyEnv) {
                        let noProxy = noProxyEnv.split(',').map(function trim(s: string) {
                            return s.trim();
                        });

                        shouldProxy = !noProxy.some(function proxyMatch(proxyElement: any) {
                            if (!proxyElement) {
                                return false;
                            }
                            if (proxyElement === '*') {
                                return true;
                            }
                            if (proxyElement[0] === '.' &&
                                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement &&
                                proxyElement.match(/\./g).length === parsed.hostname.match(/\./g).length) {
                                return true;
                            }

                            return parsed.hostname === proxyElement;
                        });
                    }


                    if (shouldProxy) {
                        proxy = {
                            host: parsedProxyUrl.hostname,
                            port: parsedProxyUrl.port
                        };

                        if (parsedProxyUrl.auth) {
                            let proxyUrlAuth = parsedProxyUrl.auth.split(':');
                            proxy.auth = {
                                username: proxyUrlAuth[0],
                                password: proxyUrlAuth[1]
                            };
                        }
                    }
                }
            }

            if (proxy) {
                options.hostname = proxy.host;
                options.host = proxy.host;
                options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
                options.port = proxy.port;
                options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;

                // Basic proxy authorization
                if (proxy.auth) {
                    // @ts-ignore
                    let base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
                    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
                }
            }

            let transport;
            let isHttpsProxy = isHttpsRequest && (proxy ? isHttps(proxy.protocol) : true);
            if (this.config.transport) {
                transport = config.transport;
            } else if (config.maxRedirects === 0) {
                transport = isHttpsProxy ? https : http;
            } else {
                if (config.maxRedirects) {
                    options.maxRedirects = config.maxRedirects;
                }
                transport = isHttpsProxy ? httpsFollow : httpFollow;
            }

            if (config.maxContentLength && config.maxContentLength > -1) {
                options.maxBodyLength = config.maxContentLength;
            }

            // Create the request
            let req = transport.request(options, function handleResponse(res: any) {
                if (req.aborted) return;

                let stream = res;
                switch (res.headers['content-encoding']) {
                    /*eslint default-case:0*/
                    case 'gzip':
                    case 'compress':
                    case 'deflate':
                        stream = (res.statusCode === 204) ? stream : stream.pipe(zlib.createUnzip());

                        // remove the content-encoding in order to not confuse downstream operations
                        delete res.headers['content-encoding'];
                        break;
                }

                // return the last request in case of redirects
                let lastRequest = res.req || req;

                let response: AxiosResponse;

                response.status = res.statusCode;
                response.statusText = res.statusMessage;
                response.headers = res.headers;
                response.config = config;
                response.request = lastRequest;

                if (config.responseType === 'stream') {
                    response.data = stream;
                    settle(resolve, reject, response);
                } else {
                    let responseBuffer: [any];
                    stream.on('data', function handleStreamData(chunk: any) {
                        responseBuffer.push(chunk);

                        // make sure the content length is not over the maxContentLength if specified
                        // @ts-ignore
                        if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
                            stream.destroy();
                            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
                                config, null, lastRequest));
                        }
                    });

                    stream.on('error', function handleStreamError(err: any) {
                        if (req.aborted) return;
                        reject(enhanceError(err, config, null, lastRequest));
                    });

                    stream.on('end', function handleStreamEnd() {
                        // @ts-ignore
                        let responseData: any = Buffer.concat(responseBuffer);
                        if (config.responseType !== 'arraybuffer') {
                            responseData = responseData.toString(config.responseEncoding);
                        }

                        response.data = responseData;
                        settle(resolve, reject, response);
                    });
                }
            });

            req.on('error', function handleRequestError(err: any) {
                if (req.aborted) return;
                reject(enhanceError(err, config, null, req));
            });

            // Handle request timeout
            if (config.timeout) {
                this.timer = setTimeout(function handleRequestTimeout() {
                    req.abort();
                    reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
                }, config.timeout);
            }

            if (config.cancelToken) {
                // Handle cancellation
                config.cancelToken.promise.then(function onCanceled(cancel) {
                    if (req.aborted) return;

                    req.abort();
                    reject(cancel);
                });
            }

            // Send the request
            if (utils.isStream(data)) {
                data.on('error', function handleStreamError(err: any) {
                    reject(enhanceError(err, config, null, req));
                }).pipe(req);
            } else {
                req.end(data);
            }
        })
    }
}