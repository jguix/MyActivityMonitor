import { Moment } from 'moment';

import { Reports } from '../shared/reports.domain';

export enum ActivityTrackingTab {
  DAILY = 'ACTIVITY_TRACKER.DAY',
  WEEKLY = 'ACTIVITY_TRACKER.WEEK',
}

export type ActivityTrackingTabKey = keyof typeof ActivityTrackingTab;

export type DailyActivityInsights = DailyInsights & {
  minutes: number;
  minutesInRedZone?: number;
};

export type DailyStepsInsights = DailyInsights & {
  steps: number;
  stepsInRedZone?: number;
};

export type WeeklyActivityInsights = WeeklyInsights;

export type WeeklyStepsInsights = WeeklyInsights;

export type DebugInsightsData = {
  redZoneFromDate?: Moment;
  redZoneToDate?: Moment;
  timeEnteredRedZone?: Moment;
  timeExitedRedZone?: Moment;
  timeOfInfusion?: Moment;
};

type Insights = {
  // percentageInRedZone?: number;
  // redZonePercentage?: number;
};

type DailyInsights = Insights & {
  date: Moment;
  // fmAvailable: boolean;
  // redZoneStartDate?: Date;
};

type WeeklyInsights = Insights & {
  average?: number;
};

export type DailyStepInsightsReports = Reports<DailyStepsInsights>;
export type WeeklyStepInsightsReports = Reports<WeeklyStepsInsights>;
export type DailyActivityInsightsReports = Reports<DailyActivityInsights>;
export type WeeklyActivityInsightsReports = Reports<WeeklyActivityInsights>;
