import {
  _undefined,
  addEventListener,
  bind,
  binds,
  createElement,
  createTextNode,
  derived,
  doc,
  forEach,
  instanceOf,
  isObjectElement,
  isObjectReactiveValue,
  isUndefOrNull,
  mapFilter,
  replaceChildren,
  setAttribute,
} from "./alias.js";

export let gcCycleInMs = 5000; // time minimum time betwen gc executions
const gcValues = new Set(); // set of tracked reactive values
let isGCsetTimeout; // is garbage collector already queued

// garbage collect unused reactive references
const reactiveGC = () =>
  // return if gc already queued
  isGCsetTimeout || (
    setTimeout(() => (
      // call .gc() on all elements added to gcValues
      // if .gc() return false, value is unused
      // now we can remove it from gcValues
      gcValues[forEach]((val) => val.gc() || gcValues.delete(val)),
        isGCsetTimeout = false // gc completed
    ), gcCycleInMs), isGCsetTimeout = true // gc queued
  );

// ====== reactive values contructing ======

// add function to subs of many reactive values
export const effect = (fn, refs) =>
  refs[forEach](
    (val) => val.sub = () => fn(refs),
  );

// derive new reactive value from many others
export const derive = (fn, refs) => {
  const reactiveValue = makeReactiveValue(fn(refs));

  refs[forEach](
    (val) =>
      val[derived].set(reactiveValue, () => reactiveValue.val = fn(refs)),
  );

  return reactiveValue;
};

const makeReactiveValue = (value) => ({
  __ReactiveValue__: true, // magic value to identificate reactive value
  [binds]: new Map(), // elements connected to the reactive value and their callbacks
  [derived]: new Map(), // reactive values that derives from this
  subs: new Set(), // functions that executes on every reactive value change
  oldVal: value, // old value

  // getter of current value
  get val() {
    return value;
  },

  // set new value
  set val(nextValue) {
    // skip if new value equals current value
    nextValue == value || (
      // queue new macro task to call reaction
      this.oldVal = value,
        value = nextValue,
        queueMicrotask(() => (
          // TODO: add check if captured value is same as current value
          //       return without callback execution
          this.react()
        ))
    );
  },

  // set new subscriber
  // example: a.sub = (val) => console.log(val)
  set sub(fn) {
    this.subs.add(fn);
  },

  // derive new reactive value from current value
  derive(fn) {
    // make new reactive value from fn() result
    let derivedValue = makeReactiveValue(fn(value, this.oldVal));

    // set new reactive value as derived from current value
    this[derived].set(
      derivedValue,
      (val, oldVal) => derivedValue.val = fn(val, oldVal),
    );

    return derivedValue;
  },

  // remove references to not connected to DOM Elements and reactive values
  //
  // --- explanation ---
  //
  // example of code:
  //   const App = () => {
  //     const count = ref(0)
  //     const doubleCount = count.derive(val => val * 2)
  //
  //     return <>
  //       {count} * 2 = {doubleCount}
  //       <button onClick={() => count.val++}>+</button>
  //       <button onClick={() => count.val--}>-</button>
  //     </>
  //   }
  //
  // 1) current references tree in example code (simplified):
  //
  //          count
  //         /     \
  //      element1  doubleCount
  //        /        \
  //      DOM        element2
  //                   \
  //                   DOM
  //
  // 2) references tree if doubleCount element removed from DOM:
  //
  //          count
  //         /     \
  //      element1  doubleCount
  //        /        \
  //      DOM        element2
  //
  //
  // 3) references tree after gc:
  //
  //          count
  //          /
  //       element1     doubleCount
  //         /
  //       DOM           element2
  //
  //
  //  now js runtime gc can safely remove doubleCount and element2
  //  because they no longer have references to themselves
  gc() {
    // call gc() for all derived
    this[derived] = mapFilter(this[derived], ([derive, _]) => derive.gc());

    // remove all not not connected to DOM Elements
    this[binds] = mapFilter(this[binds], ([bind, _]) => bind.isConnected == true);

    // if one of the maps is not empty, we return true
    return this[derived].size + this[binds].size != 0;
  },

  // remove old bind to element
  // and make bind to new element
  rebind(oldElement, element, fn) {
    this[binds].delete(oldElement);
    this[binds].set(element, fn);
    reactiveGC();
  },

  // bind to Element
  [bind](element, fn) {
    this[binds].set(element, fn);
    // queue gc
    reactiveGC();
  },

  // call all subscribers, binded to elements functions and derived functions
  react() {
    let _this = this; // alias

    let exec = (fn) => fn(value, _this.oldVal);

    _this.subs[forEach]((fn) => exec(fn));
    _this[derived][forEach]((fn) => exec(fn));
    _this[binds][forEach]((fn) => exec(fn));
  },
});

// create new reactive value
export const ref = (value) => {
  const reactive = makeReactiveValue(value);

  // add reactive value to garbage collected values
  gcValues.add(reactive);
  return reactive;
};

// ====== element processing =======
const makeEventListener = (element, key, val) =>
  // if reactive value
  isObjectReactiveValue(val)
    ? ( // bind event listener updater to element
      val[bind](element, (val, oldVal) => {
        // remove old event listener
        element.removeEventListener(key, oldVal);
        element[addEventListener](key, val);
      }), element[addEventListener](key, val.val)
    )
    : element[addEventListener](key, val); // set event listener

// process attribute set
const setAttributes = (element, key, val) =>
  // if val of attribute is strictly true
  val === true
    ? element[setAttribute](key, "") // set to empty attribute, usefull for <button disabled>
    : val === false || isUndefOrNull(val) // if strictly false or null/undefined
    ? element.removeAttribute(key) // remove attribute
    : element[setAttribute](key, val); // in other ways set to val string

// append new attribute to element by key with val
const makeAttribute = (element, key, val) =>
  // if value of attribute is a reactive value
  isObjectReactiveValue(val)
    ? ( // bind attribute updater to element
      val[bind](element, (val) => setAttributes(element, key, val)),
        setAttributes(element, key, val.val)
    )
    : setAttributes(element, key, val); // simply set attribute to element

// iterate over all attributes and assign
// attribute or event listener to element
const addAttributes = (element, attributes) =>
  // destruct object to array of [key, val] tuples
  // and iterate over it
  Object.entries(attributes)[forEach](
    ([key, val]) => (key = key.toLowerCase(), // convert every key to lower case
      key.substring(0, 2) == "on" // if starts with on process it as event listener
        ? makeEventListener(element, key.slice(2), val)
        : makeAttribute(element, key, val)),
  ); // process as attribute

// make new self-updating Element or Text node from reactive value
const makeReactiveElementFromReactiveObject = (obj) => {
  // created element var
  // returned at the end
  let element;

  // alias
  let value = obj.val;

  // check is object Element or Text node
  if (isObjectElement(value)) {
    // if object already an Element or Text node
    // we assign it value to element
    element = value;

    // make new lambda that replaces value of element
    // with new value of reactive value
    let replaceElement = (val, oldVal) => {
      element.replaceWith(val); // replace element with new Element
      element = val; // coz .replaceWith() invalidates old reference to element
      // we should assign new reference to it

      // and finaly we can rebind reactive value
      // from old element to new element
      obj.rebind(oldVal, element, replaceElement);
    };

    // bind replaceElement to reactive value
    obj[bind](element, replaceElement);
  } else if (instanceOf(value, Array)) { // check is object an Array
    // TODO: reimplement without phantom div

    // create new div
    element = doc[createElement]("div");

    let processedChildren = [];
    let processChildren = (val) =>
      appendChildren(
        (e) => processedChildren.push(e),
        val,
      ); // process all array values with appendChildren()

    // bind object to element
    obj[bind](element, (val) => {
      // clear array
      processedChildren.length = 0;
      processChildren(val);

      // TODO: reimplement without array unpack.
      //       in some cases it can throw error
      //       with something like 'stack size exceeded'
      element[replaceChildren](...processedChildren);
    });
    processChildren(value);
    element[replaceChildren](...processedChildren);
  } else {
    // in other cases we simply created new Text node
    // and reassign .nodeValue to new val
    element = doc[createTextNode](value);
    obj[bind](element, (val) => element.nodeValue = val);
  }

  // and finally return element
  return element;
};

// Make new Element or Text node
// from Object value
const makeElementFromObject = (obj) =>
  // check is object reactive element
  isObjectReactiveValue(obj)
    ? makeReactiveElementFromReactiveObject(obj) // make new element from reactive value
    : isObjectElement(obj) // if object already an Element or Text node
    ? obj // return it
    : doc[createTextNode](obj); // make new Text node from object

// Convert every child of children to Element or Text node
// and pass it to callback
const appendChildren = (append, children) =>
  // collapse all sub arrays to single array
  // we dont know how many nested arrays we have here
  // so we should use Infinity
  [children].flat(Infinity)[forEach](
    // skip append if object null/undefined
    (child) => isUndefOrNull(child) || append(makeElementFromObject(child)),
  );

// Fragment UNIQUE object
export const Fragment = {};

// create new Element with children
// react createElement compatible function
//
// params:
//   tag - string/Fragment/function
//         if string create Element with this tag
//         if Fragment simply doesnt create any Element
//         if function we can treat it as 'Functional Component'
//   attributes - struct with Element attributes
//   children - array of child Elements or reactive values
export const makeElement = (tag, attributes, ...children) => {
  // if element is null/undefined assign empty array to it
  children ??= [];
  // if array is empty .forEach() and .map() goes to no op

  // if tag == Fragment we shouldnt create any Element
  // and simply return processed children
  if (tag == Fragment) {
    let processedChildren = [];
    // process children with callback
    appendChildren((e) => processedChildren.push(e), children);
    return processedChildren;
  }

  // if tag is a Function we can treat it as 'Functional Component'
  if (instanceOf(tag, Function)) {
    // pack new struct with children and attributes
    return tag({ children: [children].flat(Infinity), ...attributes });
  }

  // create new element with tag string
  let element = doc[createElement](tag);
  addAttributes(element, attributes ?? 0); // and add attributes to it

  // append children through callback
  appendChildren((e) => element.append(e), children);
  return element;
};

// react 17+ jsx-runtime compatibility
export const jsx = (tag, { children, ...attributes }) =>
  makeElement(tag, attributes, children ?? []);
export { jsx as jsxDEV, jsx as jsxs }; // jsxDEV and jsxs aliases
