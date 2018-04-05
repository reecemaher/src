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

//modal
import { NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { merge } from 'rxjs/operators';

@Component({
  selector: 'super-secret',
  templateUrl: './super-secret.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./super-secret.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class SuperSecretComponent implements OnInit {
  selected = 'All departments';
  private calCol: AngularFirestoreCollection<any>;
  cal: Observable<any[]>;
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  private departmentCal: AngularFirestoreCollection<any>;
  //departmentPbs: Observable<any>;

  private deprartments:AngularFirestoreCollection<any>;
  private $departments:Observable<any>;
  private d:Observable<any>;

  //modal
  closeResult: string;
  //modalForm
  form: FormGroup;
  newDepartment: FormGroup;

  employees =[];
  
  view: string = 'month';
  viewDate: Date = new Date();
   departments =[];

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

  constructor(private afs: AngularFirestore,private roster: RostersService,private modalService: NgbModal,private fb: FormBuilder) {

      this.form = this.fb.group({
        email: [""],
        displayName:[""],
        department:[""],
        id:[""]
      });

      this.newDepartment = this.fb.group({
       department:[""]
      });

    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();

    this.deprartments = this.afs.collection('departments');
    this.$departments = this.deprartments.valueChanges();
    this.d = this.deprartments.valueChanges();
    this.d.subscribe(data => this.departments = data);
    // this.d.subscribe(data =>{ 
    //   for(var i = 0; i < data.length; i++){
    //     //console.log(data[i]);
    //     if(data[i].department != )
    //     this.departments.push(data[i].department);
    // }
    // });
   }

   open(content,user) {
     this.form.setValue({
       email:user.email,
       displayName:user.displayName,
       department:user.department,
       id:user.uid
     });
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  createDepartmentModal(newD) {
   this.modalService.open(newD).result.then((result) => {
     this.closeResult = `Closed with: ${result}`;
   }, (reason) => {
     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
   });
 }

   private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  updateUser(employees){
    let data = this.form.getRawValue();
    let update = {
      email:data.email,
      displayName: data.displayName,
      department:data.department,
      uid:data.id
    }

    this.departmentCal.ref.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        let emp = doc.data().employees;
        employees.push(doc.data());
      });
    });

    this.usersCollection.doc(data.id).update(data);
    let d = this.deprartments.ref.where('department', '==' , data.department).get();
    d.then(() => {
    })

    this.deprartments.doc('a0LyQOYvz0UGOe7hUHwf').set({employees:[{
      name:data.displayName,
      id: data.id
    }]},{merge:true})
  }


  ngOnInit() {
   // this.getDepartments(this.departments);
  }

  filerByDepartment(department: string,rosterView,actions,refresh){
    
    this.usersCollection = this.afs.collection<User>('users', ref => {
      return ref.where('department','==',department);
    });
    this.users = this.usersCollection.valueChanges();
  }


  reset(){
    this.usersCollection = this.afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();
    this.selected ='All Departments';

  }
  
    getDepartments(departments){
      return  this.deprartments.ref.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          let d = doc.data().department;
          departments.push(d);
          //console.log(holidays);
        });
      });
  }

  addDepartment(){
    let data = this.newDepartment.getRawValue();
    let department = data.department;
    let id = this.afs.createId();
    let departmentId = this.afs.createId();
    let employees = [{
      id:"",
      name:""
    }];

    let newDepartment = {
      department: department,
      departmentId: departmentId,
      id: id,
      employees: employees
    }

    this.deprartments.doc(id).set(newDepartment);

  }
  

}


