import {Component, ViewChild, AfterViewInit,ChangeDetectorRef} from "@angular/core";
import {DayPilot} from "daypilot-pro-angular";
import {DataService} from "./data.service";
import { CreateComponent } from "./create/create.component";
import { EditComponent } from "./edit/edit.component";

// <div>
// <button class="button">Prev</button>
// <button class="button">Today</button>
// <button class="button" (click)='next()'>Next</button>
// </div>

@Component({
  selector: 'scheduler-component',
  template: `
 <div class='space'>
 Filter : <input class='input' type='text' [ngModel]='filter.text' (ngModelChange)='changeText($event)'/>
 Category : <select class='select' (ngModelChange)="changeCategory($event)" [ngModel]="filter.category">
  <option *ngFor="let cat of categories" [ngValue]="cat.id">{{cat.name}}</option>
  </select>
 </div>

  <div class='w-100 flex'>
    <daypilot-navigator class="w-15" [config]="navigatorConfig" (dateChange)="changeDate()" #navigator></daypilot-navigator>
    <daypilot-scheduler class="w-80" [config]="config" [events]="events" #scheduler></daypilot-scheduler>
    <app-create #create (close)="createClosed($event)"></app-create>
    <app-edit #edit (close)="editClosed($event)"></app-edit>
    </div>`,
  styles: [``]
})



export class SchedulerComponent implements AfterViewInit {
  @ViewChild("navigator") navigator: DayPilot.Angular.Navigator;

  navigatorConfig: any = {
    showMonths: 3,
    skipMonths: 3,
    selectMode: "month"
  };

  @ViewChild("create") create: CreateComponent;
  @ViewChild("edit") edit: EditComponent;

  @ViewChild("scheduler") scheduler: DayPilot.Angular.Scheduler;
  days:number = 7;
  events: any[] = [];
  categories: any[] = [];

  config: any = {
    onTimeRangeSelected: args => {
      this.create.show(args);
       
    },
    locale: "en-us",
    viewType: "Resources",
    columns: this.columns,
    cellWidthSpec: "Auto",
    crosshairType: "Header",
    //timeHeaders: [{"groupBy":"Month"},{"groupBy":"Day","format":"d"}],
    scale: "Day",
    days: this.days,
    startDate: DayPilot.Date.today().firstDayOfWeek(),
    showNonBusiness: true,
    businessBeginsHour: 9,
    businessEndsHour: 23,
    businessWeekends: false,
    floatingEvents: true,
    eventHeight: 60,
    eventMovingStartEndEnabled: false,
    eventResizingStartEndEnabled: false,
    timeRangeSelectingStartEndEnabled: false,
    groupConcurrentEvents: false,
    eventStackingLineHeight: 100,
    allowEventOverlap: false,
    timeRangeSelectedHandling: "Enabled",
    onEventFilter: args => {
      var params = args.filter;
      if(params.text && args.e.text().toLowerCase().indexOf(params.text.toLowerCase()) < 0){
        args.visible = false;
      }
      if(params.category !== "any" && args.e.data.category !== params.category){
        args.visible = false;
      }
    },
    onEventClicked: args => {
      this.edit.show(args.e,args.e.data.id);
    },
    
    eventMoveHandling: "Update",
    onEventMoved: args => {
      console.log(args.newStart.value);
      this.ds.updateHours(args,args.e.data.id);
      
    },
    // function (args) {
    //   this.message("Event moved");
    // },
    eventResizeHandling: 'Disabled',
    // "Update",
    // onEventResized: function (args) {
    //   this.message("Event resized");
    // },
    eventDeleteHandling: "Update",
    onEventDeleted: args =>{
      this.ds.deleteHours(args.e.data.id);
    },
    // onEventDeleted: function (args) {
    //   this.message("Event deleted");
    // },
   // eventClickHandling: "Edit",
    eventEditHandling: "Enabled",
    onEventEdited: function (args) {
      this.message("Event edited");
    },
    eventHoverHandling: "Disabled",
    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: function(args) { var dp = args.source.calendar; dp.events.remove(args.source); } },
        {text: "Edit", onClick: args => this.edit.show(args.source,args.e.data.id)},

      ]
    }),
    treeEnabled: true,
  };

  constructor(private ds: DataService, private cdr: ChangeDetectorRef) {
  }

  dateChange() {
    this.config.startDate = this.navigator.control.selectionStart;
    this.config.days = new DayPilot.Duration(this.navigator.control.selectionStart, this.navigator.control.selectionEnd).totalDays() + 1;
  }

  viewChange() {
    
    var from = this.scheduler.control.visibleStart();
    var to = this.scheduler.control.visibleEnd();
    this.ds.getEvents(from, to).subscribe(result => {
      this.events = result;
  
      // this is required for getEvents() that resolves immediately (no http)
      this.cdr.detectChanges();
    });
  }

  get columns(): any[] {
    let days =[
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednsday',
      'Thursday',
      'Friday',
      'Saturday'
      
    ]
    let result = [];
    let first = DayPilot.Date.today().firstDayOfWeek();

    for (let i = 0; i < 14; i++) {
      let day = first.addDays(i);
      let dayOfWeek = day.getDayOfWeek();

      // skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }
    result.push({start: day, name: day.toString("ddd M/d/yyyy")});
    }
    return result;
  }

  ngAfterViewInit(): void {
    this.ds.getResources().subscribe(result => this.config.resources = result);
    this.ds.getCategory().subscribe(result => {
      this.categories = result;
    })
    var from = this.scheduler.control.visibleStart();
    var to = this.scheduler.control.visibleEnd();
    this.ds.getEvents(from, to).subscribe(result => {
      this.events = result;
    });
  }

  next(){
    this.days += 7;
    this.config.days = this.days; 
  }

  loadResources(): void {
    this.ds.getResources().subscribe(result => {
      this.config.resources = result;
    });
  }

  createClosed(args) {
    if (args.result) {
      this.events.push(args.result);
      this.scheduler.control.message("Created.");
    }
    this.scheduler.control.clearSelection();
  }

  editClosed(args) {
    if (args.result) {
      this.scheduler.control.message("Updated");
    }
  }

  filter:any = {
    text:''
  };

  changeText(val){
    this.filter.text= val;
    this.applyFilter();
  }

  changeShort(val){
    this.filter.category = val;
    this.applyFilter();
  }

  applyFilter(){
    this.scheduler.control.events.filter(this.filter);
  }

  clearFilter(){
    this.filter.category = "any";
    this.filter.text = "";
    this.applyFilter();
    return false;
  }


}

