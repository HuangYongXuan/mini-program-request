import utils from "../utils";

const cookie = (
    utils.isStandardBrowserEnv() ?
        (function standardBrowserEnv() {
            return {
                write: function write(name: string, value: any, expires?: number | string, path?: string, domain?: string, secure?: boolean) {
                    let cookie = [];
                    cookie.push(name + '=' + encodeURIComponent(value));

                    if (utils.isNumber(expires)) {
                        cookie.push('expires=' + new Date(expires).toUTCString());
                    }

                    if (utils.isString(path)) {
                        cookie.push('path=' + path);
                    }

                    if (utils.isString(domain)) {
                        cookie.push('domain=' + domain);
                    }

                    if (secure === true) {
                        cookie.push('secure');
                    }

                    document.cookie = cookie.join('; ');
                },

                read: function read(name: string) {
                    let match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
                    return (match ? decodeURIComponent(match[3]) : null);
                },

                remove: function remove(name: string) {
                    this.write(name, '', Date.now() - 86400000);
                }
            };
        })() :
        (function nonStandardBrowserEnv() {
            return {
                write: function write() {
                },
                read: function read(): any {
                    return null;
                },
                remove: function remove() {
                }
            };
        })()
);

export default cookie;

module.exports = cookie;