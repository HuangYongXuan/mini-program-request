import utils from "../utils";

function encode(val: string): string {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
}

export default function buildURL(url: string, params?: object, paramsSerializer?: Function): string {
    if (!params) {
        return url;
    }

    let serializedParams;
    if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
    } else {
        let parts: any[] = [];

        utils.forEach(params, function serialize(val: any, key: any) {
            if (val === null || typeof val === 'undefined') {
                return;
            }

            if (utils.isArray(val)) {
                key = key + '[]';
            } else {
                val = [val];
            }

            utils.forEach(val, function parseValue(v: any) {
                if (utils.isDate(v)) {
                    v = v.toISOString();
                } else if (utils.isObject(v)) {
                    v = JSON.stringify(v);
                }
                parts.push(encode(key) + '=' + encode(v));
            });
        });

        serializedParams = parts.join('&');
    }

    if (serializedParams) {
        let hashMarkIndex = url.indexOf('#');
        if (hashMarkIndex !== -1) {
            url = url.slice(0, hashMarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
}