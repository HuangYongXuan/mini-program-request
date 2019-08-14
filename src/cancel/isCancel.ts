import Cancel from "./Cancel";

export default function isCancel(value: Cancel) {
    return !!(value && value.__CANCEL__);
}