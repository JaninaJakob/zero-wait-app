import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Machine } from '../types';

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMachines() {
      const { data, error } = await supabase.from('machines').select('*');
      if (error) setError(error.message);
      else setMachines(data ?? []);
      setLoading(false);
    }
    fetchMachines();
  }, []);

  return { machines, loading, error };
}
