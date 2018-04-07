import { Component, ChangeDetectionStrategy,OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../core/auth.service'; 
import { Observable } from 'rxjs/Observable';
//date functions
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

//service
import {RostersService} from '../service/rosters.service';

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
  rosterEvent: Observable<Roster>;
  rosters$: Observable<any[]>;
  snapshot: any;
  //array which holds events to be loaded onto the calendar
  rosters:Object[] = [] ;
  //holds date that is clicked on
  clickedDate: Date;

  constructor(public auth: AuthService,private afs: AngularFirestore,private service:RostersService) { 
    //load current user details
    this.auth.loggedInUser();
    //load all work hours
    this.rosterCollection = this.afs.collection('departmentRosters');
    this.rosters$ = this.rosterCollection.valueChanges();
    console.log(this.auth.userId);
    //load current users works hours and holidays onto the calendar
    this.loadUserHolidays(this.rosters,this.refresh,this.auth.userId);
    //this.loadHours(this.rosters,this.refresh,this.auth.userId);
    this.loadRoster();
    }

  ngOnInit(){
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

    //loads currents users work hours
  loadRoster(){
    this.rosters$.subscribe(data => {
      //removes any hours from the database that dont match the users id
      for(var i = data.length - 1; i > 0; i--){
        if(data[i].resource != this.auth.userId){
          data.splice(i,1);
        }

        //converts users hours into a readable format for the calendar
        else{
          let hours = {
            title:data[i].text,
            start:new Date(data[i].start),
            end: new Date(data[i].end),
            id: data[i].resource,
            color: colors.yellow
          }
          
          this.rosters.push(hours);
        }
      }
    })
  }


  // loadRoster(rosters,refresh,myUid){
  //     return  this.afs.collection('rosters').ref.get().then(function(querySnapshot) {
  //       querySnapshot.forEach(function(doc) {

  //         if(doc.data().uid == myUid){
  //         rosters.push(doc.data());
  //         }
  //       });

  //       //rosters = rosters.filter(hours => hours.uid ==  myUid);

  //       for(var i = rosters.length -1; i >= 0 ; i--){
  //         //console.log(rosters[i].uid);
  //          if(rosters[i].uid != myUid){
  //            //console.log(rosters[i].uid);
  //             rosters.splice(i,1);
  //          } 
  //       }
       

  //       refresh.next();
  //   });
  // }

  
// hours not loaded asyncronously
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

  //loads in holidays and removes any that dont match the current users id
  //since this page requires both holidays and work hours they are manually pushed into an array
  //when the data detects a change in will add all the holidays again, so holidays with unique ids and pushed
  asyncLoadUserHolidays(){
    this.rosters$.subscribe(data => {
      for(var i = data.length -1; i >= 0; i--){
        if(data[i].uid != this.auth.userId){
          data.splice(i,1);
        }

        else{
          for(var i =0; i > this.rosters.length; i++){
            //if(this.rosters[i].id != data[i].id){
            this.rosters.push(data[i]);
           // }
          }
        }
      }
    })
  }

  //holidays added to the array but not async
  loadUserHolidays(rosters,refresh,myUid){
    return  this.afs.collection('holidays').ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {

        if(doc.data().uid == myUid){
        rosters.push(doc.data());
        }
      });
      
      refresh.next();
    });
  }

  
}

