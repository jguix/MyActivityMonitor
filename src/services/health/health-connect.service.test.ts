import moment from 'moment';
import * as HealthConnect from 'react-native-health-connect';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { HealthConnectService } from './health-connect.service';
import { exerciseSessionRecordType, stepsRecordType } from './health-connect.types';

jest.mock('react-native-health-connect');

const mockHealthConnect = HealthConnect as jest.Mocked<typeof HealthConnect>;

let healthConnectService: HealthConnectService;

describe('HealthConnect service test suite', () => {
  beforeEach(() => {
    healthConnectService = new HealthConnectService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize the health connect api without error', (done) => {
      mockHealthConnect.initialize.mockResolvedValue(true);
      mockHealthConnect.getGrantedPermissions.mockResolvedValue(
        mockPermissions
      );

      healthConnectService
        .initialize()
        .pipe(
          tap((isError) => {
            expect(mockHealthConnect.initialize).toHaveBeenCalled();
            expect(mockHealthConnect.requestPermission).not.toHaveBeenCalled();
            expect(mockHealthConnect.getGrantedPermissions).toHaveBeenCalled();
            expect(isError).toBeFalsy();
            done();
          })
        )
        .subscribe();
    });

    it('should request permissions when told to the health connect api without error', (done) => {
      mockHealthConnect.initialize.mockResolvedValue(true);
      mockHealthConnect.requestPermission.mockResolvedValue(mockPermissions);

      healthConnectService
        .initialize({ requestAndroidPermissions: true })
        .pipe(
          tap((isError) => {
            expect(mockHealthConnect.initialize).toHaveBeenCalled();
            expect(mockHealthConnect.requestPermission).toHaveBeenCalledWith(
              mockPermissions
            );
            expect(
              mockHealthConnect.getGrantedPermissions
            ).not.toHaveBeenCalled();
            expect(isError).toBeFalsy();
            done();
          })
        )
        .subscribe();
    });

    it('should throw an error when initialization fails', (done) => {
      mockHealthConnect.initialize.mockResolvedValue(false);

      healthConnectService
        .initialize({ requestAndroidPermissions: true })
        .pipe(
          catchError((error) => {
            expect(error.message).toEqual(
              'Error initializing HealthConnect Service'
            );
            return of(undefined);
          }),
          tap((payload) => {
            expect(mockHealthConnect.initialize).toHaveBeenCalled();
            expect(mockHealthConnect.requestPermission).not.toHaveBeenCalled();
            expect(
              mockHealthConnect.getGrantedPermissions
            ).not.toHaveBeenCalled();
            expect(payload).toBeUndefined();
            done();
          })
        )
        .subscribe();
    });

    it('should throw an error when permissions are not granted', (done) => {
      mockHealthConnect.initialize.mockResolvedValue(true);
      mockHealthConnect.requestPermission.mockResolvedValue([]);

      healthConnectService
        .initialize({ requestAndroidPermissions: true })
        .pipe(
          catchError((error) => {
            expect(error.message).toEqual(
              'Error getting permissions for HealthConnect Service'
            );
            return of(undefined);
          }),
          tap((payload) => {
            expect(mockHealthConnect.initialize).toHaveBeenCalled();
            expect(mockHealthConnect.requestPermission).toHaveBeenCalled();
            expect(
              mockHealthConnect.getGrantedPermissions
            ).not.toHaveBeenCalled();
            expect(payload).toBeUndefined();
            done();
          })
        )
        .subscribe();
    });
  });

  describe('getActivityMinutes', () => {
    it('should retrieve the aggregated activity minutes between two dates', (done) => {
      const fromDate = moment('2001-01-01T00:00:00.000Z');
      const toDate = moment('2001-01-01T23:59:59.999Z');

      mockHealthConnect.aggregateRecord.mockResolvedValue({
        recordType: exerciseSessionRecordType,
        EXERCISE_DURATION_TOTAL: {
          inSeconds: 3600,
        },
      } as any);

      healthConnectService
        .getActivityMinutes(fromDate, toDate)
        .pipe(
          tap(() => {
            expect(mockHealthConnect.aggregateRecord).toHaveBeenCalledTimes(1);
            expect(mockHealthConnect.aggregateRecord).toHaveBeenCalledWith({
              timeRangeFilter: {
                operator: 'between',
                startTime: fromDate.toISOString(),
                endTime: toDate.toISOString(),
              },
              recordType: exerciseSessionRecordType,
            });
            done();
          })
        )
        .subscribe();
    });
  });

  describe('getSteps', () => {
    it('should get the aggregated number of steps between two dates', (done) => {
      const fromDate = moment('2001-01-01T00:00:00.000Z');
      const toDate = moment('2001-01-01T23:59:59.999Z');

      mockHealthConnect.aggregateRecord.mockResolvedValue({
        recordType: stepsRecordType,
        COUNT_TOTAL: 1000,
      } as any);

      healthConnectService
        .getSteps(fromDate, toDate)
        .pipe(
          tap(() => {
            expect(mockHealthConnect.aggregateRecord).toHaveBeenCalledTimes(1);
            expect(mockHealthConnect.aggregateRecord).toHaveBeenCalledWith({
              timeRangeFilter: {
                operator: 'between',
                startTime: fromDate.toISOString(),
                endTime: toDate.toISOString(),
              },
              recordType: stepsRecordType,
            });
            done();
          })
        )
        .subscribe();
    });
  });
});

const mockPermissions: HealthConnect.Permission[] = [
  { accessType: 'read', recordType: stepsRecordType },
  { accessType: 'read', recordType: exerciseSessionRecordType },
];
