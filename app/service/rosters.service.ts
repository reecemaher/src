import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument } from 'angularfire2/firestore';
import { Roster } from '../calendar/roster';
import { Rosters } from './rosters';

@Injectable()
export class RostersService  {
  public rosterCollection: AngularFirestoreCollection<Roster>;
  public rosterDoc: AngularFirestoreDocument<Roster>;
  rosterEvent: Observable<Roster>;
  rosters$: Observable<Roster>;

  public rosterView = [{title: 'test',
  start: new Date("2018-02-23T14:00:00.000Z"),
    end: new Date("2018-02-23T14:22:00.000Z")
  }];
   public calendarShopfloor ={
    //height: 'parent',
    fixedWeekCount: false,
    defaultDate: '2018-02-14',
    editable: true,
    eventLimit: false,
    events: this.rosterView
     }

  constructor(private afs:AngularFirestore) {

    
}

// retrieveData(rosterView,calendarShopfloor,loadComplete){
//   return this.afs.collection("fullCalendar").ref.get().then(function(querySnapshot) {
//          querySnapshot.forEach(function(doc) {
//             rosterView.push(doc.data());
//             console.log(rosterView);
//          });
//          calendarShopfloor ={
//           //height: 'parent',
//           fixedWeekCount: false,
//           defaultDate: '2018-02-14',
//           editable: true,
//           eventLimit: false,
//           events: rosterView
//            }
//            loadComplete = true;
//      });
// }
   

getRoster(rosterView){
   return  this.afs.collection('fullCalendar').ref.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
       rosterView.push(doc.data());
       console.log(rosterView);
    });
});
}

// loadCalendar(calendarShopfloor){
    
//   console.log('building');
//   calendarShopfloor={
//   //height: 'parent',
//   fixedWeekCount: false,
//   defaultDate: '2018-02-14',
//   editable: true,
//   eventLimit: false,
//   events: this.rosterView
//  }
// }

// createCalendar(){
//   this.retrieveData(this.rosterView,this.calendarShopfloor,this.loadComplete);
//  // this.loadCalendar(this.calendarShopfloor);
  
// }
 
}
