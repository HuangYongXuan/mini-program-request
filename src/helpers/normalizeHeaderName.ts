import utils from "../utils";

export default function normalizeHeaderName(headers: any, normalizedName: string) {
    utils.forEach(headers, function (value: string, name: string) {
        if (name !== normalizedName && name.toLocaleUpperCase() === normalizedName.toLocaleUpperCase()) {
            headers[normalizedName] = value;
            delete headers[name];
        }
    })
}