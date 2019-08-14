export default function spread(fn: Function) {
    return function (arr: any) {
        return fn.apply(null, arr);
    }
}