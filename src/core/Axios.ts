import InterceptorManager, {InterceptorManagerHandler} from './InterceptorManager'
import {AxiosRequestConfig, AxiosResponse, AxiosInterceptorManager} from "../config/HttpConfig";
import mergeConfig from "./mergeConfig";
import dispatchRequest from "./dispatchRequest";
import buildURL from "../helpers/buildURL";
import utils from "../utils";

export default class Axios {
    defaults: AxiosRequestConfig;
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    };

    constructor(instanceConfig: any) {
        this.defaults = instanceConfig;
        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager()
        }
    }

    request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
        if (typeof config === 'string') {
            config = arguments[1] || {};
            config.url = arguments[0];
        } else {
            config = config || {}
        }
        config = mergeConfig(this.defaults, config);
        config.method = config.method ? config.method.toLocaleUpperCase() : 'GET';

        let chain: any[] = [dispatchRequest, undefined];
        let promise = Promise.resolve(config);

        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor: InterceptorManagerHandler) {
            chain.unshift(interceptor.fulfilled, interceptor.rejected)
        });

        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor: InterceptorManagerHandler) {
            chain.push(interceptor.fulfilled, interceptor.rejected);
        });

        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }
        // @ts-ignore
        return promise;
    }

    getUri(config: AxiosRequestConfig): string {
        config = mergeConfig(this.defaults, config);
        return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    }
};

utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method: string) {
    // @ts-ignore
    Axios.prototype[method] = function (url: string, config: AxiosRequestConfig) {
        return this.request(utils.merge(config || {}, {
            method: method,
            url: url
        }));
    };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method: string) {
    // @ts-ignore
    Axios.prototype[method] = function (url: string, data: any, config: AxiosRequestConfig) {
        return this.request(utils.merge(config || {}, {
            method: method,
            url: url,
            data: data
        }));
    };
});