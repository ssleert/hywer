// i am really too stupid to make it fully typed

export type ReactiveSubscriber<T, Y> = (val: T, oldVal: T) => Y
export interface Reactive<T> {
  readonly subs: Set<ReactiveSubscriber<T, void>>;
  oldVal: T;
  val: T;
  sub: ReactiveSubscriber<T, void>;
  derive: <Y>(fn: ReactiveSubscriber<T, Y>) => Reactive<Y>;
  react: () => void;
}

export declare let gcCycleInMs: number;

export declare const effect: <T extends Reactive<any>[]>(
  fn: (refs: T) => void,
  refs: [...T],
) => void;

export declare const derive: <T extends Reactive<any>[], Y>(
  fn: (refs: T) => Y,
  refs: [...T],
) => Reactive<Y>;

export declare const ref: <T>(value: T) => Reactive<T>;

export type FragmentType = {
  __UniqueFragmentIdentifierDontTouchPlz__: true
}
export declare const Fragment: FragmentType;

export type HywerElement = HTMLElement | Text;
export type HywerElements<T> = T extends FragmentType
  ? HywerElement[]
  : HywerElement

export type HywerComponent = (props: object) => HywerElement | HywerElement[]
export type HywerTag = string | FragmentType;

export declare const makeElement: <T extends HywerTag | HywerComponent>(
  tag: T,
  attributes: Record<string, unknown> | null,
  ...children?: any[]
) => HywerElements<T>;

// i dont really understand how JSX typing works in typescript
// help me plz
export declare namespace JSX {
  interface IntrinsicElements {
    [element: string]: unknown
  };
  interface IntrinsicAttributes {
    key?: string | number | symbol;
  };
  interface Element extends HywerElement {
    // stupid fix coz typescript treat jsx Fragments as JSX.Element
    // TODO: find way to do this better
    [Symbol.iterator](): Iterator
  }

  interface ElementAttributesProperty {
    props: object;
  }
  interface ElementChildrenAttribute {
    children: any[] | any;
  }
}
