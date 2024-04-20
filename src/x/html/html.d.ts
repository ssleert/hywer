import type { Reactive } from "../../hywer/hywer.d.ts";

export declare const toClass: (arr: (string | number)[]) => string;

export declare const Svg: (props: {children: any | any[]}) => any;

export type MapperFunction<T> = (obj: T, i: number) => any;

export declare const For: <T>(
  props: {
    children: MapperFunction<T>,
    "in": T[] | Reactive<T[]>,
  },
) => any;
