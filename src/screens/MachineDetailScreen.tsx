import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Modal, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MachineDetail'>;
  route: RouteProp<RootStackParamList, 'MachineDetail'>;
};

const HOW_LONG_OPTIONS = ['5 Min.', '10 Min.', '15 Min.', '20 Min.', '30 Min.', '45 Min.', '1 Hour'];
const IMAGE_SIZE = 240;

export default function MachineDetailScreen({ navigation, route }: Props) {
  const { machine } = route.params;
  const [howLongOffset, setHowLongOffset] = useState(0);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
  const [selectedHowLong, setSelectedHowLong] = useState('10 Min.');
  const [reservePressed, setReservePressed] = useState(false);

  const activeTab = 'Reserve';
  const visibleHowLong = HOW_LONG_OPTIONS.slice(howLongOffset, howLongOffset + 3);

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const min = m.toString().padStart(2, '0');
    return `${hour}:${min} ${ampm}`;
  };

  const timeToMinutes = (t: string) => {
    const [time, ampm] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const minutesToDate = (minutes: number): Date => {
    const d = new Date();
    d.setHours(Math.floor(minutes / 60));
    d.setMinutes(minutes % 60);
    d.setSeconds(0);
    return d;
  };

  const durationToMinutes = (duration: string): number => {
    if (duration.includes('Hour')) return parseInt(duration) * 60;
    if (duration.includes('Min')) return parseInt(duration);
    return 10;
  };

  const findNextAvailableSlot = (reservations: any[], startMinutes: number): number => {
    const taken = reservations.map((r: any) => timeToMinutes(r.startTime));
    let candidate = startMinutes + durationToMinutes(selectedHowLong);
    while (taken.includes(candidate)) candidate += durationToMinutes(selectedHowLong);
    return candidate;
  };

  const saveAndNavigate = async (startTime: string) => {
    const existing = await AsyncStorage.getItem('reservations');
    const parsed = existing ? JSON.parse(existing) : [];
    const reservations = Array.isArray(parsed) ? parsed : [];

    const newReservation = {
      id: `${Date.now()}-${machine.id}`,
      machine,
      startTime,
      endTime: selectedHowLong,
      active: true,
    };

    const updated = [...reservations, newReservation].sort((a: any, b: any) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    await AsyncStorage.setItem('reservations', JSON.stringify(updated));
    navigation.navigate('Reservations');
  };

  const handleReserve = async () => {
    setReservePressed(true);

    try {
      const existing = await AsyncStorage.getItem('reservations');
      const parsed = existing ? JSON.parse(existing) : [];
      const reservations = Array.isArray(parsed) ? parsed : [];

      if (reservations.length >= 5) {
        Alert.alert('Limit reached', 'You can only have 5 active reservations at a time.');
        setReservePressed(false);
        return;
      }

      const startTime = formatTime(selectedTime);
      const hasConflict = reservations.some((r: any) => r.startTime === startTime);

      if (hasConflict) {
        const nextMinutes = findNextAvailableSlot(reservations, timeToMinutes(startTime));
        const nextTime = formatTime(minutesToDate(nextMinutes));

        Alert.alert(
          'Time conflict',
          `You already have a reservation during this time.\n\nNext available slot: ${nextTime}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setReservePressed(false) },
            {
              text: 'Use this time',
              onPress: async () => {
                try {
                  await saveAndNavigate(nextTime);
                } catch (e) {
                  Alert.alert('Error', 'Reservation could not be saved.');
                }
                setReservePressed(false);
              },
            },
          ]
        );

        return;
      }

      await saveAndNavigate(startTime);
      setReservePressed(false);
    } catch (error) {
      console.log('Reservation save error:', error);
      Alert.alert('Error', 'Reservation could not be saved.');
      setReservePressed(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.75} style={styles.backButton}>
            <Icon name="chevron-left" size={32} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <Image source={require('../../assets/logo.png')} style={styles.logoSmall} resizeMode="contain" />
        </View>

        <Text style={styles.pageTitle}>RESERVE A MACHINE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <View>
            <Text style={styles.exerciseName}>{machine.name}</Text>
            <Text style={styles.exerciseCategory}>{machine.location}</Text>
          </View>
        </View>

        <View style={styles.imageWrapper}>
          {machine.image_url ? (
            <Image source={{ uri: machine.image_url }} style={styles.exerciseImage} resizeMode="contain" />
          ) : (
            <View style={[styles.exerciseImage, styles.placeholderImage]}>
              <Icon name="dumbbell" size={80} color={Colors.textSecondary} />
            </View>
          )}
        </View>

        <Text style={styles.question} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          When do you want to use the machine?
        </Text>

        <TouchableOpacity style={styles.timePicker} onPress={() => setShowPicker(true)}>
          <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
          <Icon name="clock-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        {showPicker && (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setDonePressed(true);
                      setTimeout(() => {
                        setDonePressed(false);
                        setShowPicker(false);
                      }, 150);
                    }}
                    activeOpacity={1}
                  >
                    <Text style={[styles.modalDone, donePressed && { color: Colors.brand }]}>Done</Text>
                  </TouchableOpacity>
                </View>

                {Platform.OS === 'web' ? (
                  // @ts-ignore
                  <input
                    type="time"
                    value={`${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`}
                    onChange={(e: any) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newDate = new Date(selectedTime);
                      newDate.setHours(h);
                      newDate.setMinutes(m);
                      setSelectedTime(newDate);
                    }}
                    style={{
                      fontSize: 24,
                      padding: 16,
                      borderRadius: 12,
                      border: 'none',
                      background: Colors.surface,
                      color: Colors.textPrimary,
                      width: '100%',
                      marginBottom: 20,
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner"
                    onChange={(_: any, date?: Date) => {
                      if (date) setSelectedTime(date);
                    }}
                    style={styles.dateTimePicker}
                    textColor={Colors.textPrimary}
                    themeVariant="dark"
                  />
                )}
              </View>
            </View>
          </Modal>
        )}

        <Text style={styles.question} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          How long do you want to use it?
        </Text>

        <View style={styles.optionRow}>
          <TouchableOpacity onPress={() => setHowLongOffset((o) => Math.max(0, o - 1))} activeOpacity={0.7}>
            <Icon name="chevron-left" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.optionChips}>
            {visibleHowLong.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.chip, selectedHowLong === opt && styles.chipActive]} onPress={() => setSelectedHowLong(opt)} activeOpacity={0.75}>
                <Text style={styles.chipLabel}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setHowLongOffset((o) => Math.min(HOW_LONG_OPTIONS.length - 3, o + 1))} activeOpacity={0.7}>
            <Icon name="chevron-right" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.reserveButton, reservePressed && { backgroundColor: Colors.brand }]} onPress={handleReserve} activeOpacity={1}>
          <Text style={styles.reserveLabel}>Reserve</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.75}>
          <Icon name="qrcode" size={45} color={Colors.surface} />
        </TouchableOpacity>

        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Suggestion' && styles.tabItemActive]} onPress={() => navigation.navigate('Suggestion')} activeOpacity={0.75}>
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabItem, activeTab === 'Reserve' && styles.tabItemActive]} activeOpacity={0.75}>
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabItem, activeTab === 'Reservations' && styles.tabItemActive]} onPress={() => navigation.navigate('Reservations')} activeOpacity={0.75}>
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabItem, activeTab === 'Profile' && styles.tabItemActive]} onPress={() => navigation.navigate('Profile')} activeOpacity={0.75}>
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
  header: { backgroundColor: Colors.surface, height: 110, paddingHorizontal: 50, justifyContent: 'flex-start', paddingTop: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { position: 'absolute', left: -22, top: 19, zIndex: 10 },
  logoSmall: { width: 60, height: 40, marginRight: -30, marginTop: 19 },
  pageTitle: { fontFamily: 'BabasNeue-Regular', fontSize: 36, color: Colors.textPrimary, marginTop: 10 },
  content: { paddingHorizontal: 50, paddingTop: 10, paddingBottom: 20 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingTop: 10 },
  exerciseName: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  exerciseCategory: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textSecondary },
  imageWrapper: { width: IMAGE_SIZE, height: IMAGE_SIZE, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 15 },
  exerciseImage: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 16, backgroundColor: 'white' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  question: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center', width: '100%' },
  timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'center', marginBottom: 16 },
  timeText: { fontFamily: 'Inter-Medium', fontSize: 18, color: Colors.textPrimary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  modalDone: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary },
  dateTimePicker: { height: 200, backgroundColor: Colors.surface },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 },
  optionChips: { flexDirection: 'row', gap: 4 },
  chip: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 10, width: 90, alignItems: 'center', borderWidth: 1, borderColor: Colors.stroke },
  chipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipLabel: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  reserveButton: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center', alignSelf: 'center', marginTop: 8 },
  reserveLabel: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});
