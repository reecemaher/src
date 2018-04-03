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

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
@Component({
  selector: 'calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class MyCalendarComponent implements OnInit {

  //scheduler hours
  sheduleCollection: AngularFirestoreCollection<any>;

  rosterCollection: AngularFirestoreCollection<Roster>;
  rosterDoc: AngularFirestoreDocument<Roster>;
  rosterEvent: Observable<Roster>;
  rosters$: Observable<Roster[]>;
  snapshot: any;

  rosters:Object[] = [] ;
  clickedDate: Date;

  //test user id
  myUid;

  constructor(public auth: AuthService,private afs: AngularFirestore) { 
    this.auth.user$.subscribe(user=>{
      this.myUid = user.uid;
      //this.userDisplayName = user.displayName;
      console.log(user.uid);
      this.loadRoster(this.rosters,this.refresh,this.myUid);
      this.loadUserHolidays(this.rosters,this.refresh,this.myUid);
      this.loadHours(this.rosters,this.refresh,this.myUid);
    })
    }

  ngOnInit(){
    this.rosterCollection = this.afs.collection('test');
    this.rosters$ = this.rosterCollection.valueChanges()
    this.snapshot = this.rosterCollection.snapshotChanges()
    .map(arr => {
      console.log(arr)
      arr.map(snap => snap.payload.doc.data())
    });

    this.sheduleCollection = this.afs.collection('DepartmentRosters');
    }
    
  view: string = 'month';
  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();
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


  loadRoster(rosters,refresh,myUid){
      return  this.afs.collection('rosters').ref.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

          if(doc.data().uid == myUid){
          rosters.push(doc.data());
          }
        });

        //rosters = rosters.filter(hours => hours.uid ==  myUid);

        for(var i = rosters.length -1; i >= 0 ; i--){
          //console.log(rosters[i].uid);
           if(rosters[i].uid != myUid){
             //console.log(rosters[i].uid);
              rosters.splice(i,1);
           } 
        }
       

        refresh.next();
    });
  }

  loadHours(rosters,refresh,myUid){
    return this.afs.collection('departmentRosters').ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        let hours = {
          title:doc.data().text,
          start:new Date(doc.data().start),
          end: new Date(doc.data().end),
          id: doc.data().resource,
          color: colors.yellow
        }

          if(hours.id == myUid){
            rosters.push(hours);
        }
      });

      // for(var i = rosters.length -1; i >= 0; i--){
      //   if(rosters[i].id != myUid){
      //     rosters.splice(i,1);
      //   }
      // }
      
      refresh.next();
    });
  }

  loadUserHolidays(rosters,refresh,myUid){
    return  this.afs.collection('holidays').ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {

        if(doc.data().uid == myUid){
        rosters.push(doc.data());
        }
      });

      //rosters = rosters.filter(holidays => holidays.uid == myUid);

      // for(var i = rosters.length -1; i >= 0 ; i--){
      //    if(rosters[i].uid != myUid || rosters[i].uid == undefined){
      //      console.log(rosters[i].uid);
      //       rosters.splice(i,1);
      //    } 
      // }
      
      refresh.next();
    });
  }

  
}

