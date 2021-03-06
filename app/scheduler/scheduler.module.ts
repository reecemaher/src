import {DataService} from "./data.service";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {SchedulerComponent} from "./scheduler.component";
import {DayPilot} from "daypilot-pro-angular";
import {HttpClientModule} from "@angular/common/http";
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import {SidebarModule} from '../sidebar/sidebar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    SidebarModule,
    NgbModule.forRoot()
  ],
  declarations: [
    DayPilot.Angular.Scheduler,
    DayPilot.Angular.Navigator,
    DayPilot.Angular.Modal,
    SchedulerComponent,
    CreateComponent,
    EditComponent,
  ],
  exports:      [ SchedulerComponent ],
  providers:    [ DataService ]
})
export class SchedulerModule { }
