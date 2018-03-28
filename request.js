let interceptorsRequestCallback = null;
let interceptorsResponseCallback = null;

const request = {
    interceptorsRequest: (url, method, params, header) => {
        let config = {
            url: 'http://127.0.0.1:8090/api/' + url,
            method: method,
            params: params,
            header: header,
            dataType: 'json',
            responseType: 'text'
        };
        if (interceptorsRequestCallback instanceof Function) {
            config = interceptorsRequestCallback(config);
        }
        return config;
    },
    interceptorsResponse: (error) => {
        if (interceptorsResponseCallback instanceof Function) {
            interceptorsResponseCallback(error);
        }
    },
    create: (url, method, params, header) => {
        let config = request.interceptorsRequest(url, method, params, header);
        return new Promise((resolve, reject) => {
            wx.request({
                url: config.url,
                data: config.params,
                header: config.header,
                method: config.method,
                dataType: config.dataType,
                responseType: config.responseType,
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res);
                    } else {
                        request.interceptorsResponse(res);
                        reject(res);
                    }
                },
                fail: (res) => {
                    request.interceptorsResponse(res);
                }
            });
        });
    },
    'get': (url, params) => {
        return request.create(url, 'GET', params);
    },
    'post': (url, params, header) => {
        return request.create(url, 'POST', params, header);
    },
    'delete': (url, params) => {
        return request.create(url, 'DELETE', params);
    },
    'head': (url, params) => {
        return request.create(url, 'HEAD', params);
    },
    'options': (url, params) => {
        return request.create(url, 'OPTIONS', params);
    },
    'put': (url, params) => {
        return request.create(url, 'PUT', params);
    },
    'patch': (url, params) => {
        return request.create(url, 'PATCH', params);
    },
    registerInterceptorsRequest: (callback) => {
        interceptorsRequestCallback = callback;
    },
    registerInterceptorsResponse: (callback) => {
        interceptorsResponseCallback = callback;
    }
};

export default request;