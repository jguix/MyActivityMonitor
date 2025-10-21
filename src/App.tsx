import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Button,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useHealthToday } from './hooks/useHealthToday';
import { loadGoals, saveGoals } from './services/storage/storage.service';
import GoalsModal from './components/goals-modal.component';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const DEFAULT_STEPS_GOAL = 8000;
const DEFAULT_MINUTES_GOAL = 30;

// Animation helpers
const animateTo = (val: Animated.Value, to: number, duration = 1200) =>
  Animated.timing(val, {
    toValue: to,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true, // we're animating numbers & colors (layout/color), so false
  });

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const [stepsGoal, setStepsGoal] = useState(DEFAULT_STEPS_GOAL);
  const [minutesGoal, setMinutesGoal] = useState(DEFAULT_MINUTES_GOAL);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const { loading, granted, error, steps, minutes, reload } = useHealthToday();

  // Animated values
  const stepsAnim = useRef(new Animated.Value(0)).current;
  const minutesAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Display numbers (rounded) fed by animated values
  const [stepsDisplay, setStepsDisplay] = useState(0);
  const [minutesDisplay, setMinutesDisplay] = useState(0);

  // Attach listeners once
  useEffect(() => {
    const sId = stepsAnim.addListener(({ value }) =>
      setStepsDisplay(Math.round(value)),
    );
    const mId = minutesAnim.addListener(({ value }) =>
      setMinutesDisplay(Math.round(value)),
    );
    return () => {
      stepsAnim.removeListener(sId);
      minutesAnim.removeListener(mId);
    };
  }, [stepsAnim, minutesAnim]);

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

  // Animate when new data or goals change
  useEffect(() => {
    // animate numbers from current -> new values
    animateTo(stepsAnim, steps).start();
    animateTo(minutesAnim, minutes).start();
    // animate color/progress 0..1
    animateTo(progressAnim, progress).start();
  }, [steps, minutes, progress, stepsAnim, minutesAnim, progressAnim]);

  // Interpolated background color from yellow → green
  const backgroundColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(255, 113, 113, 1)', 'rgba(255, 235, 154, 1)', 'rgba(6, 190, 83, 1)'],
  });

  const handleSaveGoals = async (newSteps: number, newMinutes: number) => {
    setStepsGoal(newSteps);
    setMinutesGoal(newMinutes);
    await saveGoals(newSteps, newMinutes);
    setShowGoalsModal(false);
  };

  return (
    <SafeAreaProvider>
      <Animated.View style={[styles.safe, { backgroundColor }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.container}>
          <Text style={styles.h1}>Today</Text>

          <View style={styles.display}>
            <Text style={[styles.value, styles.bold]}>
              {loading ? '—' : stepsDisplay}
            </Text>
            <Text style={styles.goal}>
              Goal: {stepsGoal}
            </Text>
            <Text style={styles.metric}>
              Steps
            </Text>
          </View>

          <View style={styles.display}>
            <Text style={[styles.value, styles.bold]}>
              {loading ? '—' : minutesDisplay}
            </Text>
            <Text style={styles.goal}>
              Goal: {minutesGoal}
            </Text>
            <Text style={styles.metric}>
              Activity (min)
            </Text>
          </View>

          {granted === false && (
            <Text style={styles.warn}>
              Permissions not granted.{' '}
              {Platform.OS === 'android'
                ? 'Open Health Connect to grant access.'
                : ''}
            </Text>
          )}
          {error && <Text style={styles.warn}>Error: {error}</Text>}

          <View style={[styles.row, styles.marginTop]}>
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
      </Animated.View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingVertical: 40, gap: 10 },
  display: { flex: 0.5, flexDirection: "column", justifyContent: "center", alignItems: "center"},  
  h1: { fontSize: 28, fontWeight: '700' },
  metric: { fontSize: 24 },
  marginTop: { marginTop: 12 },
  value: { fontSize: 120 },
  goal: { fontSize: 20 },
  bold: { fontWeight: '700' },
  row: { flexDirection: 'row'},
  note: { opacity: 0.7, marginTop: 12 },
  warn: { color: '#a00', marginTop: 8 },
});
