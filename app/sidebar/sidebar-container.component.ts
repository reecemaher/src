import {
  Component,
  OnInit,
  style,
  state,
  animate,
  transition,
  trigger,
  EventEmitter,
  Output,
  Input,
  ContentChild,
  DoCheck
} from "@angular/core";
import {SidebarExpandedComponent} from "./sidebar-expanded.component";
import {SidebarMainComponent} from "./sidebar-main.component";

@Component({
  selector: 'sidebar-container',
  styles: [`
  .sidebar-container {
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
  }
  .sidebar-main {
    -webkit-flex: auto;
    flex: auto;
    height: 100%;
    overflow: hidden;
    position: relative;
    overflow-y: auto;
  }
  .sidebar-collapsed {
    overflow:hidden;
    position: relative;
    height: 100%;
    background-color: #e0e0e0;
  }
  .sidebar-expanded {
    overflow:hidden;
    position: relative;
    height: 100%;
    background-color: #e0e0e0;
    /*overflow-y:auto;*/
  }
  .sidebar-expanded-full {    
    height: calc(100% - 30px);
    overflow-y: auto;
  }
  .sidebar-separator {
    width: 1px;
    background-color: #c0c0c0;
    height: 100%;
  }
  .sidebar-icon-action {
    padding: 5px 8px;
    cursor: pointer;
    font-size: 16px;
    
  }
  .sidebar-icon-action:hover {
    background-color: #c0c0c0;
  }
  .sidebar-header {
    white-space: nowrap;
    height: 30px;
    background-color: #d0d0d0;
  }
  .sidebar-header .sidebar-icon-action {
    float:right;
  }
  `],
  template: `
  <div class="sidebar-container">
    <div class="sidebar-expanded" [@slideExpanded]="state">
      <div class="sidebar-header"><span class="sidebar-icon-action" (click)="toggle()">&laquo;</span></div>
      <div class="sidebar-expanded-full">
        <ng-content select="sidebar-expanded"></ng-content>
      </div>      
    </div>
    <div class="sidebar-collapsed" [@slideCollapsed]="state">
      <div class="sidebar-header"><span class="sidebar-icon-action" (click)="toggle()">&raquo;</span></div>    
      <ng-content select="sidebar-collapsed"></ng-content>
    </div>
    <div class="sidebar-separator"></div>
    <div class="sidebar-main">          
      <ng-content select="sidebar-main"></ng-content>
    </div>
  </div>`,
  animations: [
    trigger('slideExpanded', [
      state('visible', style({ width: '*', xtransform: 'translateX(0)', display: 'block' })),
      state('hidden', style({ width: '0px', xtransform: 'translateX(-100%)', display: 'none'})),
      transition('hidden <=> visible', animate('200ms ease'))
    ]),
    trigger('slideCollapsed', [
      state('visible', style({ width: '0px', xtransform: 'translateX(0)', display: 'none' })),
      state('hidden', style({ width: '*', xtransform: 'translateX(-100%)', display: 'block'})),
      transition('hidden <=> visible', animate('200ms ease'))
    ]),
  ],
})
export class SidebarContainerComponent implements OnInit, DoCheck {
  @ContentChild(SidebarExpandedComponent) left: SidebarExpandedComponent;
  @ContentChild(SidebarMainComponent) main: SidebarMainComponent;

  state: "visible" | "hidden" = "visible";

  @Input()
  expanded: boolean = true;

  @Output()
  expandedChange: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {}

  ngDoCheck() {
    this.state = this.expanded ? "visible" : "hidden";
  }

  toggle() {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }

}
