import {AxiosRequestConfig, WxRequestTask} from "../config/HttpConfig";

class HttpAdapter {
    config: AxiosRequestConfig;
    private task: WxRequestTask;

    constructor(config: AxiosRequestConfig) {
        this.config = config;
    }

    open() {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            this.task = wx.request({
                url: this.config.url,
                data: this.config.data,
                header: this.config.headers,
                method: this.config.method.toLocaleUpperCase,
                dateType: 'json',
                responseType: this.config.responseType,
                success: (data: any, statusCode: number, header: any) => {
                    let response = {
                        data: data,
                        status: statusCode,
                        header: header,
                        config: this.config
                    };
                    if (statusCode >= 200 || statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                },
                fail: () => {
                    reject(new Error('Network Error'))
                },
                complete: () => {
                }
            });
        });
    }
}