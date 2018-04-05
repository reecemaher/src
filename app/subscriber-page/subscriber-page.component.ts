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

  postRef;
  post$;
  user;
  userDepartment;
  myUid;
  refresh: Subject<any> = new Subject();
  departmentRoster: Object[] =[];

  public collegues : AngularFirestoreCollection<any>;
  public collegues$: Observable<any>;

  constructor(private afs: AngularFirestore, public auth: AuthService) { 
    this.auth.user$.subscribe(user=>{
      this.myUid = user.uid;
      this.userDepartment = user.department;
      //this.userDisplayName = user.displayName;
      console.log(user.uid + ' ' + user.department);
      this.loadDepartmentRoster(this.departmentRoster,this.userDepartment,this.refresh);
    })
  }

  ngOnInit() {

    this.collegues = this.afs.collection<any>('departmentRosters');

    // this.collegues = this.afs.collection('users', ref => {
    //   return ref.where('Department','==', 'Shopfloor')
    // });

    this.collegues$ = this.collegues.valueChanges();

  }

  editPost() {
   // this.postRef.update({ title: 'Info has been edited'})
    //this.postRef.update({ {Department.shopfloor.Monday.hours: '17.00 - 22.00'} })
   // this.postRef.update({ Department : {checkouts : { Monday: { name: 'lorcan' , hours: '12.00-16.00'}}}})
    this.postRef.update({ content: 'late'})
  }


  deletePost() {
    this.postRef.update({ content: ''})
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
        console.log(departmentRoster);
          if(doc.data().department == userDepartment){
            departmentRoster.push(hours);
        }
      });
      refresh.next();
    });
    // return this.collegues.ref.get().then(function(querySnapshot) {
    //   querySnapshot.forEach(function(doc){

    //     let roster = {
    //       start:new Date(doc.data().start),
    //       end: new Date(doc.data().end),
    //       title:doc.data().text,
    //       color:{
    //         primary: '#e3bc08',
    //         secondary: '#FDF1BA'
    //       },
    //     }
    //     console.log(departmentRoster);

    //     if(doc.data().department == userDepartment){
    //       departmentRoster.push(roster);
    //       console.log(departmentRoster);
    //     }
    //     });

    //     // for(var i= departmentRoster.length -1; i >= 0 ;i--){
    //     //   if(departmentRoster[i].department != userDepartment){
    //     //     departmentRoster.splice(i,1);
    //     //   }
    //     // }

    //     refresh.next();

    //   });
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
