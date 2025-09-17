// app.routes.ts
import { Routes } from '@angular/router';
import { ClientComponent } from './components/client/client.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'client' },

  { path: 'client', component: ClientComponent },

  { path: '**', redirectTo: 'client' }
];
