import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DayPilot} from "daypilot-pro-angular";
import {HttpClient} from "@angular/common/http";
import { AngularFirestoreCollection, AngularFirestore } from "angularfire2/firestore";
import { User } from '../core/user';
import { requests} from '../holidays/requests';

export interface CreateEventParams {
  start: string;
  end: string;
  text: string;
  resource: string | number;
}

@Injectable()
export class DataService {

  departmentCollection: AngularFirestoreCollection<any>;
  departmentEvents: Observable<any>;
  eventCollection: AngularFirestoreCollection<any>;
  holidaysCollection: AngularFirestoreCollection<requests>;

  resources: any[] = [
    // { name: "Group A", id: "GA", expanded: true, children: [
    //   { name: "Resource 1", id: "R1"},
    //   { name: "Resource 2", id: "R2"}
    // ]}
  ];

  events: any[] = [
   
  ];

  categories:any[] = [];

  constructor(private http : HttpClient, public afs:AngularFirestore){

    this.departmentCollection = afs.collection('departments');
    this.departmentEvents = this.departmentCollection.valueChanges();
    this.eventCollection = afs.collection('departmentRosters');
    this.getDepartments(this.resources,this.categories);
    this.buildEvent(this.events);
    this.getHolidays(this.events);
    //this.addDepartment('Fruit and Veg','06');
  }

  getDepartments(resource,categories){
     this.departmentCollection.ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        let d = doc.data().department;
        let did = doc.data().departmentId;
        let ex = doc.data().expanded;
        let emp = doc.data().employees;
       
        let dep = { name: d, id: did,expanded:ex,children:emp};
        let cat ={id:did, name:d};
        resource.push(dep);
        categories.push(cat);
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
    this.holidaysCollection = this.afs.collection('holidays');
    this.holidaysCollection.ref.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        let resource = doc.data().uid;
        let end = doc.data().end;
        let start = doc.data().start;
        let id = doc.data().id;
        let text = doc.data().title;
        let color = doc.data().color.primary;
        let holiday = {resource:resource, end:end, start:start, backColor:'#e33030', id:id,text:text}

        event.push(holiday);
      })
    })

  }

  createHours(data: any,id) {
    let e = {
      start: data.start,
      end: data.end,
      resource: data.resource,
      id: id,
      text: data.text,
      department:data.department
    };

    //this.events.push(e);
    return Observable.of(e);
    //return this.http.post("/api/events/create", data).map((response:Response) => response.json());
  }

  saveHours(hours:any,id){
    let newHours = {
      start:hours.start,
      end:hours.end,
      id:id,
      resource:hours.resource,
      text:hours.text,
      color:'#3c78d8',
      department:hours.department
    }
    this.eventCollection.doc(id).set(newHours);
  }

  // deleteHours(hoursId,type){
  //   if(type != 'holidays'){
  //   this.eventCollection.doc(hoursId).delete();
  //   }

  //   else{
  //     this.holidaysCollection.doc(hoursId).delete();
  //   }
  // }

  deleteHours(hoursId){
    this.eventCollection.doc(hoursId).delete();
    
  }

  editHours(hours){
    let update={
      start: hours.start,
      end: hours.end,
      text: hours.text,
      resource: hours.resource
    }

    this.eventCollection.doc(hours.id).update(update);
  }

  updateHours(hours,id){
    let updatedHours={
      start:hours.newStart.value,
      end:hours.newEnd.value,
    }
    this.eventCollection.doc(id).update(updatedHours); 
  }

  updateEvent(data: DayPilot.Event): Observable<any> {
    console.log("Updating event: " + data.text());
    console.log(data);
    return Observable.of({result: "OK"});
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
        observer.next(this.events);
    });

    // return this.http.get("/api/events?from=" + from.toString() + "&to=" + to.toString());
  }

  getCategory(): Observable<any[]>{
    return new Observable(observer => {
      observer.next(this.categories);
    })
  }

  getResources(): Observable<any[]> {
  // return this.departmentEvents = this.eventCollection.valueChanges();
  
    return new Observable(observer => {
        observer.next(this.resources);
    });

    // return this.http.get("/api/resources");
  }

}
