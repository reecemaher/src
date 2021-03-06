import { Injectable } from '@angular/core';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import {  CalendarMonthViewDay } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils';
import { DayViewHour } from 'calendar-utils';
import { AngularFirestore,AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../core/auth.service'; 
import { Observable } from 'rxjs/Observable';
import { forEach } from '@angular/router/src/utils/collection';
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


@Injectable()
export class HolidaysService {

  public holidays: Object[] =[];
  public userId;
  public userDisplayName;
  public userDepartment;
  public refresh: Subject<any> = new Subject();


  requestCollection: AngularFirestoreCollection<any>;
  request: Observable<any[]>;
  

  constructor(public auth: AuthService,private afs: AngularFirestore,private afAuth: AngularFireAuth) {
    this.auth.user$.subscribe(user=>{
      this.userId = user.uid;
      this.userDisplayName = user.displayName;
      this.userDepartment = user.department;
      console.log(user.uid + ' ' +  user.displayName + ' ' + user.department);

      this.requestCollection = this.afs.collection<any>('holidays');

      this.request = this.requestCollection.valueChanges();
    })
  }


  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        console.log('eventid' + ' ' + event.id);
        this.afs.doc('holidays/' + event.id).update({ 
          start: event.start,
          //end: event.end
        });
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.holidays = this.holidays.filter(iEvent => iEvent !== event);
        console.log('eventid' + event.id);
        this.afs.doc('holidays/' + event.id).delete();
      }
    }
  ];

  loadhours(holidays,refresh,actions,userId,userDepartment){ 
    return  this.afs.collection('holidays').ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        holidays.push(doc.data());
        console.log(holidays);
      });

      for(var j =holidays.length -1; j >= 0; j--){
        if(holidays[j].department != userDepartment){
          holidays.splice(j,1);
        }
      }
      
      for(var i =0; i < holidays.length; i++){
        if(holidays[i].uid == userId){
        holidays[i]['actions'] = actions; 
        holidays[i]['draggable'] = true;
      }
    }
      refresh.next();
  });
  }

  


  addEvent(day: CalendarMonthViewDay): void {
    var referalId = this.userId + day;
      var newHolidays = {
          id: referalId,
          start: day,
          color: colors.red,
          title: this.userDisplayName + ' booked this day',
          actions:this.actions,
          draggable: true,
          uid: this.userId
        };

        var dbData ={
          id: referalId,
          start: day,
          color: colors.red,
          title: this.userDisplayName + ' booked this day',
          uid: this.userId,
          department: this.userDepartment
        }
      
      this.holidays.push(newHolidays);
      // this.requestCollection.add(dbData).then(ref => referalId = ref.id);
       this.requestCollection.doc(referalId).set(dbData);
    this.refresh.next();
  }

  addHoliday(day: CalendarMonthViewDay){
    let newDay = day.toString();
    let endDay = addDays(new Date(newDay),7);
    let referalId = this.userId + day;
    let clientHol = {
      id: referalId,
      start: day,
      color: colors.yellow,
      end: endDay,
      title: this.userDisplayName + ' booked this week',
      actions:this.actions,
      draggable: true,
      uid: this.userId
    }

    let serverHol = {
      id: referalId,
      start: day,
      color: colors.yellow,
      end: endDay,
      title: this.userDisplayName + ' booked this week',
      uid: this.userId,
      department: this.userDepartment
    }
    
    this.holidays.push(clientHol);

    this.requestCollection.doc(referalId).set(serverHol);
    //this.loadhours(this.holidays,this.actions,this.refresh);
    this.refresh.next();
  }

}
