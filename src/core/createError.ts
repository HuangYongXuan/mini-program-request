import enhanceError from "./enhanceError";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "../config/HttpConfig";

export default function createError(message: string, config: AxiosRequestConfig, code?: string, request?: any, response?: AxiosResponse) {
    let error = new ErrorMessage(message);

    return enhanceError(error, config, code, request, response);
}

export class ErrorMessage extends Error implements AxiosError {
    code: string;
    config: AxiosRequestConfig;
    isAxiosError: boolean;
    request: any;
    response: AxiosResponse<any>;
    stack: string;
    toJSON: Function;
    message: string;

    constructor(message: string) {
        super(message);
        this.message = message;
    }
}