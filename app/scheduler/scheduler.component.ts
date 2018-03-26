import {Component, ViewChild, AfterViewInit} from "@angular/core";
import {DayPilot, DayPilotSchedulerComponent} from "daypilot-pro-angular";
import {DataService} from "./data.service";{}

@Component({
  selector: 'scheduler-component',
  template: `<daypilot-scheduler [config]="config" [events]="events" #scheduler></daypilot-scheduler>`,
  styles: [``]
})
export class SchedulerComponent implements AfterViewInit {

  @ViewChild("scheduler")
  scheduler: DayPilotSchedulerComponent;

  events: any[] = [];

  config: any = {
    locale: "en-us",
    cellWidthSpec: "Auto",
    crosshairType: "Header",
    timeHeaders: [{"groupBy":"Month"},{"groupBy":"Day","format":"d"}],
    scale: "Day",
    days: 7,
    startDate: DayPilot.Date.today().firstDayOfWeek(),
    showNonBusiness: true,
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
    onTimeRangeSelected: function (args) {
      var dp = this;
      DayPilot.Modal.prompt("Add hours:", "14.00-22.00").then(function(modal) {
        dp.clearSelection();
        if (!modal.result) { return; }
        dp.events.add(new DayPilot.Event({
          start: args.start,
          end: args.end,
          id: DayPilot.guid(),
          resource: args.resource,
          text: modal.result
        }));
      });
    },
    eventMoveHandling: "Update",
    onEventMoved: function (args) {
      this.message("Event moved");
    },
    eventResizeHandling: "Update",
    onEventResized: function (args) {
      this.message("Event resized");
    },
    eventDeleteHandling: "Update",
    onEventDeleted: function (args) {
      this.message("Event deleted");
    },
    eventClickHandling: "Edit",
    eventEditHandling: "Update",
    onEventEdited: function (args) {
      this.message("Event edited");
    },
    eventHoverHandling: "Disabled",
    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: function(args) { var dp = args.source.calendar; dp.events.remove(args.source); } }
      ]
    }),
    treeEnabled: true,
  };

  constructor(private ds: DataService) {
  }

  ngAfterViewInit(): void {
    this.ds.getResources().subscribe(result => this.config.resources = result);

    var from = this.scheduler.control.visibleStart();
    var to = this.scheduler.control.visibleEnd();
    this.ds.getEvents(from, to).subscribe(result => {
      this.events = result;
    });
  }

}

