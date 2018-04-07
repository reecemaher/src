import {  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils'

export interface Roster{
    title: string;
    start: Date;
    end:Date;
    color: Object;
    id: string;
    uid: string;
    department: string;
}