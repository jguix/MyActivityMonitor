import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import { getHealthService } from '../services/health/health.factory';
import {
  DailyActivityInsights,
  DailyStepsInsights,
} from '../domain/activity-tracking/activity-tracking.types';

export function useHealthToday() {
  const health = useMemo(() => getHealthService(), []);
  const [loading, setLoading] = useState(true);
  const [granted, setGranted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const load = useCallback(
    async (requestAndroidPermissions: boolean) => {
      setLoading(true);
      setError(null);

      try {
        await health.initialize({ requestAndroidPermissions }).toPromise();

        setGranted(true);

        const today = moment();
        const [activity, stepInsight] = (await health
          .getDailyInsights(today)
          .toPromise()) as [DailyActivityInsights, DailyStepsInsights];

        setSteps(Math.max(0, Math.round(stepInsight?.steps ?? 0)));
        setMinutes(Math.max(0, Math.round(activity?.minutes ?? 0)));
      } catch (e: any) {
        setGranted(false);
        setError(e?.message ?? String(e));
        setSteps(0);
        setMinutes(0);
      } finally {
        setLoading(false);
      }
    },
    [health],
  );

  return {
    loading,
    granted,
    error,
    steps,
    minutes,
    reload: load,
  };
}
