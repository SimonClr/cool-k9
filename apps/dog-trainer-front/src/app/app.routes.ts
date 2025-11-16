import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/sessions', pathMatch: 'full' },
  {
    path: 'sessions',
    loadComponent: () =>
      import('./pages/sessions-list/sessions-list.component').then(
        (m) => m.SessionsListComponent
      ),
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
  },
];
