import { instanceOf, isObjectReactiveValue } from "../../hywer/alias.js";
import { ref } from "../../hywer/hywer.js";

const isObject = obj => 
  typeof obj == "object" && 
  obj !== null && 
  !instanceOf(obj, Array);

export const recRef = (obj) => {
  let refObj = {}

  for (let key in obj) {
    let val = obj[key];

    refObj[key] = isObjectReactiveValue(val)
      ? val
      : isObject(val)
        ? recRef(val)
        : val
  }

  return ref(refObj);
}

export const store = (obj) => {
  let refObj = recRef(obj);
  let proxyCache = new WeakMap();

  let proxyMethods = {
    get(target, key) {
      let reactiveValue = target.val[key]

      if (reactiveValue === undefined) {
        return;
      }

      if (isObject(reactiveValue.val)) {
        if (proxyCache.has(reactiveValue)) {
          return proxyCache.get(reactiveValue)
        }

        let proxyObject = new Proxy(reactiveValue, proxyMethods)
        proxyCache.set(reactiveValue, proxyObject)

        return proxyObject
      }

      return reactiveValue
    },
    set() { return; },
  }

  return new Proxy(refObj, proxyMethods);
}
