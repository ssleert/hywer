import type { Reactive } from "../../hywer/hywer.d.ts"

export declare const future: <T>(
  fn: () => Promise<T>, 
  defaultValue: T,
) => Reactive<T>;
