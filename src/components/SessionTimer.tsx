import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

type Props = {
  running: boolean;
};

export function SessionTimer({ running }: Props) {
  const [seconds, setSeconds] = useState(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return <Text style={styles.timer}>{mm}:{ss}</Text>;
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#ffffff',
    letterSpacing: 2,
  },
});
