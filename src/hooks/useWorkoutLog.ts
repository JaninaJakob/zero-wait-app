import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WorkoutLog } from '../types';

export function useWorkoutLog(userId: string) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLogsForExercise(exerciseName: string) {
    setLoading(true);
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName)
      .order('logged_at', { ascending: true });
    setLogs(data ?? []);
    setLoading(false);
  }

  async function saveLog(log: Omit<WorkoutLog, 'id' | 'logged_at'>) {
    const { error } = await supabase.from('workout_logs').insert({
      ...log,
      logged_at: new Date().toISOString(),
    });
    return error;
  }

  return { logs, loading, fetchLogsForExercise, saveLog };
}
