import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { colors } from '../calendar/colors';

export interface requests{
    day?: CalendarMonthViewDay;
    start: Date;
    end?: Date;
    color: object;
    title: string;
    uid: string;
    id: string;
    department: string;
}