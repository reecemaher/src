import {Component, ViewChild, Output, EventEmitter} from '@angular/core';
import {DayPilot} from "daypilot-pro-angular";
import Modal = DayPilot.Angular.Modal;
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {DataService, CreateEventParams} from "../data.service";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {

  @ViewChild("modal") modal : Modal;
  @Output() close = new EventEmitter();

  form: FormGroup;
  dateFormat = "dd/MM/yyyy h:mm tt";

  resources: any[];

  event: DayPilot.Event;

  constructor(private fb: FormBuilder, private ds: DataService) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      start: ["", this.dateTimeValidator(this.dateFormat)],
      end: ["", [Validators.required, this.dateTimeValidator(this.dateFormat)]],
      resource: ["", Validators.required],
      id:[""]
    });

    this.ds.getResources().subscribe(result => this.resources = result);
  }

  show(ev: DayPilot.Event) {
    this.event = ev;
    this.form.setValue({
      start: ev.start().toString(this.dateFormat),
      end: ev.end().toString(this.dateFormat),
      name: ev.text(),
      resource: ev.resource(),
      id: ev.id()
    });
    this.modal.show();
  }


  submit() {
    let data = this.form.getRawValue();

    // modify the original object from [events] which is stored in event.data
    this.event.data.start = DayPilot.Date.parse(data.start, this.dateFormat);
    this.event.data.end = DayPilot.Date.parse(data.end, this.dateFormat);
    this.event.data.resource = data.resource;
    this.event.data.text = data.name;
    this.event.data.id = data.id;

    this.ds.updateEvent(this.event).subscribe(result => {
      this.modal.hide(result);
    });

    let params:any= {
      start:  DayPilot.Date.parse(data.start, this.dateFormat).toString(),
      end: DayPilot.Date.parse(data.end, this.dateFormat).toString(),
      resource: data.resource,
      text: data.name,
      id: data.id
    }

    this.ds.editHours(params);
  }

  // submit(){
  //   let data = this.form.getRawValue();

  //   let id = data.id;

  //   let params: any = {
  //     start: DayPilot.Date.parse(data.start, this.dateFormat).toString(),
  //     end: DayPilot.Date.parse(data.end, this.dateFormat).toString(),
  //     text: data.name,
  //     resource: data.resource,
  //     id: data.id
      
  //   };

  //   this.ds.updateEvent(data).subscribe(result => {
  //     //params.id = result.id;
  //     this.modal.hide(result);
  //   });

  //   this.ds.updateHours(params,id);
  //  }

  cancel() {
    this.modal.hide();
  }

  closed(args) {
    this.close.emit(args);
  }

  dateTimeValidator(format: string) {
    return function(c:FormControl) {
      let valid = !!DayPilot.Date.parse(c.value, format);
      return valid ? null : {badDateTimeFormat: true};
    };
  }



}
