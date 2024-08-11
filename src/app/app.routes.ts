import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { StartedComponent } from './core/pages/started/started.component';
import { HomeComponent } from './core/pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'started',
    component: StartedComponent,
  },
  {
    path: 'oauth2callback',
    component: AppComponent,
  },
];
