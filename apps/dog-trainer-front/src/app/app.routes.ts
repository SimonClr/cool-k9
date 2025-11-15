import { Route } from '@angular/router';
import { SessionsListComponent } from './pages/sessions-list/sessions-list.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/sessions', pathMatch: 'full' },
  { path: 'sessions', component: SessionsListComponent },
];
