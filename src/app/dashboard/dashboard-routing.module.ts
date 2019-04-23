import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { dashboardRoutes } from './dashboard.routes';
//import { AuthGuardGuard } from '../auth/auth-guard.guard';

const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    children: dashboardRoutes
    //canActivate: [ AuthGuardGuard ]
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class DashboardRoutingModule { }
