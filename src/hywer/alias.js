// ONLY FOR HYWER INTERNALS AND EXTENSIONS
// IT IS NOT A PUBLIC API

// aliases for bundle minification
export let doc = document

// uses let coz google closure compiler inline
// const values of base type like string/number/boolean
export let forEach = "forEach"
export let addEventListener = "addEventListener"
export let replaceChildren = "replaceChildren"
export let setAttribute = "setAttribute"
export let _undefined // funny alias for undefined)
export let createElement = "createElement"
export let createTextNode = "createTextNode"
export let derived = "derived"
export let binds = "binds"
export let bind = "bind"

// super simple utility functions
export const instanceOf = (obj, type) => obj instanceof type;
export const isObjectReactiveValue = (obj) => obj?.__ReactiveValue__;
export const isObjectElement = (obj) => instanceOf(obj, HTMLElement) || instanceOf(obj, Text) || instanceOf(obj, SVGElement);
export const isUndefOrNull = (val) => val === _undefined || val === null;
