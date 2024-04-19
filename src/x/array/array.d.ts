import type { Reactive } from "../../hywer/hywer.d.ts"

export type MapperFunction<T> = (obj: T, i: number) => any;

export declare const reactiveArrayRender: <T extends any>(
  reactiveArray: Reactive<T[]>,
  elem: any,
  mapper: MapperFunction<T>,
) => any;

export interface ArrayRenderProps<T> {
  children: MapperFunction<T>,
  "in": Reactive<T[]>,
  elem: any,
};

export declare const ArrayRender: <T>(
  props: ArrayRenderProps<T>,
) => any;
