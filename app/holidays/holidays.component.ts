import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import {  CalendarMonthViewDay } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils';
import { DayViewHour } from 'calendar-utils';
import { AngularFirestore,AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../core/auth.service'; 
import { Observable } from 'rxjs/Observable';
import { requests } from './requests';
import { User} from '../core/user';
import { colors } from '../calendar/colors';
import { Subject } from 'rxjs/Subject';

//modal for changing holidays between months
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';


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
import { FormGroup, FormBuilder } from '@angular/forms';
import { filter } from 'rxjs/operator/filter';


@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./holidays.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HolidaysComponent implements OnInit {
  @ViewChild("changeDates") cd:ElementRef;
  //popup for changing event days data
  form: FormGroup;
  //modal
  closeResult: string;

  //Firestore collection containing holidays/DOR
  requestCollection: AngularFirestoreCollection<requests>;
  request: Observable<requests[]>;

  bookableDays: AngularFirestoreCollection<any>;
  daysBookable:Observable<any>;

  holidayCollection: AngularFirestoreCollection<any>
  holiday: Observable<any>;

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
  holidays: any[] =[];

    constructor(public auth: AuthService,private afs: AngularFirestore,private afAuth: AngularFireAuth,private fb: FormBuilder,private modalService: NgbModal) {
      //load in user details fro saving holidays
      this.auth.loggedInUser();
      
      //collection that holds all holidays and the observable to subscribe to the data
      //this.requestCollection = this.afs.collection<requests>('holidays' ,ref => ref.where('department', '==', this.auth.userDepartment));
      this.requestCollection = this.afs.collection<requests>('holidays');
      this.request = this.requestCollection.valueChanges();

      //collection and observable to alter how many holidays can be booked
      this.bookableDays = this.afs.collection('bookableDays');
      this.daysBookable = this.bookableDays.valueChanges();
      this.daysBookable.subscribe(data =>{ this.bookabledays = data[0].bookableDays});

      this.holidayCollection = this.afs.collection('Shopfloor');
      this.holiday = this.holidayCollection.valueChanges();

      //form for booking DoR
      this.form = this.fb.group({
        start: "",
        end:"",
        id:""
      }); 
      
    }

    ngOnInit() {
      // function to load holidays onto the calendar
      this.loadhours2();
      //this.loadHolidays();
     }


    //Function for handling incoming day off requests
    dayOffRequest(day: CalendarMonthViewDay){
      let newDay = day.toString();
      let book = this.bookable;
      
      //Constraints ensure a valid date is requested(today or future date)
      if(isFuture(newDay) || isToday(newDay)){
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

    //Dropdown to disaply all events on the clicked date    
    activeDayIsOpen: boolean = true;
    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    //Constraint to prevent multiple bookings on the same date
    //also prevents the user from booking the same day multiple times     
    if(events.length < this.bookabledays){
      for(var i = 0; i < events.length; i++){
        if(events[i].uid == this.auth.userId){
          this.bookable = true;
        }
        //allows users to book the clicked day
        else{
          this.bookable = false;
        }
      }
    }

      else{
        this.bookable = true;
      }

      //Checks to only open dropdown when the clicked date contains events
      //or if the day is in the same month
      if (isSameMonth(date, this.viewDate)) {
        if (
          (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
          events.length === 0
        ) {
          this.activeDayIsOpen = false;
          this.bookable =false;
        } else {
          this.activeDayIsOpen = true;
          this.viewDate = date;
        }
      }
    }

    //if the calendar loads on th emonth view it highlights the current date
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
          this.handleEvent(this.cd,event);
        }
      },
      //Deletes the correct event on the calendar and from the database      
      {
        label: '<i class="fa fa-fw fa-times"></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.holidays = this.holidays.filter(iEvent => iEvent !== event);
          this.afs.doc('holidays/' + event.id).delete();
          //this.holidayCollection.doc(event.id).delete();
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

    //loads in all the holidays from the holidays collection
    //loops throught his data and removes any holidays that doesnt matched the current
    //users department, adds edit and delete options if the holiday matches the logged in
    //users id. Data is loaded asyn so the user with see live upadtes to help booking the same
    //days
    loadhours1(){ 
      this.request.subscribe(data => {for(var i = data.length-1;i >= 0;i--){
        if(data[i].department != this.auth.userDepartment){
          data.splice(i,1);
          for(var j = 0; j < data.length; j++){
            if(data[j].uid == this.auth.userId){
            data[j]['actions'] = this.actions;
            data[j]['draggable'] = true;
            this.holidays = data;
            this.refresh.next();
            }
          }
        }
      } 
    });
    
    }

    //holidays loaded that share logged in users department and current user can delete/edit 
    //their holidays
    loadhours2(){ 
      this.request.subscribe(data => {
         var h = data.filter(holiday => holiday.department == this.auth.userDepartment);
         for(var j = 0; j < h.length; j++){
          if(h[j].uid == this.auth.userId){
          h[j]['actions'] = this.actions;
          h[j]['draggable'] = true;
          this.holidays = h;
          this.refresh.next();
          }
        }
         
      });

      //this.holidays = this.holidays.filter(holiday => holiday.uid !== this.auth.userId);
    
    }

    loadHolidays(){ 
      this.request.subscribe(data => {
        var userHoliday = data;
        for(var j = 0; j < userHoliday.length; j++){
          if(userHoliday[j].uid == this.auth.userId){
            userHoliday[j]['actions'] = this.actions;
            userHoliday[j]['draggable'] = true;
          this.holidays = userHoliday;
          this.refresh.next();
          }
        }
         
         
      });

      //this.holidays = this.holidays.filter(holiday => holiday.uid !== this.auth.userId);
    
    }


    // loadHolidays(){
    //   this.holiday.subscribe(data => {
    //       for(var j = 0; j < data.length; j++){
    //         if(data[j].uid == this.userId){
    //         data[j]['actions'] = this.actions;
    //         data[j]['draggable'] = true;
    //         this.holidays = data;
    //         }
    //       }
    // });
    //   this.refresh.next(); 
    // }  

    //this function handles creating booked days.
    addEvent(day: CalendarMonthViewDay): void {
     // var referalId = this.userId + day;
      
        // var newHolidays = {
        //     //id: referalId,
        //     id:docId,
        //     start: day,
        //     end:day,
        //     color: colors.red,
        //     title: this.auth.userDisplayName + ' booked this day',
        //     actions:this.actions,
        //     draggable: true,
        //     uid: this.auth.userId
        //   };

        //a unique id is created for each holiday
        var docId = this.afs.createId();

        //data is stored in an object to be entered into the database, the docID is saved
        //on the document to be referenced when editing/deleting.
        //The users department and user id is also saved on teh document
        var dbData ={
            id:docId,
            //id: referalId,
            start: day,
            end:day,
            color: colors.red,
            title: this.auth.userDisplayName + ' booked this day',
            uid: this.auth.userId,
            department: this.auth.userDepartment
        }
        
        //this.holidays.push(newHolidays);
        // this.requestCollection.add(dbData).then(ref => referalId = ref.id);


        //a document is created with the unique id and the above object is saved on the db
         this.requestCollection.doc(docId).set(dbData);
         //this.afs.collection(this.auth.userDepartment).doc(docId).set(dbData);
      this.refresh.next();
    }

    //This is the same as the day off request function above except it books 7 days instead of 1.
    addHoliday(day: CalendarMonthViewDay){
      let newDay = day.toString();
      let endDay = addDays(new Date(newDay),7);
      //let referalId = this.auth.userId + day;
      
      // let clientHol = {
      //   id: docId,
      //   start: day,
      //   color: colors.yellow,
      //   end: endDay,
      //   title: this.auth.userDisplayName + ' booked this week',
      //   actions:this.actions,
      //   draggable: true,
      //   uid: this.auth.userId
      // }
      let docId = this.afs.createId();
      let serverHol = {
        id: docId,
        start: day,
        color: colors.yellow,
        end: endDay,
        title: this.auth.userDisplayName + ' booked this week',
        uid: this.auth.userId,
        department: this.auth.userDepartment
      }
      
      //this.holidays.push(clientHol);

      this.requestCollection.doc(docId).set(serverHol);
      //this.loadhours(this.holidays,this.actions,this.refresh);
      this.refresh.next();
    }
    
    
    //opens up the modal which has a form to change events between months
    handleEvent(changeDates,event: CalendarEvent){
     // this.modal.open(this.modalContent);
     let s = event.start.toString();
     let e = event.end.toString();
        this.form.setValue({
          start:s,
          end:e,
          id: event.id
        });
      this.modalService.open(changeDates).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }

  //   open(changeDates,start,end) {
  //     this.form.setValue({
  //       start:start,
  //       end:end,
  //       id: this.auth.userId
  //     });
  //    this.modalService.open(changeDates).result.then((result) => {
  //      this.closeResult = `Closed with: ${result}`;
  //    }, (reason) => {
  //      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //    });
  //  }

    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
    }

    //this function handles the updated event from the form field that allows the user to change the event between months
    updateHoliday(){
      let data = this.form.getRawValue();
      let newStart = new Date(data.start);
      let newEnd = new Date(data.end);
      let id = data.id;

      if(isFuture(newStart) || isToday(newStart)){
        this.requestCollection.doc(id).update({
        start: newStart,
        end: newEnd
      })
      this.refresh.next();
    }

      // let start = event.start;

      // let newStart = new Date(start);

      // let changedevent: CalendarEventTimesChangedEvent = {event,newStart};

      // this.eventTimesChanged(changedevent);
      
    }

    //function to handle updating events when they are dragged and dropped on the calendar
    eventTimesChanged({event,newStart,newEnd}: CalendarEventTimesChangedEvent): void {
      event.start = newStart;
      event.end = newEnd;

      if(isFuture(newStart) || isToday(newStart)){
        this.requestCollection.doc(event.id).update({
        start: newStart,
        end: newEnd
      })
      this.refresh.next();
    }

    else{
      alert('day unavailable');
      
    }
      
    }

    //function to alter the number of staff members that can book the same day off
    change(num){
      let n : number = num;
      this.bookabledays = n;
      let days = {
        bookableDays : n
      }
      this.bookableDays.doc('BS1ZbteQOLsFbRsYeFND').update(days);
    }

}
