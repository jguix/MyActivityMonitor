import { Moment } from 'moment';

export type Activity = {
  endDate: Moment;
  startDate: Moment;
};

export type ActivityDuration = {
  duration: number;
};
