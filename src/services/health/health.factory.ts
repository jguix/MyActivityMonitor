import { Platform } from 'react-native';

import { AppleHealthService } from './apple-health.service';
import { HealthConnectService } from './health-connect.service';
import { HealthService } from './health.service';

let iosService: HealthService;
let androidService: HealthService;

export const getHealthService = (): HealthService => {
  switch (Platform.OS) {
    case 'ios':
      if (!iosService) {
        iosService = new AppleHealthService();
      }
      return iosService;
    case 'android':
      if (!androidService) {
        androidService = new HealthConnectService();
      }
      return androidService;
    default:
      throw Error('Invalid platform for health service');
  }
};
