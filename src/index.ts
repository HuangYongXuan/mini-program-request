import {AxiosRequestConfig} from "./config/HttpConfig";
import Axios from "./core/Axios";
import bind from "./helpers/bind";
import utils from "./utils";
import defaults from "./defaults";
import mergeConfig from "./core/mergeConfig";

/**
 *
 * @param defaultConfig
 */
function createInstance(defaultConfig: AxiosRequestConfig | object): any {
    let context = new Axios(defaultConfig);
    let instance = bind(Axios.prototype.request, context);

    utils.extend(instance, Axios.prototype, context);

    utils.extend(instance, context);

    return instance;
}

const axios = createInstance(defaults);
// @ts-ignore
axios.Axios = Axios;

// Factory for creating new instances
// @ts-ignore
axios.create = function create(instanceConfig: AxiosRequestConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
// @ts-ignore
axios.Cancel = require('./cancel/Cancel').default;
// @ts-ignore
axios.CancelToken = require('./cancel/CancelToken').default;
// @ts-ignore
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// @ts-ignore
axios.all = function all(promises) {
    return Promise.all(promises);
};
// @ts-ignore
axios.spread = require('./helpers/spread');
// @ts-ignore
module.exports = axios;