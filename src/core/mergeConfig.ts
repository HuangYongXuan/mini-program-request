import utils from "../utils";

export default function mergeConfig(config1: any, config2?: any) {
    config2 = config2 || {};
    let config = Object();

    utils.forEach(['url', 'method', 'params', 'data'], function mergeDeepProperties(prop: string) {
        if (typeof config2[prop] !== 'undefined') {
            config[prop] = config2[prop];
        }
    })

    utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop: any) {
        if (utils.isObject(config2[prop])) {
            config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
            config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
            config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
            config[prop] = config1[prop];
        }
    });

    utils.forEach([
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
        'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
        'socketPath'
    ], function defaultToConfig2(prop: any) {
        if (typeof config2[prop] !== 'undefined') {
            config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
            config[prop] = config1[prop];
        }
    });

    return config;
}