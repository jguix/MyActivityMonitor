import { HealthValue } from 'react-native-health';

// For the activities, react-native-health is returning a former type instead of
// what is declared in its types Importantly, start and end properties are returned
// instead of startDate and endDate
export type AppleActivityCount = HealthValue & {
  device: string;
  distance: number;
  end: string;
  sourceId: string;
  sourceName: string;
  start: string;
  tracked: boolean;
};
