import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import CroppedThumbnail from '../components/CroppedThumbnail';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reservations'>;
};

type Reservation = {
  id: string;
  machine: { name: string; location: string; image_url: string };
  startTime: string;
  endTime: string;
  active: boolean;
  checkedIn?: boolean;
};

export default function ReservationsScreen({ navigation }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const [pressedQr, setPressedQr] = useState(false);

  const activeTab = 'Reservations';

  const timeToMinutes = (t: string) => {
    if (t === 'Now') return 0;
    const [time, ampm] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const durationToMinutes = (d: string) => {
    if (d.includes('Hour')) return parseInt(d) * 60;
    if (d.includes('Min')) return parseInt(d);
    return 10;
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('reservations');
        if (stored) {
          const parsed = JSON.parse(stored);
          const list = Array.isArray(parsed) ? parsed : [];

          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          // Verwijder reserveringen waarvan de eindtijd verstreken is
          const active = list.filter((r: any) => {
            if (r.checkedIn) return true;
            const endMinutes = timeToMinutes(r.startTime) + durationToMinutes(r.endTime);
            return currentMinutes < endMinutes;
          });

          await AsyncStorage.setItem('reservations', JSON.stringify(active));

          const sorted = [...active].sort((a: any, b: any) =>
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
          );
          setReservations(sorted);
        } else {
          setReservations([]);
        }
      };
      load();
    }, [])
  );

  const handleCancel = async (id: string) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    await AsyncStorage.setItem('reservations', JSON.stringify(updated));
  };

  const handlePress = (key: string, action: () => void) => {
    setPressedId(key);
    setTimeout(() => { setPressedId(null); action(); }, 150);
  };

  const handleTabPress = (key: string, action: () => void) => {
    setPressedTab(key);
    setTimeout(() => { setPressedTab(null); action(); }, 150);
  };

  const handleQrPress = () => {
    setPressedQr(true);
    setTimeout(() => { setPressedQr(false); navigation.navigate('CheckIn'); }, 150);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }} />
          <Image source={require('../../assets/logo.png')} style={styles.logoSmall} resizeMode="contain" />
        </View>
        <Text style={styles.pageTitle}>RESERVE A MACHINE</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
        {reservations.length === 0 ? (
          <Text style={styles.emptyText}>No reservations yet.</Text>
        ) : (
          reservations.map(r => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.machineName} numberOfLines={1} ellipsizeMode="tail">{r.machine.name}</Text>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.machineCategory}>{r.machine.location}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>When?</Text>
                    <Text style={styles.value}>{r.startTime}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>How long?</Text>
                    <Text style={styles.value}>{r.endTime}</Text>
                  </View>
                  <View style={styles.cardButtons}>
                    <TouchableOpacity
                      style={[styles.checkInBtn, pressedId === `checkin-${r.id}` && { backgroundColor: Colors.brand }]}
                      onPress={() => handlePress(`checkin-${r.id}`, () => navigation.navigate('CheckIn'))}
                      activeOpacity={1}
                    >
                      <Text style={styles.checkInLabel}>Check-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelBtn, pressedId === `cancel-${r.id}` && { backgroundColor: Colors.brand }]}
                      onPress={() => handlePress(`cancel-${r.id}`, () => handleCancel(r.id))}
                      activeOpacity={1}
                    >
                      <Text style={styles.cancelLabel}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.imageWrapper}>
                  {r.machine.image_url ? (
                    <CroppedThumbnail uri={r.machine.image_url} size={110} borderRadius={12} />
                  ) : (
                    <View style={[styles.machineImage, { alignItems: 'center', justifyContent: 'center' }]}>
                      <Icon name="dumbbell" size={40} color={Colors.textSecondary} />
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.divider} />
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity
          style={[styles.qrButton, pressedQr && { backgroundColor: Colors.brand }]}
          onPress={handleQrPress}
          activeOpacity={1}
        >
          <Icon name="qrcode" size={45} color={Colors.surface} />
        </TouchableOpacity>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, pressedTab === 'suggestion' && { backgroundColor: Colors.brand, borderRadius: 12 }]}
            onPress={() => handleTabPress('suggestion', () => navigation.navigate('Suggestion'))}
            activeOpacity={1}
          >
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, pressedTab === 'reserve' && { backgroundColor: Colors.brand, borderRadius: 12 }]}
            onPress={() => handleTabPress('reserve', () => navigation.navigate('MachineList'))}
            activeOpacity={1}
          >
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Reservations' && styles.tabItemActive]} activeOpacity={0.75}>
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, pressedTab === 'profile' && { backgroundColor: Colors.brand, borderRadius: 12 }]}
            onPress={() => handleTabPress('profile', () => navigation.navigate('Profile'))}
            activeOpacity={1}
          >
            <MaterialIcons name="account-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, height: 131, paddingHorizontal: 50, justifyContent: 'flex-start', paddingTop: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 50 },
  logoSmall: { width: 60, height: 40, marginRight: -30, marginTop: -30 },
  pageTitle: { fontFamily: 'BabasNeue-Regular', fontSize: 36, color: Colors.textPrimary, marginTop: 20 },
  scroll: { flex: 1 },
  listContent: { paddingHorizontal: 50, paddingTop: 24, paddingBottom: 100 },
  emptyText: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textSecondary, marginTop: 40, textAlign: 'center' },
  card: { marginBottom: 8 },
  machineName: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: '700', color: Colors.textPrimary, lineHeight: 26, marginBottom: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', minHeight: 150, paddingBottom: 10 },
  cardInfo: { flex: 1, gap: 6, justifyContent: 'flex-start' },
  imageWrapper: { justifyContent: 'flex-start', paddingTop: 12 },
  machineCategory: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textSecondary, marginBottom: 4, marginTop: -4 },
  infoRow: { flexDirection: 'row', gap: 4 },
  label: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary, width: 100 },
  value: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textSecondary },
  machineImage: { width: 110, height: 110, borderRadius: 12, backgroundColor: 'white' },
  cardButtons: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center' },
  checkInBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16 },
  checkInLabel: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textPrimary },
  cancelBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, marginTop: 4, marginLeft: 8 },
  cancelLabel: { fontFamily: 'Inter-Medium', fontSize: 11, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.stroke, marginBottom: 10 },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});
