import {AxiosError, AxiosRequestConfig, AxiosResponse} from "../config/HttpConfig";

export default function enhanceError(error?: AxiosError, config?: AxiosRequestConfig, code?: string, request?: any, response?: AxiosResponse) {
    error.config = config;
    if (code) {
        error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function () {
        return {
            // Standard
            message: this.message,
            name: this.name,
            // Microsoft
            description: this.description,
            number: this.number,
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            // Axios
            config: this.config,
            code: this.code
        }
    };
    return error;
}