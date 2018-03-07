import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../core/auth.service';
import { CalendarEvent } from 'angular-calendar';
import { colors } from '../calendar/colors';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'subscriber-page',
  templateUrl: './subscriber-page.component.html',
  styleUrls: ['./subscriber-page.component.sass']
})
export class SubscriberPageComponent implements OnInit {

  postRef;
  post$;
  user;

  public collegues : AngularFirestoreCollection<any>;
  public collegues$: Observable<any>;

  constructor(private afs: AngularFirestore, public auth: AuthService) { 
   this.auth.user$.subscribe(user => this.user = user)

  }

  ngOnInit() {
    this.postRef = this.afs.doc('rosters/Departments');
    this.post$ = this.postRef.valueChanges();

    this.collegues = this.afs.collection('users', ref => {
      return ref.where('Department','==', 'Shopfloor')
    });

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

    view: string = 'month';
    viewDate: Date = new Date();
    events: CalendarEvent[] = [
    {
      title: '14.00-22.00',
      color: colors.red,
      start: new Date(),
      actions:[
        {
          label: '<i class="fa fa-fw-pencil"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            console.log('Edit Event', event);
          }
        }
      ],
      draggable: true
    }
  ];

   joeHours: CalendarEvent[] = [
    {
      title: '12.00-20.00',
      color: colors.red,
      start: new Date(),
      actions:[
        {
          label: '<i class="fa fa-fw-pencil"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            console.log('Edit Event', event);
          }
        }
      ]
    }
  ];

   patHours: CalendarEvent[] = [
    {
      title: '17.00-22.00',
      color: colors.red,
      start: new Date()/*,
      actions:[
        {
          label: '<i class="fa fa-fw-pencil"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            console.log('Edit Event', event);
          }
        }
      ]*/
    }
  ];

  clickedDate: Date;


}
