import { Moment } from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { getDatesArray } from '../../domain/shared/dates.domain';
import { logger } from '../../../config/logger';
import { DailyActivityInsights, DailyStepsInsights } from '../../domain/activity-tracking/activity-tracking.types';

export type InitializationOptions = {
  requestAndroidPermissions?: boolean;
};

export abstract class HealthService {
  abstract initialize(options?: InitializationOptions): Observable<undefined>;

  abstract getSteps(fromDate: Moment, toDate: Moment): Observable<number>;

  abstract getActivityMinutes(
    fromDate: Moment,
    toDate: Moment
  ): Observable<number>;

  getDailyInsights(
    date: Moment,
  ): Observable<[DailyActivityInsights, DailyStepsInsights]> {
    return forkJoin([
          this.getDailyActivitiesInsight(date),
          this.getDailyStepsInsight(date),
        ]);
  }

  getDailyActivitiesInsight(
    date: Moment,
  ): Observable<DailyActivityInsights> {
    const startDate = date.clone().startOf('d');
    const endDate = date.clone().endOf('d');

    logger.debug(
      `HealthService.getDailyActivitiesInsight from ${startDate.toISOString()} to ${endDate.toISOString()} `
    );

    return this.getActivityMinutes(startDate, endDate).pipe(
      map((minutes) => {
        return {
          date,
          minutes,
        };
      })
    );
  }

  getDailyStepsInsight(
    date: Moment,
  ): Observable<DailyStepsInsights> {
    const startDate = date.clone().startOf('d');
    const endDate = date.clone().endOf('d');

    logger.debug(
      `HealthService.getDailyStepsInsight from ${startDate.toISOString()} to ${endDate.toISOString()} `
    );

    return this.getSteps(startDate, endDate).pipe(
      map((steps) => {
        return {
          date,
          steps,
        };
      })
    );
  }

  getWeeklyInsights(
    startDate: Moment,
    endDate: Moment,
  ): Observable<{
    dailyActivityInsights: DailyActivityInsights[];
    dailyStepInsights: DailyStepsInsights[];
  }> {
    if (startDate.isSameOrAfter(endDate)) {
      throw new Error(`startDate cannot be the same or after endDate`);
    }

    logger.debug(
      `HealthService.getWeeklyActivitiesInsights from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const dates = getDatesArray(startDate, endDate);

    const dailyInsights$ = dates.map((insightDate) => {
      return this.getDailyInsights(insightDate);
    });

    return dailyInsights$.length
      ? forkJoin(dailyInsights$).pipe(
          map((dailyInsights) => {
            const dailyActivityInsights: DailyActivityInsights[] = [];
            const dailyStepInsights: DailyStepsInsights[] = [];

            dailyInsights.forEach(([activityInsight, stepInsight]) => {
              dailyActivityInsights.push(activityInsight);
              dailyStepInsights.push(stepInsight);
            });

            return {
              dailyActivityInsights,
              dailyStepInsights,
            };
          })
        )
      : of({
          dailyActivityInsights: [],
          dailyStepInsights: [],
        });
  }
}
