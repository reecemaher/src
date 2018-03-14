import {  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils'

export interface Roster{
    title?: string;
    date?: Date;
    color?: Object;
    id?: number;
    actions?: CalendarEventAction;

}