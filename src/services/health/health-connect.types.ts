import { ExerciseSessionRecord, StepsRecord } from 'react-native-health-connect';

export type StepsRecordType = StepsRecord['recordType'];
export const stepsRecordType: StepsRecordType = 'Steps';

export type ExerciseSessionRecordType = ExerciseSessionRecord['recordType'];
export const exerciseSessionRecordType: ExerciseSessionRecordType =
  'ExerciseSession';
