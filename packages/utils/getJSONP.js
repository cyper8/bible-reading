export async function getJSONP(endpoint, params = '') {
    const handlerName = 'handleData', requestParams = (params
        ? typeof params == "string"
            ? params
            : Object.entries(params).map(([k, v]) => k.toString() + '=' + v.toString()).join("&")
        : '') + "&callback=" + handlerName;
    var script;
    return new Promise((resolve, _reject) => {
        script = document.createElement('script');
        if (handlerName in window)
            delete window[handlerName];
        Object.defineProperty(window, handlerName, {
            value: resolve,
            enumerable: true,
            configurable: true
        });
        script.src = encodeURI(endpoint + '?' + requestParams);
        document.head.appendChild(script);
    })
        .finally(() => {
        document.head.removeChild(script);
    });
}
