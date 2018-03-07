import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';

import { User } from '../core/user';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {


  private departmentDoc: AngularFirestoreDocument<any>;
  //departments: Observable<any>;
   

  private usersCollection;
  users: Observable<User[]>;
  departmentFilter$: BehaviorSubject<string|null>;
   departments =[ 
      'Shopfloor',
      'Checkouts',
     'Dairy'
   ];

    data = {
    stringExample: 'Hello, World!',
    booleanExample: true,
    numberExample: 3.14159265,
    dateExample: new Date('December 10, 1815'),
    arrayExample: [5, true, 'hello'],
    nullExample: null,
    objectExample: {
        a: 5,
        b: true
    }
};

  constructor(private afs:AngularFirestore) { 
   // this.departmentFilter$ = new BehaviorSubject(null);
    this.usersCollection = afs.collection<any>('test');
    this.users = this.usersCollection.valueChanges();

    // this.departmentDoc = this.afs.doc('Departments/test');
    // this.departments = this.departmentDoc.valueChanges();
  }

  add(){
    this.usersCollection = this.afs.collection<any>('test').doc('test2');
    this.users = this.usersCollection.set(this.data);
    console.log("hi");
  }

  ngOnInit() {
  }

  filerByDepartment(department: string){
    console.log('D =' + department);
    this.usersCollection = this.afs.collection<User>('users', ref => {
      return ref.where('Department','==',department);
    });
    this.users = this.usersCollection.valueChanges();
  }
  

}
