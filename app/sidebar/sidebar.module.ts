import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {SidebarMainComponent} from "./sidebar-main.component";
import {SidebarExpandedComponent} from "./sidebar-expanded.component";
import {SidebarContainerComponent} from "./sidebar-container.component";
import {SidebarCollapsedComponent} from "./sidebar-collapsed.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports:      [ BrowserModule,BrowserAnimationsModule, NoopAnimationsModule ],
  declarations: [
    SidebarContainerComponent,
    SidebarExpandedComponent,
    SidebarCollapsedComponent,
    SidebarMainComponent
  ],
  exports:      [
    SidebarContainerComponent,
    SidebarExpandedComponent,
    SidebarCollapsedComponent,
    SidebarMainComponent ],
  providers:    [  ]
})
export class SidebarModule { }
