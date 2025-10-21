import { Moment } from 'moment';
import {
  aggregateRecord, getGrantedPermissions, initialize as initializeHealthConnect, Permission,
  requestPermission,
} from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';
import { from, Observable, of, throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import {
  ExerciseSessionRecordType, exerciseSessionRecordType, stepsRecordType, StepsRecordType,
} from './health-connect.types';
import { HealthService, InitializationOptions } from './health.service';
import { logger } from '../../../config/logger';

export class HealthConnectService extends HealthService {
  private uninitializedException = new Error(
    'Error initializing HealthConnect Service'
  );

  private unauthorizedException = new Error(
    'Error getting permissions for HealthConnect Service'
  );

  private permissions: Permission[] = [
    { accessType: 'read', recordType: stepsRecordType },
    { accessType: 'read', recordType: exerciseSessionRecordType },
  ];

  initialize(options?: InitializationOptions) {
    this.debug('initialize', JSON.stringify(options));

    return from(initializeHealthConnect()).pipe(
      mergeMap((success) => {
        this.debug(`initialize: initialization success ${success}`);
        return success
          ? of(undefined)
          : throwError(this.uninitializedException);
      }),
      mergeMap(() =>
        options?.requestAndroidPermissions
          ? this.requestPermissions()
          : this.checkPermissions()
      ),
      mergeMap((success) => {
        this.debug(`initialize: authorization success ${success}`);
        return success ? of(undefined) : throwError(this.unauthorizedException);
      })
    );
  }

  getSteps(fromDate: Moment, toDate: Moment): Observable<number> {
    return this.getNativeSteps(fromDate, toDate);
  }

  getActivityMinutes(fromDate: Moment, toDate: Moment): Observable<number> {
    return this.getNativeMinutes(fromDate, toDate);
  }

  private getNativeSteps(fromDate: Moment, toDate: Moment): Observable<number> {
    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: fromDate.toISOString(),
      endTime: toDate.toISOString(),
    };

    this.debug(
      `getNativeSteps retrieving from ${timeRangeFilter.startTime} to ${timeRangeFilter.endTime}`
    );

    return from(
      aggregateRecord<StepsRecordType>({
        timeRangeFilter,
        recordType: stepsRecordType,
      })
    ).pipe(map(({ COUNT_TOTAL }) => COUNT_TOTAL));
  }

  private getNativeMinutes(
    fromDate: Moment,
    toDate: Moment
  ): Observable<number> {
    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: fromDate.toISOString(),
      endTime: toDate.toISOString(),
    };

    this.debug(
      `getNativeMinutes retrieving from ${timeRangeFilter.startTime} to ${timeRangeFilter.endTime}`
    );

    return from(
      aggregateRecord<ExerciseSessionRecordType>({
        timeRangeFilter,
        recordType: exerciseSessionRecordType,
      })
    ).pipe(
      map(({ EXERCISE_DURATION_TOTAL }) =>
        Math.round(EXERCISE_DURATION_TOTAL.inSeconds / 60)
      )
    );
  }

  private requestPermissions() {
    this.debug('requestPermissions');

    return from(requestPermission(this.permissions)).pipe(
      map(this.validatePermissions)
    );
  }

  private checkPermissions() {
    this.debug('checkPermissions');

    return from(getGrantedPermissions()).pipe(map(this.validatePermissions));
  }

  private validatePermissions(grantedPermissions: Permission[]) {
    const permissionNames = grantedPermissions.map(
      ({ recordType }) => recordType
    );
    return (
      permissionNames.includes(stepsRecordType) &&
      permissionNames.includes(exerciseSessionRecordType)
    );
  }

  private debug(...text: string[]) {
    logger.debug(`HealthConnectService.${text}`);
  }
}
