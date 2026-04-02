const ROUTES = new Set([
  'home', 'solve', 'history', 'profile',
  'progress', 'parents',
  'account', 'login', 'register', 'recovery',
  'subscription', 'plans', 'billing', 'userProfile', 'profileEditor', 'storeBilling', 'externalPayment'
]);

export function createRouter(initialRoute = 'solve') {
  let currentRoute = ROUTES.has(initialRoute) ? initialRoute : 'solve';

  return {
    getRoute() {
      return currentRoute;
    },
    canGo(route) {
      return ROUTES.has(route);
    },
    go(route) {
      if (!ROUTES.has(route)) return false;
      currentRoute = route;
      return true;
    },
    all() {
      return Array.from(ROUTES);
    }
  };
}
