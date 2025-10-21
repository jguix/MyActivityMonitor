import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  Text,
  View,
  Button,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { useHealthToday } from './hooks/useHealthToday';
import { loadGoals, saveGoals } from './services/storage/storage.service';
import GoalsModal from './components/goals-modal.component';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

const DEFAULT_STEPS_GOAL = 8000;
const DEFAULT_MINUTES_GOAL = 30;

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const [stepsGoal, setStepsGoal] = useState(DEFAULT_STEPS_GOAL);
  const [minutesGoal, setMinutesGoal] = useState(DEFAULT_MINUTES_GOAL);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const { loading, granted, error, steps, minutes, reload } = useHealthToday();

  // Load goals from storage on first mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadGoals();
        if (typeof saved.steps === 'number') setStepsGoal(saved.steps);
        if (typeof saved.minutes === 'number') setMinutesGoal(saved.minutes);
      } finally {
        setGoalsLoaded(true);
      }
    })();
  }, []);

  // After goals are loaded (to avoid writing defaults over saved values),
  // persist on any change.
  useEffect(() => {
    if (!goalsLoaded) return;
    // saveGoals(stepsGoal, minutesGoal);rr
  }, [stepsGoal, minutesGoal, goalsLoaded]);

  useEffect(() => {
    // On Android we request HC permissions on first run; on iOS your impl decides.
    reload(true);
  }, [reload]);

  const progress = useMemo(() => {
    const p1 = Math.min(1, stepsGoal ? steps / stepsGoal : 0);
    const p2 = Math.min(1, minutesGoal ? minutes / minutesGoal : 0);
    return (p1 + p2) / 2;
  }, [steps, minutes, stepsGoal, minutesGoal]);

  const bgColor = useMemo(() => {
    // simple lerp between #FFE066 (yellow) and #2ECC71 (green)
    const lerp = (a: number, b: number, t: number) =>
      Math.round(a + (b - a) * t);
    const start = { r: 255, g: 224, b: 102 };
    const end = { r: 46, g: 204, b: 113 };
    const r = lerp(start.r, end.r, progress);
    const g = lerp(start.g, end.g, progress);
    const b = lerp(start.b, end.b, progress);
    return `rgb(${r}, ${g}, ${b})`;
  }, [progress]);

  const handleSaveGoals = async (newSteps: number, newMinutes: number) => {
    setStepsGoal(newSteps);
    setMinutesGoal(newMinutes);
    await saveGoals(newSteps, newMinutes);
    setShowGoalsModal(false);
  };

  return (
    <SafeAreaProvider style={[styles.safe, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <Text style={styles.h1}>Today</Text>

        <Text style={styles.metric}>
          Steps: <Text style={styles.bold}>{loading ? '—' : steps}</Text> /{' '}
          {stepsGoal}
        </Text>

        <Text style={styles.metric}>
          Activity:{' '}
          <Text style={styles.bold}>{loading ? '—' : minutes} min</Text> /{' '}
          {minutesGoal} min
        </Text>

        {granted === false && (
          <Text style={styles.warn}>
            Permissions not granted.{' '}
            {Platform.OS === 'android'
              ? 'Open Health Connect to grant access.'
              : ''}
          </Text>
        )}
        {error && <Text style={styles.warn}>Error: {error}</Text>}

        <View style={styles.row}>
          <Button title="Refresh" onPress={() => reload(false)} />
          <View style={{ width: 12 }} />
          <Button
            title="Set your goals"
            onPress={() => setShowGoalsModal(true)}
          />
        </View>

        <Text style={styles.note}>
          We read today’s steps and exercise time to show your activity
          progress. Goals are saved on this device.
        </Text>
      </View>

      <GoalsModal
        visible={showGoalsModal}
        initialSteps={stepsGoal}
        initialMinutes={minutesGoal}
        onCancel={() => setShowGoalsModal(false)}
        onSave={handleSaveGoals}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingVertical: 40, gap: 10 },
  h1: { fontSize: 28, fontWeight: '700' },
  metric: { fontSize: 18 },
  bold: { fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 12 },
  note: { opacity: 0.7, marginTop: 12 },
  warn: { color: '#a00', marginTop: 8 },
});
