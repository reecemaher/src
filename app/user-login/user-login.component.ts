import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { RostersService } from '../service/rosters.service'

@Component({
  selector: 'user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  canEdit;

  constructor(public auth: AuthService, public roster: RostersService) { }

  ngOnInit() {
   // this.roster.getRoster( this.roster.rosterView);
  }

}
