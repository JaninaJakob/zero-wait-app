import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Reservation } from '../types';

export function useReservations(userId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      const { data } = await supabase
        .from('reservations')
        .select('*, machine:machines(*)')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      setReservations(data ?? []);
      setLoading(false);
    }
    if (userId) fetchReservations();
  }, [userId]);

  return { reservations, loading };
}
