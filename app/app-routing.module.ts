import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserFormComponent } from './user-form/user-form.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { SuperSecretComponent } from './super-secret/super-secret.component';
import { SubscriberPageComponent } from './subscriber-page/subscriber-page.component';
import { MyCalendarComponent } from './calendar/calendar.component';
import { HolidaysComponent } from './holidays/holidays.component';

import { AdminGuard } from './core/admin.guard';
import { CanReadGuard } from './core/can-read.guard';
import { AuthGuard } from './core/auth.guard';
import { TestComponent } from './test/test.component';



const routes: Routes = [
  { path: 'form' , component: UserFormComponent},
  { path: 'dashboard' , component: UserLoginComponent, canActivate: [CanReadGuard]},
  { path: 'calendar', component: MyCalendarComponent, canActivate: [CanReadGuard]},
  { path: 'content', component: SubscriberPageComponent, canActivate: [CanReadGuard] },
  { path: 'holidays', component: HolidaysComponent, canActivate: [CanReadGuard] },
  { path: 'secret', component: SuperSecretComponent, canActivate: [AdminGuard] },
  { path: 'test', component: TestComponent, canActivate: [AdminGuard]},
  { path: '',pathMatch: 'full', redirectTo: 'form'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }
