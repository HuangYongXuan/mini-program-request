import createError from "./createError";
import {AxiosResponse} from "../config/HttpConfig";

export default function settle(resolve: Function, reject: Function, response: AxiosResponse) {
    let validateStatus = response.config.validateStatus;

    if (validateStatus || validateStatus(response.status)) {
        resolve(response);
    } else {
        reject(createError(
            'Request failed with status code ' + response.status,
            response.config,
            null,
            response.request,
            response
        ))
    }
}