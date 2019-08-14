import {AxiosAdapter, AxiosPromise, AxiosRequestConfig} from "../config/HttpConfig";
import buildURL from "../helpers/buildURL";
import createError from "../core/createError";
import settle from "../core/settle";

export default class WxHttpAdapter implements AxiosAdapter {
    config: AxiosRequestConfig;
    timer: any;

    init(config: AxiosRequestConfig): AxiosPromise<any> {
        return new Promise(function (resolve, reject) {
            let requestData = config.data;
            let requestHeaders = config.headers;

            // @ts-ignore
            wx.request({
                url: buildURL(config.url, config.params, config.paramsSerializer),
                data: config.data,
                header: requestHeaders,
                method: config.method.toLocaleUpperCase(),
                dataType: 'json',
                responseType: config.responseType,
                success: (data: any, statusCode: number, headers: any) => {
                    let response: { headers: any; request?: undefined; data: any; statusText: string; config: AxiosRequestConfig; status: number };
                    response = {
                        data: data,
                        status: statusCode,
                        statusText: statusCode.toString(),
                        headers: headers,
                        config: config,
                        request: undefined
                    };
                    settle(resolve, reject, response);
                },
                fail: () => {
                    reject(createError('http error', config))
                }
            })
        })
    }

}