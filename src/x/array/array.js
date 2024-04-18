import { ref } from "../../hywer/hywer.js"

export const reactiveArrayRender = (reactiveArray, elem, mapper) => {
  let parentElement = elem;
  let objectsToElementsMapping = new Map();

  let updateChildren = (val, oldVal) => {
    let objectIsUsed = new Map();
    val.forEach((obj, i) => {
      const elementAndIndex = objectsToElementsMapping.get(obj);
      if (!elementAndIndex) {
        const elementFromObject = mapper(obj, i);
        parentElement.insertBefore(elementFromObject, parentElement.children[i]);

        objectsToElementsMapping.set(obj, {
          index: i,
          element, elementFromObject,
        });
        objectIsUsed.set(obj, true)
      }

      if (elementAndIndex.index != i) {
        parentElement.insertBefore(elementAndIndex.element, parentElement.children[i])
        elementAndIndex.index = i
      }

      objectIsUsed.set(obj, true)
    })

    objectsToElementsMapping.forEach((val, key) => {
      if (!objectIsUsed.has(key)) {
        val.element.remove()
        objectsToElementsMapping.delete(key)
      }
    })
  }
  reactiveArray.bind(parentElement, updateChildren)

  reactiveArray.val.forEach((obj, i) => {
    let e = mapper(obj, i);

    parentElement.append(e)

    objectsToElementsMapping.set(obj, {
      index: i,
      element: e,
    });
  })
  return parentElement
}

//<ArrayRender in={arr} elem={<div></div>}>
//  (e) => {
//    return <h1>e</h1>
//  }
//</ArrayRender>
export const ArrayRender = ({ children, "in": inObject, elem }) => {
  let arrayRenderElement = reactiveArrayRender(inObject, elem, children[0]);
 
  return arrayRenderElement;
}
