import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useIntervalWhenActive(
  callback: () => void,
  intervalMs: number,
) {
  const savedCallback = useRef(callback);
  const stateRef = useRef<AppStateStatus>(AppState.currentState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    if (!timerRef.current && stateRef.current === 'active') {
      timerRef.current = setInterval(() => savedCallback.current(), intervalMs);
    }
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      stateRef.current = next;
      if (next === 'active') start();
      else clear();
    });
    // start immediately if already active
    if (stateRef.current === 'active') start();
    return () => {
      sub.remove();
      clear();
    };
  }, [intervalMs]);
}
