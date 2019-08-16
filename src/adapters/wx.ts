import {AxiosAdapter, AxiosPromise, AxiosRequestConfig} from "../config/HttpConfig";
import buildURL from "../helpers/buildURL";
import createError from "../core/createError";
import settle from "../core/settle";

export default class WxHttpAdapter implements AxiosAdapter {
    config: AxiosRequestConfig;
    timer: any;

    init(config: AxiosRequestConfig): AxiosPromise<any> {
        return new Promise(function (resolve, reject) {
            let requestHeaders = config.headers;

            // @ts-ignore
            let requestTask = wx.request({
                url: buildURL(config.url, config.params, config.paramsSerializer),
                data: config.data,
                header: requestHeaders,
                method: config.method.toLocaleUpperCase(),
                dataType: 'json',
                responseType: config.responseType,
                success: (res: any) => {
                    let response: { headers: any; request?: undefined; data: any; statusText: string; config: AxiosRequestConfig; status: number };
                    response = {
                        data: res.data,
                        status: res.statusCode,
                        statusText: res.statusCode + '',
                        headers: res.header,
                        config: config,
                        request: requestTask
                    };
                    settle(resolve, reject, response);
                },
                fail: () => {
                    reject(createError('http error', config))
                },
                complete: () => {
                    console.info('complete')
                }
            });

            if (!!config.cancelToken) {
                config.cancelToken.requestTask = requestTask;
            }
        })
    }

}