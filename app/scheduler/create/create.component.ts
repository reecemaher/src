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
  dateFormat = "yyyy/MM/dd";
  time = "dd/MM/yyyy h:mm tt";

  resources:any[];

  defaultTime = {hour: 14, minute: 0};
  endTime = {hour: 22, minute: 0}
  meridian = true;

  

  constructor(private fb:FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name:["", [Validators.required]],
      start:["", this.dateTimeValidator(this.dateFormat)],
      end:["",[Validators.required, this.dateTimeValidator(this.dateFormat)]],
      resource: ["",Validators.required],
      timeStart:[""],
      timeEnd:[""],
      date:[""]
    });
    this.ds.getResources().subscribe(result => {this.resources = result;console.log(this.resources)});
   }

   toggleMeridian() {
    this.meridian = !this.meridian;
}

   show(args: any){
     let d = args.start.toString();
    args.name = "";
    this.form.setValue({
      start: args.start.toString(this.dateFormat),
      end: args.start.toString(this.dateFormat),
      name: "",
      resource: args.resource,
      timeStart:this.defaultTime,
      timeEnd:this.endTime,
      date:args.start.toString(this.dateFormat)
    });
    this.modal.show();
   }

   submit(){
    let data = this.form.getRawValue();
    let d = data.date;
    let t = data.timeStart.hour;
    let e = data.timeEnd.hour;
    let hours = t - e;

    let time = d + t;
    
    console.log(data.date);
    console.log(t);
    console.log(hours);

    let id = this.ds.afs.createId();
    console.log(data.resource);
    let params: any = {
      start: DayPilot.Date.parse(data.start, this.dateFormat).toString(),
      end: DayPilot.Date.parse(data.end, this.dateFormat).toString(),
      text: data.name,
      resource: data.resource,
      department: data.resource.name
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
