import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WorkoutLog } from '../types';

// Install: npx expo install victory-native
// import { VictoryLine, VictoryChart } from 'victory-native';

type Props = {
  logs: WorkoutLog[];
  exerciseName: string;
};

export function ProgressChart({ logs, exerciseName }: Props) {
  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Noch keine Daten für {exerciseName}</Text>
      </View>
    );
  }

  // TODO: Replace with VictoryLine chart once victory-native is installed
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exerciseName} – Fortschritt</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.row}>
          <Text style={styles.date}>
            {new Date(log.logged_at).toLocaleDateString('de-DE')}
          </Text>
          <Text style={styles.weight}>{log.weight_kg} kg</Text>
          <Text style={styles.reps}>{log.sets}×{log.reps}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2d3e',
  },
  date: { fontSize: 13, color: '#9ca3af' },
  weight: { fontSize: 13, color: '#3b6ef5', fontWeight: '700' },
  reps: { fontSize: 13, color: '#ffffff' },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});
