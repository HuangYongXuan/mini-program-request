export default function deprecatedMethod(method: string, instead?: string, docs?: string) {
    try {
        console.warn(
            'DEPRECATED method `' + method + '`.' +
            (instead ? ' Use `' + instead + '` instead.' : '') +
            ' This method will be removed in a future release.');

        if (docs) {
            console.warn('For more information about usage see ' + docs);
        }
    } catch (e) {

    }
}