import moment, { Moment } from 'moment';

import { Activity } from '../../services/health/health.types';

export const getActivityMinutes = (activities: Activity[]) => {
  return activities.reduce((acc, { endDate, startDate }) => {
    return acc + getDuration(startDate, endDate);
  }, 0);
};

const getDuration = (start: Moment, end: Moment) => {
  const durationMoment = moment.duration(end.diff(start));
  return Math.abs(durationMoment.asMinutes());
};
