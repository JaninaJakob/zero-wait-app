import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Machine } from '../types';

type Props = {
  machine: Machine;
  onPress: (machine: Machine) => void;
};

export function MachineCard({ machine, onPress }: Props) {
  const statusColor =
    machine.status === 'available'
      ? '#22c55e'
      : machine.status === 'occupied'
      ? '#ef4444'
      : '#f59e0b';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(machine)} activeOpacity={0.75}>
      <Image source={{ uri: machine.image_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{machine.name}</Text>
        <Text style={styles.location}>{machine.location}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2d3e',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
  },
  info: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  location: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#9ca3af',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
});
