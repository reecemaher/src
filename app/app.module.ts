import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';

import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

//import { routing } from './core/app.routing'
import { SuperSecretComponent } from './super-secret/super-secret.component';
import { UserLoginComponent } from './user-login/user-login.component'; 
import { UserProfilesComponent } from './user-profiles/user-profiles.component';
import { UserFormComponent } from './user-form/user-form.component';
import { CoreModule } from './core/core.module';
import { SubscriberPageComponent } from './subscriber-page/subscriber-page.component';
import { MyCalendarComponent } from './calendar/calendar.component';
import { CalendarModule } from 'angular-calendar';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarComponent } from "ap-angular2-fullcalendar/src/calendar/calendar";

import { RostersService } from './service/rosters.service'

//Angular material
import {MatGridListModule} from '@angular/material/grid-list';

//Calendar
import {
  CalendarEvent,
  WeekDay,
  MonthView,
  MonthViewDay,
  ViewPeriod
} from 'calendar-utils';
import { TestComponent } from './test/test.component';
import { NavComponent } from './nav/nav.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { CalendarHeaderComponent } from './calendar/calendar-header.component';
import { HolidaysService } from './service/holidays.service';

//ngbModal
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    SuperSecretComponent,
    UserLoginComponent,
    UserFormComponent,
    SubscriberPageComponent,
    MyCalendarComponent,
    CalendarComponent,
    UserProfilesComponent,
    TestComponent,
    NavComponent,
    HolidaysComponent,
    CalendarHeaderComponent
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    NgbModalModule.forRoot(),
    CalendarModule.forRoot(),
    DragAndDropModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatGridListModule
  ],
  providers: [RostersService,HolidaysService],
  bootstrap: [AppComponent]
})
export class AppModule { }
