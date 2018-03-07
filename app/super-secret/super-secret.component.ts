import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable'

import {  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { Subject } from 'rxjs/Subject';
import { colors } from '../calendar/colors';
import { User } from '../core/user';
import { rosters } from './dbTest';
import { forEach } from '@angular/router/src/utils/collection';
import {CalendarComponent} from "ap-angular2-fullcalendar/src/calendar/calendar";
import { RostersService } from '../service/rosters.service'
import { ViewChild } from '@angular/core/src/metadata/di';

@Component({
  selector: 'super-secret',
  templateUrl: './super-secret.component.html',
  styleUrls: ['./super-secret.component.css']
})


export class SuperSecretComponent implements OnInit {
  //@ViewChild('myCal') calendar : CalendarComponent;

  private calCol: AngularFirestoreCollection<any>;
  cal: Observable<any[]>;
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  private departmentCol: AngularFirestoreDocument<any>;
  departmentPbs: Observable<any>;
  private calendarShopfloor: Object;

  
  
  //view: string = 'month';
  viewDate: Date = new Date();
   departments =[ 
      'Shopfloor',
      'Checkouts',
     'Dairy'
   ];


   rostersView = {};

  constructor(private afs: AngularFirestore,private roster: RostersService) {
     this.calCol = this.afs.collection<any>('fullCalendar')

      
    this.cal = this.calCol.snapshotChanges().map(actions => {
       return actions.map(a => {
         const data = a.payload.doc.data();
         const id = a.payload.doc.id;
        return { id, data};
      });
     });

    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();

    this.departmentCol = this.afs.doc<any>('departments/MDf84sbC5xbG7cO8xhV1');
    this.departmentPbs = this.departmentCol.valueChanges();


    //this.rosterView.push(this.roster);
    
   }

   

  ngOnInit() {
    this.roster.getRoster( this.roster.rosterView);
    this.rostersView = this.roster.calendarShopfloor;
  }

  filerByDepartment(department: string){
    console.log('D =' + department);
    this.usersCollection = this.afs.collection<User>('users', ref => {
      return ref.where('Department','==',department);
    });
    this.users = this.usersCollection.valueChanges();
  }

  add(){
   // this.calCol.add();
   //this.calendar.fullCalendar('refetchEvents');

   
  }

  showCalendar(employeeCalendar: string){
    console.log(employeeCalendar + "'s" + 'Calendar');
  }

  reset(){
    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();
  }


  user(){
    this.usersCollection = this.afs.collection<User>('users', ref => {
      return ref.where('displayName','==','reece');
    });
    this.users = this.usersCollection.valueChanges();
  }
  
   edit = rosters.Liz["start"] = new Date('February 15,2018');
     

   //events:any = this.rosterView;

  // refresh: Subject<any> = new Subject();

  // eventTimesChanged({
  //   event,
  //   newStart,
  //   newEnd
  // }: CalendarEventTimesChangedEvent): void {
  //   event.start = newStart;
  //   event.end = newEnd;
  //   //this.handleEvent('Dropped or resized', event);
  //   this.refresh.next();
  // }

  // calendarShopfloor: Object ={
  //   //height: 'parent',
  //   fixedWeekCount: false,
  //   defaultDate: '2018-02-14',
  //   editable: true,
  //   eventLimit: false,
  //   events: this.rosterView
    
  //  }
  

}


