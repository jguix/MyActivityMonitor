import { Platform } from 'react-native';

import { AppleHealthService } from './apple-health.service';
import { HealthConnectService } from './health-connect.service';
import { getHealthService } from './health.factory';

jest.mock('./apple-health.service');
jest.mock('./health-connect.service');

describe('health factory test suite', () => {
  describe('getHealthService', () => {
    it('should return an instance of AppleHealthService', () => {
      Platform.OS = 'ios';
      expect(getHealthService()).toBeInstanceOf(AppleHealthService);
      expect(AppleHealthService).toHaveBeenCalledTimes(1);
    });

    it('should return an instance of HealthConnectService', () => {
      Platform.OS = 'android';
      expect(getHealthService()).toBeInstanceOf(HealthConnectService);
      expect(HealthConnectService).toHaveBeenCalledTimes(1);
    });

    it('should call the AppleHealthService constructor just once', () => {
      Platform.OS = 'ios';
      getHealthService();
      getHealthService();
      getHealthService();
      expect(AppleHealthService).toHaveBeenCalledTimes(1);
    });

    it('should call the HealthConnectService constructor just once', () => {
      Platform.OS = 'android';
      getHealthService();
      getHealthService();
      getHealthService();
      expect(HealthConnectService).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the platform is not android or ios', () => {
      Platform.OS = 'macos';
      expect(() => getHealthService()).toThrowError(
        'Invalid platform for health service'
      );
    });
  });
});
