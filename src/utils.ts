const toString = String.prototype.toString;

/**
 * 判断是否是数组
 * @param val
 */
function isArray(val: any) : boolean {
    return toString.call(val) === '[object Array]';
}


function forEach(obj: any, fn?: Function) {
    if (obj === null || typeof obj === 'undefined') return;
    if (typeof obj !== 'object') {
        obj = [obj]
    }
    if (isArray (obj)){
        for (let i = 0; i < obj.length; i++) {
            fn.call(null, obj[i], i, obj)
        }
    } else {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                fn.call(null, obj[key], key, obj);
            }
        }
    }
}

export default {
    forEach,
    isArray
}
