import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminHome'>;
};

type MenuCardProps = {
  iconName: string;
  label: string;
  onPress: () => void;
  iconSet?: 'community' | 'material';
};

const MenuCard = ({ iconName, label, onPress, iconSet = 'community' }: MenuCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    {iconSet === 'material'
      ? <MaterialIcons name={iconName} size={80} color={Colors.textPrimary} />
      : <Icon name={iconName} size={80} color={Colors.textPrimary} />
    }
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function AdminHomeScreen({ navigation }: Props) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
        <View style={styles.profileIconWrap}>
          <Icon name="account" size={22} color={Colors.textPrimary} />
        </View>
      </TouchableOpacity>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Admin Dashboard</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.row}>
            <MenuCard iconName="help-box" label="Suggestions" iconSet="community"
              onPress={() => navigation.navigate('Suggestion')} />
            <MenuCard iconName="add-box" label="Reserve" iconSet="material"
              onPress={() => navigation.navigate('MachineList')} />
          </View>
          <View style={[styles.row, { marginTop: 20 }]}>
            <MenuCard iconName="check-box" label="Reservations" iconSet="material"
              onPress={() => navigation.navigate('Reservations')} />
            <MenuCard iconName="qrcode" label="Check-in" iconSet="community"
              onPress={() => navigation.navigate('CheckIn')} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 92, alignItems: 'center' },
  profileBtn: { position: 'absolute', top: Platform.select({ web: 50, default: 72 }), right: Platform.select({ web: 36, default: 49 }), zIndex: 10 },
  profileIconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  logo: { width: Platform.select({ web: 200, default: 260 }), height: Platform.select({ web: 123, default: 160 }), marginHorizontal: 49, marginBottom: 20, marginTop: -20, alignSelf: 'center' },
  subtitle: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 12, alignSelf: 'center' },
  adminBadge: { backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 16, marginBottom: 32 },
  adminBadgeText: { fontFamily: 'Inter-Bold', fontSize: 12, color: Colors.textPrimary },
  grid: { marginHorizontal: 50 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  card: { width: 134, height: 153, backgroundColor: Colors.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cardLabel: { fontFamily: 'Inter-Bold', fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
});