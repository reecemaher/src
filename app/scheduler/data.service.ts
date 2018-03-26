import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DayPilot} from "daypilot-pro-angular";
import {HttpClient} from "@angular/common/http";
import { AngularFirestoreCollection, AngularFirestore } from "angularfire2/firestore";
import { User } from '../core/user';
import { requests} from '../holidays/requests';

@Injectable()
export class DataService {

  departmentCollection: AngularFirestoreCollection<any>;
  eventCollection: AngularFirestoreCollection<any>;
  holidaysCollection: AngularFirestoreCollection<requests>;

  resources: any[] = [
    { name: "Group A", id: "GA", expanded: true, children: [
      { name: "Resource 1", id: "R1"},
      { name: "Resource 2", id: "R2"}
    ]},
    { name: "Group B", id: "GB", expanded: true, children: [
      { name: "Resource 3", id: "R3"},
      { name: "Resource 4", id: "R4"}
    ]}
  ];

  events: any[] = [
    {
      id: "1",
      resource: "R1",
      start: '2018-03-25T14:00:00',
      end: '2018-03-25T22:00:00',
      text: "Scheduler Event 1",
      color: "#e69138"
    },
    {
      id: "2",
      resource: "R2",
      start: "2018-03-30",
      end: "2018-03-30",
      text: "Scheduler Event 2",
      color: "#6aa84f"
    },
    {
      id: "3",
      resource: "R2",
      start: "2018-11-03",
      end: "2018-11-03",
      text: "Scheduler Event 3",
      color: "#3c78d8"
    },
    {
      color:'#3c78d8',
      end:'2018-03-25T22:00:00',
      id: '4',
      resource:'aKSLf2mHL5SCAtIJ9AXRqDVV21U2',
      start:'2018-03-25T14:00:00',
      text:'14.00-22.00'
    }
  ];

  constructor(private http : HttpClient, private afs:AngularFirestore){

    this.departmentCollection = afs.collection('departments');
    this.eventCollection = afs.collection('departmentRosters');
    this.getDepartments(this.resources);
    this.buildEvent(this.events);
    //this.addDepartment('Fruit and Veg','06');
  }

  getDepartments(resource){
     this.departmentCollection.ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        let d = doc.data().department;
        let did = doc.data().departmenId;
        let ex = doc.data().expanded;
        let emp = doc.data().employees;
        let dep = { name: d, id: did,expanded:ex,children:emp}
        resource.push(dep);
      })
    })
  }

  buildEvent(event){
    this.eventCollection.ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        event.push(doc.data());
      })
    })
  }

  getHolidays(event){
    this.holidaysCollection = this.afs.collection('departmentRosters');
    this.holidaysCollection.ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        event.push(doc.data());
      })
    })

  }

  buildSchedule(departmentName: string, departmentId:string,expanded: boolean){
    // { name: "Group A", id: "GA", expanded: true, children: [
    //   { name: "Resource 1", id: "R1"},
    //   { name: "Resource 2", id: "R2"}
   let d = {name: departmentName, id:departmentName, expanded: true, children:[
     //{name:staffName, id:staffId}
   ]}

   this.resources.push(d);
  }


  addDepartment(a,b){
    let department = {
      department:a,
      departmentId:b,
      expanded: true
    }
    this.afs.collection('departments').add(department);
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.events);
      }, 200);
    });

    // return this.http.get("/api/events?from=" + from.toString() + "&to=" + to.toString());
  }

  getResources(): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.resources);
      }, 200);
    });

    // return this.http.get("/api/resources");
  }

}
