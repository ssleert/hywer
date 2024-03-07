// aliases for bundle minification
let doc = document
let forEach = "forEach"
let addEventListener = "addEventListener"
let setAttribute = "setAttribute"
let _undefined
let replaceChildren = "replaceChildren"
let createElement = "createElement"
let createTextNode = "createTextNode"
let derived = "derived"
let binds = "binds"
let bind = "bind"
const instanceOf = (obj, type) => obj instanceof type
const isObjectReactiveValue = (obj) => obj?.__ReactiveValue__
const isObjectHTMLElement = (obj) => instanceOf(obj, HTMLElement)
const mapFilter = (map, mapper) => new Map([...map].filter(mapper))
const isUndefOrNull = (val) => val === _undefined || val === null

// reactive references garbage collector
export let gcCycleInMs = 5000
const gcValues = new Set()
let isGCsetTimeout

const reactiveGC = () =>
  isGCsetTimeout || (
    setTimeout(() => (
      gcValues[forEach](val => val.gc() || gcValues.delete(val)),
      isGCsetTimeout = false
    ), gcCycleInMs),
    isGCsetTimeout = true
  )

// ====== reactive values contructing ======

// helpers
export const effect = (fn, values) => values[forEach](
  val => val.sub = () => fn(values)
)
export const derive = (fn, values) => values[forEach](
  val => val.derive(() => fn(values))
)

export const ref = value => {
  const reactive = {
    __ReactiveValue__: true,
    [binds]: new Map(),
    [derived]: new Map(),
    subs: new Set(),
    oldVal: value,

    get val() {
      return value
    },
    set val(nextValue) {
      nextValue == value || setTimeout(() => (
        this.oldVal = value,
        value = nextValue,
        this.react()
      ))
    },

    set sub(fn) {
      this.subs.add(fn)
    },
    clean() {
      this.subs = new Set
    },

    derive(fn) {
      let derivedValue = ref(fn(value, this.oldVal))
      this[derived].set(
        derivedValue,
        (val, oldVal) => derivedValue.val = fn(val, oldVal)
      )

      return derivedValue
    },

    gc() {
      let _binds = this[binds]
      let _derived = this[derived]

      _binds = mapFilter(_binds, ([bind, _]) => bind.isConnected)
      _derived = mapFilter(_derived, ([derive, _]) => derive.gc())

      return _derived.size + _binds.size != 0
    },

    rebind(oldElement, element, fn) {
      this[binds].delete(oldElement)
      this[binds].set(element, fn)
      reactiveGC()
    },

    [bind](element, fn) {
      this[binds].set(element, fn)
      gcValues.add(this)
      reactiveGC()
    },

    react() {
      let _this = this

      _this.subs[forEach](sub => sub(value, _this.oldVal))
      _this[derived][forEach](derive => derive(value, _this.oldVal))
      _this[binds][forEach](bind => bind(value, _this.oldVal))
    },
  }

  gcValues.add(reactive)
  return reactive
}

// ====== element processing =======
const makeEventListener = (element, key, val) =>
  isObjectReactiveValue(val)
    ? (val[bind](element, (val, oldVal) => {
      element.removeEventListener(key, oldVal)
      element[addEventListener](key, val)
    }),
      element[addEventListener](key, val.val))
    : element[addEventListener](key, val)

const setAttributes = (element, key, val) =>
  val === true
    ? element[setAttribute](key, "")
    : val === false || isUndefOrNull(val)
      ? element.removeAttribute(key)
      : element[setAttribute](key, val)

const makeAttribute = (element, key, val) =>
  isObjectReactiveValue(val)
    ? (val[bind](element, val => setAttributes(element, key, val)),
      setAttributes(element, key, val.val))
    : setAttributes(element, key, val)

const addAttributes = (element, attributes) =>
  Object.entries(attributes)[forEach](
    ([key, val]) => (key = key.toLowerCase(),
      key.substring(0, 2) == "on"
        ? makeEventListener(element, key.slice(2), val)
        : makeAttribute(element, key, val)))

const makeReactiveElementFromReactiveObject = (obj) => {
  let element
  let value = obj.val

  if (isObjectHTMLElement(value)) {
    element = value

    let replaceElement = (val, oldVal) => {
      element.replaceWith(val)
      element = val
      obj.rebind(oldVal, element, replaceElement)
    }
    obj[bind](element, replaceElement)
  } else if (instanceOf(value, Array)) {
    element = doc[createElement]("div")
    let processedChildren = []
    let processChildren = val => appendChildren(
      e => processedChildren.push(e), val
    )

    obj[bind](element, val => {
      processedChildren.length = 0
      processChildren(val)
      element[replaceChildren](...processedChildren)
    })
    processChildren(value)
    element[replaceChildren](...processedChildren)
  } else {
    element = doc[createTextNode](value)
    obj[bind](element, val => element.nodeValue = val)
  }

  return element
}

const makeElementFromObject = obj =>
  isObjectReactiveValue(obj)
    ? makeReactiveElementFromReactiveObject(obj)
    : isObjectHTMLElement(obj) || instanceOf(obj, Text)
      ? obj
      : doc[createTextNode](obj)

const appendChildren = (append, children) =>
  [children].flat(Infinity)[forEach](
    e => isUndefOrNull(e) || append(makeElementFromObject(e))
  )

export const Fragment = {}
export const makeElement = (tag, attributes, ...children) => {
  children ??= []

  if (tag == Fragment) {
    let processedChildren = []
    appendChildren(e => processedChildren.push(e), children)
    return processedChildren
  }

  if (instanceOf(tag, Function)) {
    return tag({ children, ...attributes })
  }

  let element = doc[createElement](tag)
  addAttributes(element, attributes ?? 0)

  appendChildren(e => element.append(e), children)
  return element
}

export const jsx = (tag, { children, ...attributes }) => makeElement(tag, attributes, children ?? [])
export {
  jsx as jsxs,
  jsx as jsxDEV,
}

