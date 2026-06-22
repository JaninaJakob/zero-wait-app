import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function TimeSlotScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>TimeSlotScreen</Text>
        {/* TODO: Implement */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, padding: 24 },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#ffffff', marginBottom: 16 },
});
