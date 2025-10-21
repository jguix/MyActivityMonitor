import { of } from 'rxjs';

export const getHealthService = jest.fn().mockReturnValue({
  getActivitiesReports: jest.fn(),
  getActivitiesReportsForDay: jest.fn(),
  getActivityMinutes: jest.fn(),
  getDailyActivitiesInsight: jest.fn(() => of({})),
  getDailyInsights: jest.fn(() => of({})),
  getDailyStepsInsight: jest.fn(() => of({})),
  getSteps: jest.fn(),
  getStepsForRange: jest.fn(),
  getStepsReports: jest.fn(),
  getStepsReportsForDay: jest.fn(),
  getWeeklyActivitiesInsights: jest.fn(() => of({})),
  getWeeklyInsights: jest.fn(() => of({})),
  getWeeklyStepsInsights: jest.fn(() => of({})),
  initialize: jest.fn(),
  unsubscribeListeners: jest.fn(),
});
