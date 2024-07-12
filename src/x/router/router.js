import {
  addEventListener,
  doc,
  instanceOf,
  replaceChildren,
  isUndefOrNull,
  isObjectReactiveValue,
} from "../../hywer/alias.js";
import { makeElement } from "../../hywer/hywer.js";

let _children = "children"
let _null = null
let push = "push"
let length = "length"

let routes = [];
let currentRoute = {};
let routerElementId = "router__";

let callbackBeforeRoute;
let callbackAfterRoute;

const execView = (route) => (route.exec ? route.view() : route.view);
const pathToRegex = (path, withParams) =>
  new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(
      /:\w+/g,
      (withParams ? ":" : "") + "(.+)",
    ) + "$",
  );
const moreThenFirst = (_, i) => i >= 1;

const setCurrentRoute = () => {
  let path = location.pathname;
  let matches = routes.filter((route) => path.match(route.path));
  let match = matches[length] ? matches[0] : routes[0];
  currentRoute = {
    ...match,
    processedParams: Object.fromEntries(
      match.path
        .exec(path)
        ?.filter(moreThenFirst)
        ?.map((param, i) => [match.params[i], param]) || [],
    ),
  };
};

const renderRoute = (page) => {
  let routerElement = doc.getElementById(routerElementId);

  instanceOf(page, Array)
    ? routerElement[replaceChildren](...page)
    : routerElement[replaceChildren](page);
};

export const getParams = () => currentRoute.processedParams;

const navigate = async () => {
  callbackBeforeRoute && await callbackBeforeRoute();
  setCurrentRoute();
  renderRoute(execView(currentRoute));
  callbackAfterRoute && await callbackAfterRoute();
};

export const navigateTo = async (path, state) => {
  if (path == location.pathname) {
    return;
  }
  history.pushState(state, "", path);
  await navigate();
};

export const createRouterContext = (userRoutes, beforeRoute, afterRoute) => {
  window[addEventListener]("popstate", navigate)

  routes = [];
  let val;

  for (let path in userRoutes) {
    (val = userRoutes[path]),
      routes[push]({
        path: pathToRegex(path),
        params: pathToRegex(path, true)
          .exec(path)
          .filter(moreThenFirst),
        view: val,
        exec: instanceOf(val, Function),
      });
  }

  callbackBeforeRoute = beforeRoute
  callbackAfterRoute = afterRoute

  setCurrentRoute();
};

export const Router = ({ [_children]: _, ...attributes }) =>
  makeElement("div", {
    id: routerElementId,
    children: execView(currentRoute),
    ...attributes,
  });

const onClickLinkHandler = (path, state) => 
  async (e) => (e.preventDefault(), await navigateTo((isObjectReactiveValue(path) ? path.val : path), state))

export const Link = ({ [_children]: children, path, state, onClick, ...attributes }) => {
  let onClickHandler = onClickLinkHandler(path, state)
  return makeElement("a", {
    onClick: onClick ? async (e) => (await onClick(e), await onClickHandler(e)) : onClickHandler,
    href: path,
    children,
    ...attributes,
  });
}

export const NavLink = ({ [_children]: children, path, activeClass, state, onClick, ...attributes }) => {
  let onClickHandler = onClickLinkHandler(path, state)
  let link = makeElement("a", {
    onClick: onClick ? async (e) => (await onClick(e), await onClickHandler(e)) : onClickHandler,
    href: path,
    children,
    ...attributes,
  });

  if (!isUndefOrNull(activeClass) && path == location.pathname) {
    link.classList.add(activeClass);
  }
  return link;
}

// NOT SIDE EFFECT FREE
// CAN PRODUCE UB DUE TO ASYNC EXECUTION IN SYNC DOM CONSTRUCTION
export const Redirect = ({ path }) => {
  setTimeout(async () => await navigateTo(path))
}
