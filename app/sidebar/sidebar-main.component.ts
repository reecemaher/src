import {
  Component, OnInit, style, state, animate, transition, trigger, EventEmitter, Output,
  ElementRef, Inject, ViewChild, Input
} from "@angular/core";

@Component({
  selector: 'sidebar-main',
  styles: [`  `],
  template: `
  <ng-content></ng-content>
`,
})
export class SidebarMainComponent {
}

