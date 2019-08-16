import utils from "../utils";
import {AxiosRequestConfig, AxiosResponse} from "../config/HttpConfig";
import isAbsoluteURL from "../helpers/isAbsoluteURL";
import combineURLs from "../helpers/combineURLs";
import transformData from "./transformData";
import defaults from "../defaults";
import isCancel from "../cancel/isCancel";

function throwIfCancellationRequested(config: AxiosRequestConfig) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}

export default function dispatchRequest(config: AxiosRequestConfig) {
    throwIfCancellationRequested(config);
    if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
    }

    config.headers = config.headers || {};

    config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
    );

    config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers || {});

    utils.forEach(['delete', 'get', 'head', 'post', 'put', 'common'], function cleanHeaderConfig(method: string) {
        delete config.headers[method];
    });

    let adapter: Function = config.adapter || defaults.adapter;

    return adapter(config).then(function onAdapterResolution(response: AxiosResponse) {
        throwIfCancellationRequested(config);

        response.data = transformData(response.data, response.headers, config.transformResponse);

        return response;
    }, function onAdapterRejection(reason: any) {
        if (!isCancel(reason)) {
            throwIfCancellationRequested(config);

            if (reason && reason.response) {
                reason.response.data = transformData(
                    reason.response.data,
                    reason.response.headers,
                    config.transformResponse
                );
            }
        }
        return Promise.reject(reason);
    })
}