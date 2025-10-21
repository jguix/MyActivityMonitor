import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  initialSteps: number;
  initialMinutes: number;
  onCancel: () => void;
  onSave: (steps: number, minutes: number) => void;
};

export default function GoalsModal({
  visible,
  initialSteps,
  initialMinutes,
  onCancel,
  onSave,
}: Props) {
  const [stepsStr, setStepsStr] = useState(String(initialSteps));
  const [minutesStr, setMinutesStr] = useState(String(initialMinutes));

  useEffect(() => {
    if (visible) {
      setStepsStr(String(initialSteps));
      setMinutesStr(String(initialMinutes));
    }
  }, [visible, initialSteps, initialMinutes]);

  const save = () => {
    const steps = Math.max(0, Math.round(Number(stepsStr) || 0));
    const minutes = Math.max(0, Math.round(Number(minutesStr) || 0));
    onSave(steps, minutes);
  };

  const valid =
    /^\d{1,6}$/.test(stepsStr.trim()) && /^\d{1,4}$/.test(minutesStr.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <View style={styles.card}>

          <Text style={styles.title}>Set your goals</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Daily steps</Text>
            <TextInput
              value={stepsStr}
              onChangeText={setStepsStr}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 8000"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Activity minutes</Text>
            <TextInput
              value={minutesStr}
              onChangeText={setMinutesStr}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 30"
              style={styles.input}
            />
          </View>

          <View style={styles.buttons}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.ghost]}>
              <Text style={[styles.btnText, styles.ghostText]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={save}
              disabled={!valid}
              style={[styles.btn, !valid && styles.btnDisabled]}
            >
              <Text style={styles.btnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { marginBottom: 12 },
  label: { fontSize: 14, opacity: 0.8, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
  },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, gap: 10 },
  btn: { backgroundColor: '#2ECC71', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  btnText: { color: 'white', fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: '#333' },
});