export default class Cancel {
    message: string;
    __CANCEL__: boolean;

    constructor(message: string) {
        this.message = message;
    }

    toString() {
        return 'Cancel' + (this.message ? ': ' + this.message : '');
    }
};

Cancel.prototype.__CANCEL__ = false;