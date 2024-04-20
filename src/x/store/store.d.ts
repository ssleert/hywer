import type { Reactive } from "../../hywer/hywer.d.ts"

export type RecReactive<T> = Reactive<{
  [P in keyof T]:
    T[P] extends Reactive<any>
      ? T[P]
      : T[P] extends object
        ? T[P] extends Array<any>
          ? Reactive<T[P]>
          : RecReactive<T[P]>
        : Reactive<T[P]>;
}>;

export type RecReactiveProxy<T> = {
  [P in keyof T]:
    T[P] extends Reactive<any>
      ? T[P]
      : T[P] extends object
        ? T[P] extends Array<any>
          ? Reactive<T[P]>
          : RecReactiveProxy<T[P]>
        : Reactive<T[P]>;
};

export declare const recRef: <T extends object>(
  obj: T,
) => RecReactive<T>;

export declare const store: <T extends object>(
  obj: T,
) => RecReactiveProxy<T>;
