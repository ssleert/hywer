import {
  forEach,
  insertBefore,
  bind,
} from "../../hywer/alias.js"

const genElementAndIndex = (i, e) => ({
  index: i,
  element: e,
})

export const reactiveArrayRender = (reactiveArray, elem, mapper) => {
  let parentElement = elem;
  let objectsToElementsMapping = new Map();
  let objectIsUsed = new Map();

  let updateChildren = (val) => {
    for (let i in val) {
      let obj = val[i]

      let elementAndIndex = objectsToElementsMapping.get(obj);
      if (!elementAndIndex) {
        let elementFromObject = mapper(obj, i);
        parentElement[insertBefore](elementFromObject, parentElement.children[i]);

        objectsToElementsMapping.set(obj, genElementAndIndex(i, elementFromObject));
        objectIsUsed.set(obj, true)

        continue
      }

      if (elementAndIndex.index != i) {
        parentElement[insertBefore](elementAndIndex.element, parentElement.children[i])
        elementAndIndex.index = i
      }

      objectIsUsed.set(obj, true)
    }

    objectsToElementsMapping[forEach]((val, key) => {
      if (!objectIsUsed.has(key)) {
        val.element.remove()
        objectsToElementsMapping.delete(key)
      }
    })

    objectIsUsed.clear()
  }
  reactiveArray[bind](parentElement, updateChildren)

  for (let i in reactiveArray.val) {
    let obj = reactiveArray.val[i]

    let e = mapper(obj, i);

    parentElement.append(e)

    objectsToElementsMapping.set(obj, genElementAndIndex(i, e));
  }
  return parentElement
}

//<ArrayRender in={arr} elem={<div></div>}>
//  (e) => {
//    return <h1>e</h1>
//  }
//</ArrayRender>
export const ArrayRender = ({ children, "in": inObject, elem }) => {
  let arrayRenderElement = reactiveArrayRender(inObject, elem, children);
 
  return arrayRenderElement;
}
