import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { colors } from '../calendar/colors';

export interface requests{
    day?: CalendarMonthViewDay;
    start: Date;
    end?: Date;
    color: string;
    title: string;
    uid: string;
}