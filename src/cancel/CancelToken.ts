import Cancel from "./Cancel";

export default class CancelToken {
    promise: Promise<any>;
    reason: Cancel;

    constructor(executor: Function) {
        let resolvePromise: Function;
        this.promise = new Promise(function promiseExecutor(resolve) {
            resolvePromise = resolve;
        });

        let token = this;

        executor(function cancel(message: string) {
            if (token.reason) {
                return;
            }
            token.reason = new Cancel(message);
            resolvePromise(token.reason);
        })
    }

    throwIfRequested() {
        if (this.reason) {
            throw this.reason;
        }
    }

    static source() {
        let cancel: Function;
        let token = new CancelToken(function (c: Function) {
            cancel = c;
        });
        return {
            token,
            cancel: cancel
        }
    }
}


