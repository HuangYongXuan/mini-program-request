import {AxiosAdapter, AxiosPromise, AxiosRequestConfig} from "../config/HttpConfig";
import utils from "../utils";
import buildURL from "../helpers/buildURL";
import parseHeaders from "../helpers/parseHeaders";
import settle from "../core/settle";
import createError from "../core/createError";
import isURLSameOrigin from "../helpers/isURLSameOrigin";

export default class XhrAdapter implements AxiosAdapter {
    config: AxiosRequestConfig;
    timer: any;

    init(config: AxiosRequestConfig): AxiosPromise<any> {
        return new Promise(function dispatchXhrRequest(resolve, reject) {
            let requestData = config.data;
            let requestHeaders = config.headers;

            if (utils.isFormData(requestData)) {
                delete requestHeaders['Content-Type']; // Let the browser set it
            }

            let request = new XMLHttpRequest();

            // HTTP basic authentication
            if (config.auth) {
                let username = config.auth.username || '';
                let password = config.auth.password || '';
                requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
            }

            let url = buildURL(config.url, config.params, config.paramsSerializer);

            request.open(config.method.toUpperCase(), url, true);

            // Set the request timeout in MS
            request.timeout = config.timeout;

            // Listen for ready state
            request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) {
                    return;
                }

                // The request errored out and we didn't get a response, this will be
                // handled by onerror instead
                // With one exception: request that using file: protocol, most browsers
                // will return status as 0 even though it's a successful request
                if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
                    return;
                }

                // Prepare the response
                let responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
                let responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
                let response = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeaders,
                    config: config,
                    request: request
                };

                settle(resolve, reject, response);

                // Clean up request
                request = null;
            };

            // Handle browser request cancellation (as opposed to a manual cancellation)
            request.onabort = function handleAbort() {
                if (!request) {
                    return;
                }

                reject(createError('Request aborted', config, 'ECONNABORTED', request));

                // Clean up request
                request = null;
            };

            // Handle low level network errors
            request.onerror = function handleError() {
                // Real errors are hidden from us by the browser
                // onerror should only fire if it's a network error
                reject(createError('Network Error', config, null, request));

                // Clean up request
                request = null;
            };

            // Handle timeout
            request.ontimeout = function handleTimeout() {
                reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
                    request));

                // Clean up request
                request = null;
            };

            // Add xsrf header
            // This is only done if running in a standard browser environment.
            // Specifically not if we're in a web worker, or react-native.
            if (utils.isStandardBrowserEnv()) {
                // @ts-ignore
                let cookies = require('./../helpers/cookies');

                // Add xsrf header
                let xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
                    cookies.read(config.xsrfCookieName) :
                    undefined;

                if (xsrfValue) {
                    requestHeaders[config.xsrfHeaderName] = xsrfValue;
                }
            }

            // Add headers to the request
            if ('setRequestHeader' in request) {
                utils.forEach(requestHeaders, function setRequestHeader(val: any, key: any) {
                    if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
                        // Remove Content-Type if data is undefined
                        delete requestHeaders[key];
                    } else {
                        // Otherwise add header to the request
                        request.setRequestHeader(key, val);
                    }
                });
            }

            // Add withCredentials to request if needed
            if (config.withCredentials) {
                request.withCredentials = true;
            }

            // Add responseType to request if needed
            if (config.responseType) {
                try {
                    // @ts-ignore
                    request.responseType = config.responseType;
                } catch (e) {
                    // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
                    // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
                    if (config.responseType !== 'json') {
                        throw e;
                    }
                }
            }

            // Handle progress if needed
            if (typeof config.onDownloadProgress === 'function') {
                request.addEventListener('progress', config.onDownloadProgress);
            }

            // Not all browsers support upload events
            if (typeof config.onUploadProgress === 'function' && request.upload) {
                request.upload.addEventListener('progress', config.onUploadProgress);
            }

            if (config.cancelToken) {
                // Handle cancellation
                config.cancelToken.promise.then(function onCanceled(cancel) {
                    if (!request) {
                        return;
                    }

                    request.abort();
                    reject(cancel);
                    // Clean up request
                    request = null;
                });
            }

            if (requestData === undefined) {
                requestData = null;
            }

            // Send the request
            request.send(requestData);
        });
    }

}