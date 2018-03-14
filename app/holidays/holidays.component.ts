import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { DayViewHour } from 'calendar-utils';
import { AngularFirestore,AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../core/auth.service'; 
import { Observable } from 'rxjs/Observable';
import { forEach } from '@angular/router/src/utils/collection';
import { requests } from './requests';
import { User} from '../core/user';
import { colors } from '../calendar/colors';
import { Subject } from 'rxjs/Subject';


//import calendar header for changing month
import { CalendarHeaderComponent } from '../calendar/calendar-header.component';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  startOfISOWeek,
  isFuture,
  isToday
} from 'date-fns';
import {  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';


@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./holidays.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HolidaysComponent implements OnInit {
  //Firestore collection containing holidays/DOR
  requestCollection: AngularFirestoreCollection<any>;
  request: Observable<any[]>;

  //tempDocument for deleting || editing requests
  tempDocument: AngularFirestoreDocument<any>;
  changeRequest: Observable<any>;

//Calendar default view
  view: string = 'month';


  viewDate: Date = new Date();
  selectedMonthViewDay: CalendarMonthViewDay;
  dayView: DayViewHour[];

  selectedDayViewDate: Date;
  // hours to be diplayed on calendar 
  holidays: Object[] =[];
  userId;
  userDisplayName;
  //user$: Observable<User>;

    constructor(public auth: AuthService,private afs: AngularFirestore,private afAuth: AngularFireAuth) {
      this.auth.user$.subscribe(user=>{
        this.userId = user.uid;
        this.userDisplayName = user.displayName;
        console.log(user.uid + ' ' +  user.displayName);
        this.loadhours(this.holidays,this.refresh,this.actions,this.userId);
      })
      
      //this.userId.getIdToken(this.auth.user$);
      this.requestCollection = this.afs.collection<any>('holidays');

      this.request = this.requestCollection.valueChanges();
     


      //this.userId = afAuth.currentUser.uid;
      
    }

    ngOnInit() {
      

        }

    clickedDate: Date;


    dayOffRequest(day: CalendarMonthViewDay){
      // if (this.selectedMonthViewDay) {
      //   delete this.selectedMonthViewDay.cssClass;
      // }
      //  day.cssClass = 'cal-day-booked';
      //  this.selectedMonthViewDay = day; 
      

      
      let newDay = day.toString();
      
      if(isFuture(newDay) || isToday(newDay)){     
        day.cssClass = 'cal-day-booked';
        this.addEvent(day);
        console.log("i requested " + day + " day off");
        }
        else{
          alert("please select current or future date");
        }
    }

    weekOffRequest(day: CalendarMonthViewDay){
      let newDay = day.toString();

      if(isFuture(newDay) || isToday(newDay)){
        this.addHoliday(day);
      }
      else{
        alert("please the current or future date");
      }
    }

    //  dayClicked(day: CalendarMonthViewDay): void {
    //   if (this.selectedMonthViewDay) {
    //     delete this.selectedMonthViewDay.cssClass;
    //   }
    //   day.cssClass = 'cal-day-selected';
    //   this.selectedMonthViewDay = day;
    // }

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

    beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
      body.forEach(day => {
        if (
          this.selectedMonthViewDay &&
          day.date.getTime() === this.selectedMonthViewDay.date.getTime()
        ) {
          day.cssClass = 'cal-day-selected';
          this.selectedMonthViewDay = day;
        }
      });
    }

    refresh: Subject<any> = new Subject();

    actions: CalendarEventAction[] = [
      {
        label: '<i class="fa fa-fw fa-pencil"></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          //console.log('edited');
        }
      },
      {
        label: '<i class="fa fa-fw fa-times"></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.holidays = this.holidays.filter(iEvent => iEvent !== event);
          this.tempDocument = this.afs.doc('holidays/9drHnvtWmhS7JnZLvfKN');
        // this.handleEvent('Deleted', event);
        //this.requestCollection.({start:day, title: 'booked', color: colors.red});
        }
      }
    ];

    loadhours(holidays,refresh,actions,userId){ 
      return  this.afs.collection('holidays').ref.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          //doc.data()['actions'] = actions;
          holidays.push(doc.data());
          //console.log(holidays);
        });
        for(var i =0; i < holidays.length; i++){
          console.log(holidays[i].uid +' '+ userId);
          if(holidays[i].uid == userId){
          holidays[i]['actions'] = actions; 
          holidays[i]['draggable'] = true;
        }
      }
        refresh.next();
    });
    }

    

    deleteEvent(){
        
    }
    

    addEvent(day: CalendarMonthViewDay): void {
      
      this.holidays.push({
        start: day,
        color: colors.red,
        title: this.userDisplayName + ' booked this day',
        actions:this.actions,
        draggable: true,
        uid: this.userId
      });
      this.requestCollection.add({start:day, title: this.userDisplayName + ' booked this day', color: colors.red, uid: this.userId});
      //this.loadhours(this.holidays,this.actions,this.refresh);
      this.refresh.next();
    }

    addHoliday(day: CalendarMonthViewDay){
      let newDay = day.toString();
      let endDay = addDays(new Date(newDay),7);
      this.holidays.push({
        start: day,
        color: colors.yellow,
        end: endDay,
        title: this.userDisplayName + ' booked this week',
        actions:this.actions,
        draggable: true,
        uid: this.userId
      });

      this.requestCollection.add({start: day,end: endDay, title: this.userDisplayName + ' booked this week', color:colors.yellow, uid: this.userId})
      //this.loadhours(this.holidays,this.actions,this.refresh);
      this.refresh.next();
    }
    
    

    handleEvent(){

    }

    eventTimesChanged({event,newStart,newEnd,}: CalendarEventTimesChangedEvent): void {
      event.start = newStart;
      event.end = newEnd;
      //this.tempDocument = this.afs.doc('holidays/');
      
      //this.tempDocument.update({start:newStart,title: 'booked', color: colors.yellow});

      //this.requestCollection.add({start:newStart, title: 'booked', color: colors.red});
      //this.handleEvent('Dropped or resized', event);
      //console.log(this.userId);
      this.refresh.next();
    }

}
