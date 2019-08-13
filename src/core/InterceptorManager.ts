import utils from "../utils";

class InterceptorManager {
    handlers: any[];

    constructor() {
        this.handlers = [];
    }

    /**
     * 添加拦截器
     * @param fulfilled
     * @param rejected
     */
    use(fulfilled: Function, rejected: Function) {
        // @ts-ignore
        this.handlers.push({
            fulfilled: fulfilled,
            rejected: rejected
        });
        return this.handlers.length - 1;
    }

    /**
     * 删除拦截器
     *
     * @param id
     */
    eject(id: number) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }

    forEach(fn: Function) {
        utils.forEach(this.handlers, function (h: any) {
            if (h !== null) fn(h);
        })
    }
}