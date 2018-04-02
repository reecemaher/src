import { Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {DayPilot} from "daypilot-pro-angular";
import Modal = DayPilot.Angular.Modal;
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {DataService, CreateEventParams} from "../data.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  @ViewChild("modal") modal: Modal;
  @Output() close= new EventEmitter();

  form: FormGroup;
  dateFormat = "dd/MM/yyyy h:mm tt";
  time = "dd/MM/yyyy h:mm tt";

  resource:any[];

  constructor(private fb:FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name:["", [Validators.required]],
      start:["", this.dateTimeValidator(this.dateFormat)],
      end:["",[Validators.required, this.dateTimeValidator(this.dateFormat)]],
      resource: ["",Validators.required]
    });
    this.ds.getResources().subscribe(result => this.resource = result);
   }

   show(args: any){
     console.log('test');
    args.name = "";
    this.form.setValue({
      start: args.start.toString(this.dateFormat),
      end: args.end.toString(this.dateFormat),
      name: "",
      resource: args.resource
    });
    this.modal.show();
   }

   submit(){
    let data = this.form.getRawValue();

    let id = this.ds.afs.createId();

    let params: CreateEventParams = {
      start: DayPilot.Date.parse(data.start, this.dateFormat).toString(),
      end: DayPilot.Date.parse(data.end, this.dateFormat).toString(),
      text: data.name,
      resource: data.resource,
      
    };

    this.ds.createHours(params,id).subscribe(result => {
      //params.id = result.id;
      this.modal.hide(result);
    });

    this.ds.saveHours(params,id);
   }

   cancel(){
     this.modal.hide();
   }

   closed(args){
     this.close.emit(args);
   }

  ngOnInit() {
  }

  dateTimeValidator(format: string) {
    return function(c:FormControl) {
      let valid = !!DayPilot.Date.parse(c.value, format);
      return valid ? null : {badDateTimeFormat: true};
    };
  }

}
