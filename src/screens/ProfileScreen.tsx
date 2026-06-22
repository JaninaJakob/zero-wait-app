import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabaseClient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const MENU_ITEMS = [
  'Personal Info',
  'Change Password',
  'Activity History',
  'Notifications',
  'Languages',
];

export default function ProfileScreen({ navigation }: Props) {
  const activeTab = 'Profile';
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        setRole(profile?.role ?? 'user');
        setFullName(profile?.full_name ?? '');
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBox}>
            <MaterialIcons name="account-circle" size={100} color={Colors.textSecondary} />
          </View>
          <Text style={styles.userName}>{fullName || 'Your Name'}</Text>
          {role && (
            <View style={[styles.roleBadge, role === 'admin' && styles.roleBadgeAdmin]}>
              <Text style={styles.roleBadgeText}>{role.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>23yo</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>163cm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>57kg</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>Account</Text>
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item} style={styles.menuItem} activeOpacity={0.75}>
              <Text style={styles.menuLabel}>{item}</Text>
              <Text style={styles.menuArrow}>{'>'}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.75}>
          <Icon name="qrcode" size={45} color={Colors.surface} />
        </TouchableOpacity>
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Suggestion' && styles.tabItemActive]} onPress={() => navigation.navigate('Suggestion')} activeOpacity={0.75}>
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Reserve' && styles.tabItemActive]} onPress={() => navigation.navigate('MachineList')} activeOpacity={0.75}>
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Reservations' && styles.tabItemActive]} onPress={() => navigation.navigate('Reservations')} activeOpacity={0.75}>
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Profile' && styles.tabItemActive]} activeOpacity={0.75}>
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
  content: { paddingHorizontal: 50, paddingTop: 24, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: Colors.textPrimary },
  logoutBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16 },
  logoutText: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.textPrimary },
  avatarWrapper: { alignItems: 'center', marginBottom: 8 },
  avatarBox: { width: 102, height: 102, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  userName: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 6 },
  roleBadge: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 14 },
  roleBadgeAdmin: { backgroundColor: Colors.brand },
  roleBadgeText: { fontFamily: 'Inter-Medium', fontSize: 11, color: Colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 15, justifyContent: 'flex-start' },
  statBox: { width: 83, height: 39, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  statLabel: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textPrimary },
  statValue: { fontFamily: 'Inter-Medium', fontSize: 11, color: Colors.textPrimary },
  menuList: { gap: 10 },
  menuItem: { width: 285, height: 39, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuLabel: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.textPrimary },
  menuArrow: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.textPrimary },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});