import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../core/auth.service';
import { CalendarEvent } from 'angular-calendar';
import { colors } from '../calendar/colors';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
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

@Component({
  selector: 'subscriber-page',
  templateUrl: './subscriber-page.component.html',
  styleUrls: ['./subscriber-page.component.sass']
})
export class SubscriberPageComponent implements OnInit {

  refresh: Subject<any> = new Subject();
  //array to hold rosters
  departmentRoster: Object[] =[];
  //load in all work hours
  public collegues : AngularFirestoreCollection<any>;
  public collegues$: Observable<any>;

  constructor(private afs: AngularFirestore, public auth: AuthService) { 
    //load logged in user data
    auth.loggedInUser();
    //load all rosters from db
    this.collegues = this.afs.collection<any>('departmentRosters');
    this.collegues$ = this.collegues.valueChanges();
    this.loadRoster();
    //function to populate array with rosters
    //this.loadDepartmentRoster(this.departmentRoster,this.auth.userDepartment, this.refresh);
  }

  ngOnInit() {

  }

  //loading rosters as observable(errors as the scheduler saves dates as string while this calendar requires javascript dates)
  loadRoster(){
    this.collegues$.subscribe(data => { 
      for(var i = data.length -1; i > 0; i--){
        console.log(data[i].department);
        if(data[i].department != this.auth.userDepartment){
          data.splice(i,1);
        }

        else{
          let hours = {
            title:data[i].text,
            start:new Date(data[i].start),
            end: new Date(data[i].end),
            id: data[i].resource,
            color: colors.yellow
          }

          data.push(hours);
          
       }

        // else{
        //   data[i].text = title:data[i].text;
        //   data[i].start = new Date(data[i].start);
        //   data[i].end = new Date(data[i].end);
        //   data[i].color = colors.yellow;
        //   this.departmentRoster = data;
        // }
      }
      this.departmentRoster = data;
      this.refresh.next();
    })
  }

  loadDepartmentRoster(departmentRoster,userDepartment,refresh){
    return this.afs.collection('departmentRosters').ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        let hours = {
          title:doc.data().text,
          start:new Date(doc.data().start),
          end: new Date(doc.data().end),
          id: doc.data().resource,
          color: colors.yellow
        }
          if(doc.data().department == userDepartment){
            departmentRoster.push(hours);
        }
      });
      refresh.next();
    });
  }

    view: string = 'month';
    viewDate: Date = new Date();
    
    clickedDate: Date;

    activeDayIsOpen: boolean = true;
    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
     if (isSameMonth(date, this.viewDate)) {
       if (
         (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0
         ) {
       this.activeDayIsOpen = false;
        } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }


}
