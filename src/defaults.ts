import utils from "./utils";
import normalizeHeaderName from "./helpers/normalizeHeaderName";
import WxHttpAdapter from "./adapters/wx";
import {AxiosAdapter, AxiosRequestConfig} from "./config/HttpConfig";
import XhrAdapter from "./adapters/xhr";
// import HttpAdapter from "./adapters/http"

let defaults: AxiosRequestConfig = {
    adapter: getDefaultAdapter(),
    headers: {
        common: {
            'Accept': 'application/json, text/plain, */*'
        }
    },
    transformRequest: [function (data: any, headers: {}) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
            utils.isArrayBuffer(data) ||
            utils.isBuffer(data) ||
            utils.isStream(data) ||
            utils.isBlob(data) ||
            utils.isFile(data)) {
            return data;
        }
        if (utils.isArrayBufferView(data)) {
            return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
            setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
            return data.toString();
        }
        if (utils.isObject(data)) {
            setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
            return JSON.stringify(data);
        }
        return data;
    }],
    transformResponse: [function (data: any) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch (e) {
            }
        }
        return data;
    }],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    validateStatus: function validateStatus(status: number) {
        return status >= 200 && status < 300;
    }
};

const DEFAULT_CONTENT_TYPE = {
    'Content-type': 'application/x-www-urlencoded'
};

function setContentTypeIfUnset(headers: any, value: string) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
    }
}

function getDefaultAdapter(): Function {
    let instance: AxiosAdapter;
    if (typeof XMLHttpRequest !== 'undefined') {
        instance = new XhrAdapter();
    } else {
        instance = new WxHttpAdapter();
    }
    return instance.init;
}


utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method: string) {
    defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method: string) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

export default defaults;