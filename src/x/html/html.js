import {
  doc,
  createElement,
  isObjectReactiveValue,
} from "../../hywer/alias.js"

// convert array to html class
export const toClass = (arr) => arr.join(" ")

export const Svg = ({ children }) => {
  let wrapperElement = doc[createElement]("div")
  wrapperElement.innerHTML = children[0].outerHTML
  return wrapperElement.children[0]
}

export const For = ({ children, "in": arr}) => {
  if (isObjectReactiveValue(arr)) {
    return arr.derive(val => val.map(children[0]))
  }
  return arr.map(children[0])
}
