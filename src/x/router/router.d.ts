 // createRouterContext({
 //   "/": () => <Redirect path="/first" />,
 //   "/first": () => <Post1 />,
 //   "/second": () => <Post2 />,
 // })

export interface RouteParams {
  [key: string]: any
};

export declare const getParams: () => RouteParams;

export declare const navigateTo: (
  path: string, 
  state: any,
) => Promise<void>;

export interface Routes {
  [path: string]: Function | any;
};

export declare const createRouterContext: (
  userRoutes: Routes,
  beforeRoute?: () => void,
  afterRoute?: () => void,
) => void;

export interface RouterProps {
  [key: string]: any
};
export declare const Router: (
  props: RouterProps,
) => any;

export interface LinkProps {
  children?: any | any[],
  path: string,
  state?: any,
  onClick?: (e: Event) => void,
  [key: string]: any
};

export declare const Link: (
  props: LinkProps,  
) => any;

export interface NavLinkProps {
  children?: any | any[],
  path: string,
  activeClass?: string,
  state?: any,
  onClick?: (e: Event) => void,
  
  [key: string]: any
};

export declare const NavLink: (
  props: NavLinkProps,
) => any;


export interface RedirectProps {
  path: string
};

export declare const Redirect: (
  props: RedirectProps,
) => any;
