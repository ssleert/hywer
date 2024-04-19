import { instanceOf, isObjectReactiveValue } from "../../hywer/alias.js";
import { ref } from "../../hywer/hywer.js";

const isObject = obj => 
  typeof obj == "object" && 
  obj !== null && 
  !instanceOf(obj, Array) &&
  !isObjectReactiveValue(obj);

export const recRef = (obj) => {
  let refObj = {}

  for (let key in obj) {
    let val = obj[key];

    refObj[key] = isObject(val)
      ? recRef(val)
      : isObjectReactiveValue(val) 
        ? val
        : ref(val);
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
    set() {
      throw Error("Reactive values in the store are immutable. maybe you want to mutate the .val?")
    },
  }

  return new Proxy(refObj, proxyMethods);
}
