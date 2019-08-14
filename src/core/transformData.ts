import utils from "../utils";
import {AxiosTransformer} from "../config/HttpConfig";

export default function transformData(data: any, headers: any, fns: AxiosTransformer | AxiosTransformer[]): object {
    utils.forEach(fns, function (fn: Function) {
        data = fn(data, headers)
    });
    return data;
}