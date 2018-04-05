import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import {  CalendarMonthViewDay } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils';
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

//import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';


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
  //popup for changing event days data
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  //Firestore collection containing holidays/DOR
  requestCollection: AngularFirestoreCollection<requests>;
  request: Observable<requests[]>;

  bookableDays: AngularFirestoreCollection<any>;
  daysBookable:Observable<any>;

//Calendar default view (calender loads on the month view)
  view: string = 'month';

//Constraints
  //Amount of days before booking is disabled
  bookabledays:any;
  // If day is bookable 
  bookable = false;

  viewDate: Date = new Date();
  selectedMonthViewDay: CalendarMonthViewDay;
  dayView: DayViewHour[];
  selectedDayViewDate: Date;

  // Events to be diplayed on calendar 
  holidays: Object[] =[];

//user information
  userId;
  userDisplayName;
  userDepartment;

  //pop up for changing dates - to be used to move events between months
  modalData: CalendarEvent;



  //user$: Observable<User>;

    constructor(public auth: AuthService,private afs: AngularFirestore,private afAuth: AngularFireAuth) {
      //User data to be saved on new events (uid + department)
      this.auth.user$.subscribe(user=>{
        this.userId = user.uid;
        this.userDisplayName = user.displayName;
        this.userDepartment = user.department;
        console.log(user.uid + ' ' +  user.displayName + ' ' + user.department);
       // this.loadhours(this.holidays,this.refresh,this.actions,this.userId,user.department);
      })
      
      this.requestCollection = this.afs.collection<requests>('holidays');
      this.request = this.requestCollection.valueChanges();

      this.request = this.requestCollection.valueChanges();
      this.bookableDays = this.afs.collection('bookableDays');
      this.daysBookable = this.bookableDays.valueChanges();
      this.daysBookable.subscribe(data =>{ this.bookabledays = data[0].bookableDays});
    }

    ngOnInit() {
      this.loadhours1();
     }


    //Function for handling incoming day off requests
    dayOffRequest(day: CalendarMonthViewDay, events : CalendarEvent[]){
      let newDay = day.toString();
      let book = this.bookable;
      console.log('b'+book);

      //Constraints ensure a valid date is requested(today or future date)
      if(isFuture(newDay) || isToday(newDay)){     
        day.cssClass = 'cal-day-booked';
        this.addEvent(day);
        }
        else{
          alert("please select current or future date/ day has already been booked");
        }
    }


    //Function to handle holiday requests
    weekOffRequest(day: CalendarMonthViewDay){
      let newDay = day.toString();

      //Constraints ensure a valid date is requested(today or future date)
      if(isFuture(newDay) || isToday(newDay)){
        this.addHoliday(day);
        this.bookable = false;
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

    //Dropdown to disaply all events on the clicked date    
    activeDayIsOpen: boolean = true;
    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    //Constraint to prevent multiple bookings on the same date      
      if(events.length < this.bookabledays){
        this.bookable = false;
        console.log(this.bookable);
      }

      else{
        this.bookable = true;
      }

      //Checks to only open dropdown when the clicked date contains events
      if (isSameMonth(date, this.viewDate)) {
        if (
          (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
          events.length === 0
        ) {
          this.activeDayIsOpen = false;
          console.log(events.length +' ' + this.bookable);
          this.bookable =false;
        } else {
          this.activeDayIsOpen = true;
          console.log(events.length +' ' + this.bookable );
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


    //Delete an dedit icons for events    
    actions: CalendarEventAction[] = [
    //Calls a function to handle the edit request      
      {
        label: '<i class="fa fa-fw fa-pencil"></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleEvent(event);
        }
      },
      //Deletes the correct event on the calendar and from the database      
      {
        label: '<i class="fa fa-fw fa-times"></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.holidays = this.holidays.filter(iEvent => iEvent !== event);
          console.log('eventid' + event.id);
          this.afs.doc('holidays/' + event.id).delete();
        }
      }
    ];


    //function to push objects into an array to be displayed on the calendar
    loadhours(holidays,refresh,actions,userId,userDepartment){ 
    //loops through each holiday and pushes it into the array      
      return  this.afs.collection('holidays').ref.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          if(doc.data().department == userDepartment){
          holidays.push(doc.data());
          }
        });

        //loops through the array and removes each index that doesnt match the current logged in users department        
        // for(var j =holidays.length -1; j >= 0; j--){
        //   if(holidays[j].department != userDepartment){
        //     holidays.splice(j,1);
        //   }
        // }
        
        for(var i =0; i < holidays.length; i++){
          if(holidays[i].uid == userId){
          holidays[i]['actions'] = actions; 
          holidays[i]['draggable'] = true;
        }
      }
        refresh.next();
    });
    }

    loadhours1(){ 
      this.request.subscribe(data => {for(var i = data.length-1;i >= 0;i--){
        if(data[i].department != this.userDepartment){
          data.splice(i,1);
          for(var j = 0; j < data.length; j++){
            if(data[j].uid == this.userId){
            data[j]['actions'] = this.actions;
            data[j]['draggable'] = true;
            this.holidays = data;
            }
          }
        }
      } 
    });
      this.refresh.next();  
      }

    addEvent(day: CalendarMonthViewDay): void {
      var referalId = this.userId + day;
      var docId = this.afs.createId();
        var newHolidays = {
            //id: referalId,
           id:docId,
            start: day,
            end:day,
            color: colors.red,
            title: this.userDisplayName + ' booked this day',
            actions:this.actions,
            draggable: true,
            uid: this.userId
          };

          var dbData ={
            id:docId,
            //id: referalId,
            start: day,
            end:day,
            color: colors.red,
            title: this.userDisplayName + ' booked this day',
            uid: this.userId,
            department: this.userDepartment
          }
        
        this.holidays.push(newHolidays);
        // this.requestCollection.add(dbData).then(ref => referalId = ref.id);
         this.requestCollection.doc(docId).set(dbData);
      this.refresh.next();
    }

    addHoliday(day: CalendarMonthViewDay){
      let newDay = day.toString();
      let endDay = addDays(new Date(newDay),7);
      let referalId = this.userId + day;
      let docId = this.afs.createId();
      let clientHol = {
        id: docId,
        start: day,
        color: colors.yellow,
        end: endDay,
        title: this.userDisplayName + ' booked this week',
        actions:this.actions,
        draggable: true,
        uid: this.userId
      }

      let serverHol = {
        id: docId,
        start: day,
        color: colors.yellow,
        end: endDay,
        title: this.userDisplayName + ' booked this week',
        uid: this.userId,
        department: this.userDepartment
      }
      
      this.holidays.push(clientHol);

      this.requestCollection.doc(docId).set(serverHol);
      //this.loadhours(this.holidays,this.actions,this.refresh);
      this.refresh.next();
    }
    
    

    handleEvent(event: CalendarEvent){
      this.modalData = event;
     // this.modal.open(this.modalContent);
    }

    updateHoliday(event: CalendarEvent){
      let start = event.start;

      let newStart = new Date(start);

      let changedevent: CalendarEventTimesChangedEvent = {event,newStart};

      this.eventTimesChanged(changedevent);
      
    }

    eventTimesChanged({event,newStart,newEnd}: CalendarEventTimesChangedEvent): void {
      event.start = newStart;
      event.end = newEnd;

      if(isFuture(newStart) || isToday(newStart)){
      this.afs.doc('holidays/' + event.id).update({
        start: newStart,
        end: newEnd
      })
      this.refresh.next();
    }

    else{
      alert('day unavailable');
      
    }
      
    }

    change(num){
      let n : number = num;
      this.bookabledays = n;
      let days = {
        bookableDays : n
      }
      this.bookableDays.doc('BS1ZbteQOLsFbRsYeFND').update(days);
    }

}
