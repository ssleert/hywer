import { ref } from "../../hywer/hywer.js"

// set reactive value with async function result
export const future = (fn, defaultValue) => {
  let value = ref(defaultValue)  
  fn().then(val => value.val = val)
  return value
}
