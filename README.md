<div align="center">

![Logo](https://github.com/ssleert/hywer/assets/68077937/e6696b6a-10fb-4df0-9da9-409a675873b6)

## 🥢 **World Smallest**, `JSX` based, Fine Grained Reactive `UI` Library.

</div>

[Hywer](https://github.com/ssleert/hywer) is a **World Smallest**<sup>1kb</sup>, **JSX** based, Fine Grained Reactive **UI** Library.
Hywer uses **native browser apis** like `createElement`, `createTextNode` and reactively update its content. 
In Hywer all you **JSX** components like `<Component/>` is a **native HTMLElement** objects.
Hywer updates `DOM` **granularly** and **asynchronously** without slowing down your code.

## [Getting Started](https://github.com/ssleert/hywer/wiki)

## At a glance
```jsx
import { ref } from "hywer"

const App = () => {
  const count = ref(0)
  const doubleCount = count.derive(val => val * 2)

  return <>
    🧡 {doubleCount}
    <button onClick={() => count.val++}>👍</button>
    <button onClick={() => count.val--}>👎</button>
  </>
}

document.getElementById("app").append(...<App />)
```

## Key Features
- 1kb bundle size in `brotli` / `gzip`.
- `JSX` support **out of the box**.
- No virtual DOM.
- Fine grained updates to real DOM.
- Declarative UI programming with reactive states.
- Quick to learn. No component lifecycles or other super complicated crap.
- Don't pay for what you don't use. 0.7kb bundle size without reactive state
- Debuggable. `<div>` is a real div in DOM. Use your browser dev tools to inspect rendering.
- Rerender free mental model.
- Static reactive dependencies for best performance and async execution.
- `UglifyJS` / `closure compiler` ready code base.
- Incredibly Small & Understandable code base.
- Support of existing infrastructure tools like `webpack` `babel` `vite` `swc` `bun`, with little configuration.

## Why Hywer?
### Performant
Carefully optimized for performance and bundle size. Hywer performance indistinguishable from vanilla js. 
Hywer provides very little layer of abstraction between your code and browser apis.
Reactive value dependecies is static and execution is async without main thread blocking.

### No Magic
Hywer behavior is predictable and simple to understand without any magic values or runtime dependency tracking.

### Unopinionated
Hywer only does one thing and does it well. 
Hywer does not dictate to you the style of code, where you use it, whether to use jsx, or the build system.
You can use Hywer with `babel`, `swc`, `webpack` or what you want.
You can even use Hywer with another framework if you want.
Hywer is just a lib that generates HTMLElement.

### Anything
Hywer can be anything you want it to be, depending on your desires, 
Hywer is open to your suggestions and pull rеquestions. 
You are the one who can make Hywer better!

### Browser support
Hywer support all mainline browser and any runtime with DOM api like Deno or Node.

## More
At this point Hywer is in a very early stage of development so feel free to open an issue with your problems and suggestions.


<div align="center">

<br/>
<hr/>

### made with ❤️ by ssleert
  
</div>
