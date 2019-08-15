export interface AxiosTransformer {
    (data: any, headers?: any): any;
}

export interface AxiosAdapter {
    timer: any;
    config: AxiosRequestConfig;

    init(config: AxiosRequestConfig): AxiosPromise<any>;
}

export interface AxiosBasicCredentials {
    username: string;
    password: string;
}

export interface AxiosProxyConfig {
    host: string;
    port: number;
    auth?: {
        username: string;
        password: string;
    };
    protocol?: string;
}

export type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'connect' | 'CONNECT'
    | 'trace' | 'TRACE'

export type ResponseType =
    | 'arraybuffer'
    | 'text'

export type DataType =
    | 'json'

export interface AxiosRequestConfig {
    url?: string;
    method?: Method | string;
    baseURL?: string;
    transformRequest?: AxiosTransformer | AxiosTransformer[];
    transformResponse?: AxiosTransformer | AxiosTransformer[];
    headers?: any;
    params?: any;
    paramsSerializer?: (params: any) => string;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    adapter?: Function;
    auth?: AxiosBasicCredentials;
    responseType?: ResponseType | string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    maxContentLength?: number;
    validateStatus?: (status: number) => boolean;
    maxRedirects?: number;
    socketPath?: string | null;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: AxiosProxyConfig | false;
    cancelToken?: CancelToken;
    transport?: any;
    responseEncoding?: any;
}

export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
}

export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON: Function
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {
}

export interface CancelStatic {
    new(message?: string): Cancel;
}

export interface Cancel {
    message: string;
}

export interface Canceler {
    (message?: string): void;
}

export interface CancelTokenStatic {
    new(executor: (cancel: Canceler) => void): CancelToken;

    source(): CancelTokenSource;
}

export interface WxRequestTask {
    abort(): void;

    offHeadersReceived(): void;

    onHeadersReceived(): void;
}

export interface CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;
    requestTask?: WxRequestTask | any;

    throwIfRequested(): void;
}

export interface CancelTokenSource {
    token: CancelToken;
    cancel: Canceler;
}

export interface AxiosInterceptorManager<V> {
    use(onFulfilled?: (value: V) => V | Promise<V>, onRejected?: (error: any) => any): number;

    forEach(fn: Function): void;

    eject(id: number): void;
}

export interface AxiosInstance {
    (config: AxiosRequestConfig): AxiosPromise;

    (url: string, config?: AxiosRequestConfig): AxiosPromise;

    defaults: AxiosRequestConfig;
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    };

    getUri(config?: AxiosRequestConfig): string;

    request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R>;

    get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;

    delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;

    head<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;

    post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;

    put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;

    patch<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
}

export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance;

    Cancel: CancelStatic;
    CancelToken: CancelTokenStatic;

    isCancel(value: any): boolean;

    all<T>(values: (T | Promise<T>)[]): Promise<T[]>;

    spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
}

export interface WxRequestSuccessFunc {
    (data: any, statusCode: number, header: any): any;
}

export interface WxRequestFailFunc {
    (): any;
}

export interface WxRequestCompeteFunc {
    (): any;
}

export interface WxRequestConfig {
    url: string,
    data?: any,
    header?: any,
    method?: Method,
    dateType?: string,
    responseType?: ResponseType,
    success: WxRequestSuccessFunc,
    fail: WxRequestFailFunc,
    complete: WxRequestCompeteFunc
}

export interface OnHeadersReceivedCallback {
    (header: any): any;
}

export interface WxRequestTask {
    abort(): any;

    offHeadersReceived(callback: Function): any;

    onHeadersReceived(callback: OnHeadersReceivedCallback): any;
}

export interface HttpOptions {
    path: string;
    method: Method | string;
    headers: any;
    agent: string;
    auth: any;
    socketPath?: string;
    hostname?: string;
    host?: string;
    port?: string | number;
    maxRedirects: number;
    maxBodyLength: number
}

declare const Axios: AxiosStatic;

export default Axios;