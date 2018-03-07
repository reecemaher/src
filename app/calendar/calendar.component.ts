import { Component, ChangeDetectionStrategy,OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../core/auth.service'; 
import { Observable } from 'rxjs/Observable';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  startOfISOWeek
} from 'date-fns';
import {  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils'
import { colors } from './colors';
import { Subject } from 'rxjs/Subject';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument } from 'angularfire2/firestore';
import { Roster } from './roster';
import { DateTimePickerComponent } from './date-time-Picker.component';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
@Component({
  selector: 'calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class MyCalendarComponent implements OnInit {

  rosterCollection: AngularFirestoreCollection<Roster>;
  rosterDoc: AngularFirestoreDocument<Roster>;
  rosterEvent: Observable<Roster>;
  rosters$: Observable<Roster[]>;
  snapshot: any;
  user;

  constructor(public auth: AuthService,private afs: AngularFirestore) { 
    this.auth.user$.subscribe(user => this.user = user);
    console.log('test' + this.testObj);
    }

  ngOnInit(){
    this.rosterCollection = this.afs.collection('test');
    this.rosters$ = this.rosterCollection.valueChanges()
    this.snapshot = this.rosterCollection.snapshotChanges()
    .map(arr => {
      console.log(arr)
      arr.map(snap => snap.payload.doc.data())
    })
    this.rosterDoc = this.afs.doc('test/test')
    this.rosterEvent = this.rosterDoc.valueChanges();

    console.log(this.datas);
   let roster = this.rosters$;

   
   
   console.log('roster= ' + roster);
    }
  datas = JSON.stringify(this.rosterEvent);
  //newD = JSON.parse(this.datas);
  view: string = 'month';
  viewDate: Date = new Date();

   actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        console.log('edited');
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
       // this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
/*
  testEvent: CalendarEvent[] = [
    {
        title: this.rosterEvent.subscribe,
        start: new Date(),
        color: colors.red
    }
     
  ];*/

maxEvent:Boolean = false;
errs = [].push(this.datas);
//eventarray = [].push(this.rosterCollection,;
her = JSON.stringify(this.rosterCollection);

testObj = {
  title: 'i dids it',
  start: startOfISOWeek(new Date()),
  color: colors.yellow,
  action: this.actions,
  draggable: true,
  
}

workpls = this.rosterCollection;

a={ 
  color: colors.red,
  draggable: true,
  start: '2018-02-07T14:14:00.000Z',
  title: "15.00 - 22.00" 
    }


testEvent: any =[ this.testObj, this.testObj, this.a];

  events: CalendarEvent[] = [
  {
    title: '14.00 - 22.00',
    start: new Date(),
    color: colors.yellow
  },   
  {
    title: '10.00 - 18.00',
    color: colors.red,
    start: new Date(),
    actions: this.actions,
    draggable: true
  },
    {
      title: '14.00-22.00',
      color: colors.red,
      start: new Date(),
      actions:this.actions,
      draggable: true
    },
    {
     title: '17.00-22.00',
      color: colors.blue,
      start: new Date(),
      actions:this.actions,
      draggable: true
    }
  ];

  test = this.events;

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    //this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }
/*
  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }
*/

// Expand events when day is clicked
activeDayIsOpen: boolean = true;
dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  dayAvailable(){

  }

addEvent(date: Date): void {
  this.events.push({
    start: date,
    title: 'new',
    color: colors.yellow
  });
  this.refresh.next();
}

  clickedDate: Date;
}