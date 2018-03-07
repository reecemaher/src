import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service'; 

@Component({
  selector: 'app-user-profiles',
  templateUrl: './user-profiles.component.html',
  styleUrls: ['./user-profiles.component.css']
})
export class UserProfilesComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

}
