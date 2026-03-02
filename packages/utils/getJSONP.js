export async function getJSONP(endpoint, params = '') {
    const handlerName = 'handleData', requestParams = (params
        ? typeof params == "string"
            ? params
            : Object.entries(params).map(([k, v]) => k.toString() + '=' + v.toString()).join("&")
        : '') + "&callback=" + handlerName;
    var script, modifiedTopContext;
    return new Promise((resolve, _reject) => {
        script = document.createElement('script');
        modifiedTopContext = Object.defineProperty(window, handlerName, {
            value: resolve,
            enumerable: true,
            configurable: true
        });
        script.src = endpoint + '?' + requestParams;
        document.head.appendChild(script);
    })
        .finally(() => {
        document.head.removeChild(script);
        delete modifiedTopContext[handlerName];
    });
}
