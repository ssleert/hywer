import {
  addEventListener,
  doc,
  instanceOf,
  replaceChildren,
} from "../../hywer/alias.js";
import { makeElement } from "../../hywer/hywer.js";

let _children = "children"
let _null = null
let push = "push"
let length = "length"

let routes = [];
let currentRoute = {};
let routerElementId = "router__";

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
  setCurrentRoute();
  renderRoute(execView(currentRoute));
};

export const navigateTo = async (url) => {
  history.pushState(_null, "", url);
  await navigate();
};

export const createRouterContext = (userRoutes) => {
  routes[length] ||
    (doc[addEventListener]("DOMContentLoaded", () => {
      doc.body[addEventListener](
        "click",
        (e) =>
          (e.target.matches("[data-route]")) && (
            e.preventDefault(),
              e.target.href == location.href ||
              navigateTo(e.target.href)
          ),
      );
    }),
      window[addEventListener]("popstate", navigate));

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

  setCurrentRoute();
};

export const Router = ({ [_children]: _, ...attributes }) =>
  makeElement("div", {
    id: routerElementId,
    ...attributes,
  }, execView(currentRoute));
