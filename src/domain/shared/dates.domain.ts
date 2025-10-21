import moment, { HTML5_FMT, Moment } from 'moment';

export type DateType = Moment | Date | string;
export const databaseTimeLocale = 'en';

export const formatDate = (date: DateType = moment()) =>
  moment(date).format(HTML5_FMT.DATE);

export const dateToDatabaseLocaleString = (date: DateType = moment()) => {
  return formatDate(moment(date).locale(databaseTimeLocale));
};

export const getDatesArray = (startDate: Moment, endDate: Moment) => {
  const date = startDate.clone();
  const dates = [];

  while (date.isSameOrBefore(endDate)) {
    dates.push(date.clone());
    date.add(1, 'day');
  }
  return dates;
};
