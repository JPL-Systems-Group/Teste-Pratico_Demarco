import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/orders', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
  },
  {
    path: 'deliveries/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/deliveries/delivery-form/delivery-form.component').then(m => m.DeliveryFormComponent)
  },
  { path: '**', redirectTo: '/orders' }
];
