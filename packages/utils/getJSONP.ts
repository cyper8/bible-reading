export async function getJSONP<T>(endpoint: string, params: string | Object = '') {
  const handlerName = 'handleData', requestParams = (params
    ? typeof params == "string"
      ? params
      : Object.entries(params).map(([k, v]) => k.toString() + '=' + v.toString()).join("&")
    : '') + "&callback=" + handlerName;
  var script: HTMLScriptElement;
  return new Promise<T>((resolve, _reject) => {
    script = document.createElement('script');
    if (handlerName in window) delete window[handlerName];
    Object.defineProperty(window, handlerName, {
      value: resolve,
      enumerable: true,
      configurable: true
    });
    script.src = endpoint + '?' + requestParams;
    document.head.appendChild(script);
  })
    .finally(() => {
      document.head.removeChild(script);
    })
}