import { useEffect, useState } from 'react';
import { Machine } from '../types';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Abs', 'Cardio', 'Other'];

export function useExercises() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
      .from('exercises')
      .select('id, name, description, location, image_url, status')
      .in('location', CATEGORIES)
      .order('name');

    console.log('data:', data?.length, 'error:', error);
      if (error) {
        console.error('Supabase error:', error.message);
        setLoading(false);
        return;
      }

      setMachines((data ?? []) as Machine[]);
      setLoading(false);
    };

    fetchExercises();
  }, []);

  return { machines, loading };
}