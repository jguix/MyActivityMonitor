import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  steps: 'goals.steps',
  minutes: 'goals.minutes',
};

export async function saveGoals(steps: number, minutes: number) {
  await AsyncStorage.multiSet([
    [KEYS.steps, String(steps)],
    [KEYS.minutes, String(minutes)],
  ]);
}

export async function loadGoals(): Promise<{ steps?: number; minutes?: number }> {
  const entries = await AsyncStorage.multiGet([KEYS.steps, KEYS.minutes]);
  const map = Object.fromEntries(entries);
  return {
    steps: map[KEYS.steps] ? Number(map[KEYS.steps]) : undefined,
    minutes: map[KEYS.minutes] ? Number(map[KEYS.minutes]) : undefined,
  };
}

export async function clearGoals() {
  await AsyncStorage.multiRemove([KEYS.steps, KEYS.minutes]);
}