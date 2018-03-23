import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable'

import {  CalendarEvent,CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
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
import { Subject } from 'rxjs/Subject';
import { colors } from '../calendar/colors';
import { User } from '../core/user';
import { rosters } from './dbTest';
import { forEach } from '@angular/router/src/utils/collection';
import {CalendarComponent} from "ap-angular2-fullcalendar/src/calendar/calendar";
import { RostersService } from '../service/rosters.service';

@Component({
  selector: 'super-secret',
  templateUrl: './super-secret.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./super-secret.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class SuperSecretComponent implements OnInit {
  selected = 'All departments';
  view: string = 'month'
  private calCol: AngularFirestoreCollection<any>;
  cal: Observable<any[]>;
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  private departmentCal: AngularFirestoreCollection<any>;
  //departmentPbs: Observable<any>;

  
  
  //view: string = 'month';
  viewDate: Date = new Date();
   departments =[ 
      'Shopfloor',
      'Checkouts',
     'Dairy'
   ];

   days =[
     'Monday',
     'Tuesday',
     'Wednsday',
     'Thursday',
     'Friday',
     'Saturday',
     'Sunday'
   ]


   rostersView :Object[] = [];

  constructor(private afs: AngularFirestore,private roster: RostersService) {

      
    // this.cal = this.calCol.snapshotChanges().map(actions => {
    //    return actions.map(a => {
    //      const data = a.payload.doc.data();
    //      const id = a.payload.doc.id;
    //     return { id, data};
    //   });
    //  });

    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();

    this.departmentCal = this.afs.collection<any>('rosters');

   }

   

  ngOnInit() {
    this.loadhours(this.rostersView,this.actions,this.refresh);
    
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
        this.rostersView = this.rostersView.filter(iEvent => iEvent !== event);
      // this.handleEvent('Deleted', event);
      //this.requestCollection.({start:day, title: 'booked', color: colors.red});
      }
    }
  ];

  filerByDepartment(department: string,rosterView,actions,refresh){
    
    this.usersCollection = this.afs.collection<User>('users', ref => {
      return ref.where('department','==',department);
    });
    this.users = this.usersCollection.valueChanges();
    
    this.departmentCal = this.afs.collection<any>('rosters', ref =>{
      return ref.where('department', '==' ,department);
    });
    this.departmentCal.ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
               
        //doc.data()['actions'] = actions;
        rosterView.push(doc.data());
        //console.log(holidays);
      });

      //rosterView = rosterView.filter(employeeDepartment => employeeDepartment.dep == department);

      for(var i= rosterView.length -1; i >= 0 ;i--){
        if(rosterView[i].department != department){
          rosterView.splice(i,1);
        }
      }
      for(var i =0; i < rosterView.length; i++){
        rosterView[i]['actions'] = actions; 
        rosterView[i]['draggable'] = true;
      }
      refresh.next();
  });
    //this.loadhours(this.rostersView,this.refresh,this.actions);
  }


  reset(){
    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();
    this.selected ='All Departments';
    this.rostersView = [];
    this.loadhours(this.rostersView,this.actions,this.refresh);

  }

  loadhours(rosterView,actions,refresh){ 
    return  this.departmentCal.ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        //doc.data()['actions'] = actions;
        rosterView.push(doc.data());
        //console.log(holidays);
      });
      for(var i =0; i < rosterView.length; i++){
        rosterView[i]['actions'] = actions; 
        rosterView[i]['draggable'] = true;
      }
      refresh.next();
  });
  }

  activeDayIsOpen: boolean = false;
    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
      if (isSameMonth(date, this.viewDate)) {
        if (
          (isSameDay(this.viewDate, date) && this.activeDayIsOpen === false) ||
          events.length === 0
        ) {
          this.activeDayIsOpen = true;
        } else {
          this.activeDayIsOpen = false;
          this.viewDate = date;
        }
      }
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


  // user(){
  //   this.usersCollection = this.afs.collection<User>('users', ref => {
  //     return ref.where('displayName','==','reece');
  //   });
  //   this.users = this.usersCollection.valueChanges();
  // }
  
   
  

}


