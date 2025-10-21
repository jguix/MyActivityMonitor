import moment, { Moment } from 'moment';
import AppleHealthKit, {
  HealthInputOptions, HealthKitPermissions, HealthObserver, HealthValue,
} from 'react-native-health';
import { Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';

import { logger } from '../../../config/logger';
import { formatDate } from '../../domain/shared/dates.domain';
import { AppleActivityCount } from './apple-health.types';
import { HealthService } from './health.service';
import { Activity } from './health.types';
import { getActivityMinutes } from '../../domain/activity-tracking/activity-tracking.domain';

export class AppleHealthService extends HealthService {
  initialize(): Observable<undefined> {
    // @ts-ignore This comes from the documentation
    const PERMS = AppleHealthKit.Constants.Permissions;

    const healthKitOptions = {
      permissions: {
        read: [PERMS.StepCount, PERMS.Workout],
        write: [],
      },
    } as HealthKitPermissions;

    logger.debug(`AppleHealthService.initialize`);

    return new Observable((observer: Subscriber<undefined>) => {
      AppleHealthKit.initHealthKit(healthKitOptions, (error: string) => {
        if (error) {
          logger.error(
            `AppleHealthService.initialize threw an error ${error} `
          );
          observer.error(error);
        } else {
          observer.next();
        }
        logger.debug(`AppleHealthService.initialize completed`);
        observer.complete();
      });
    });
  }

  getSteps(start: Moment, end: Moment): Observable<number> {
    return new Observable((observer: Subscriber<number>) => {
      const options: HealthInputOptions = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        includeManuallyAdded: true,
      };

      logger.debug(
        `AppleHealthService.getStepsForRange from ${options.startDate} to ${options.endDate}`
      );

      // @ts-ignore No types found for library
      AppleHealthKit.getDailyStepCountSamples(
        options,
        (err: string, results: HealthValue[] = []) => {
          if (err) {
            logger.error(err);
          }
          observer.next(
            results.reduce((acc, current) => acc + current.value, 0)
          );
          observer.complete();
        }
      );
    });
  }

  getActivityMinutes(fromDate: Moment, toDate: Moment): Observable<number> {
    return this.getNativeActivities(fromDate, toDate).pipe(
      map(getActivityMinutes)
    );
  }

  private getNativeActivities(fromDate: Moment, toDate: Moment) {
    return new Observable<Activity[]>((subscriber) => {
      const options: HealthInputOptions = {
        endDate: toDate.toISOString(),
        startDate: fromDate.toISOString(),
        // react-native-health types are wrong
        // so HealthObserver.Workout does not work
        type: 'Workout' as HealthObserver,
      };

      AppleHealthKit.getSamples(
        options,
        (_: string, results: HealthValue[]) => {
          logger.debug(
            `AppleHealthService.getNativeActivities retrieving activities from ${formatDate(
              fromDate
            )} to ${formatDate(toDate)}`
          );
          subscriber.next(
            this.mapNativeActivities(results as AppleActivityCount[])
          );
          subscriber.complete();
        }
      );
    });
  }

  private mapNativeActivities(activities: AppleActivityCount[]): Activity[] {
    return activities.map(({ start, end }) => ({
      endDate: moment(start),
      startDate: moment(end),
    }));
  }
}
