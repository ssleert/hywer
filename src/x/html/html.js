import {
  doc,
  createElement,
} from "../../hywer/alias.js"


// convert array to html class
export const toClass = (arr) => arr.join(" ")

export const Svg = ({ children }) => {
  let wrapperElement = doc[createElement]("div")
  wrapperElement.innerHTML = children[0].outerHTML
  return wrapperElement.children[0]
}
