import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import CroppedThumbnail from '../components/CroppedThumbnail';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingConfirm'>;
  route: RouteProp<RootStackParamList, 'BookingConfirm'>;
};

export default function BookingConfirmScreen({ navigation, route }: Props) {
  const { machine, startTime, endTime } = route.params;

  const timeToMinutes = (t: string) => {
    const [time, ampm] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const handleConfirm = async () => {
    try {
      const existing = await AsyncStorage.getItem('reservations');
      const parsed = existing ? JSON.parse(existing) : [];
      const reservations = Array.isArray(parsed) ? parsed : [];
      if (reservations.length >= 5) {
        Alert.alert('Limit reached', 'You can only have 5 active reservations at a time.');
        return;
      }
      const hasConflict = reservations.some((r: any) => r.startTime === startTime);
      if (hasConflict) {
        Alert.alert('Time conflict', 'You already have a reservation at this time.');
        return;
      }
      const newReservation = {
        id: `${Date.now()}-${machine.id}`,
        machine,
        startTime,
        endTime,
        active: true,
      };
      const updatedReservations = [...reservations, newReservation].sort((a: any, b: any) => {
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
      await AsyncStorage.setItem('reservations', JSON.stringify(updatedReservations));
      navigation.reset({ index: 0, routes: [{ name: 'Reservations' }] });
    } catch (error) {
      console.log('Reservation save error:', error);
      Alert.alert('Error', 'Reservation could not be saved.');
    }
  };

  const activeTab = 'Reserve';

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

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.info}>
            <Text style={styles.machineName}>{machine.name}</Text>
            <Text style={styles.machineCategory}>{machine.location}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>When?</Text>
              <Text style={styles.value}>{startTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>How long?</Text>
              <Text style={styles.value}>{endTime}</Text>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmLabel}>Check-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelLabel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            {machine.image_url ? (
              <CroppedThumbnail uri={machine.image_url} size={130} borderRadius={12} />
            ) : (
              <View style={[styles.machineImage, { alignItems: 'center', justifyContent: 'center' }]}>
                <Icon name="dumbbell" size={60} color={Colors.textSecondary} />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.75}>
          <Icon name="qrcode" size={45} color={Colors.textPrimary} />
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
          {/* Profile – NEU */}
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
  header: { backgroundColor: Colors.surface, height: 131, paddingHorizontal: 50, justifyContent: 'flex-start', paddingTop: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 50 },
  logoSmall: { width: 60, height: 40, marginRight: -45, marginTop: -35 },
  pageTitle: { fontFamily: 'BabasNeue-Regular', fontSize: 36, color: Colors.textPrimary, marginTop: 20 },
  content: { paddingHorizontal: 50, paddingTop: 30, flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  info: { flex: 1, gap: 8 },
  machineName: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  machineCategory: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textSecondary },
  infoRow: { flexDirection: 'row', gap: 8 },
  label: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary, width: 90 },
  value: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textSecondary },
  machineImage: { width: 130, height: 130, borderRadius: 12, backgroundColor: 'white' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 16, alignItems: 'center' },
  confirmBtn: { backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 28 },
  confirmLabel: { fontFamily: 'Inter-Medium', fontSize: 18, color: Colors.textPrimary },
  cancelBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  cancelLabel: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textPrimary },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});
