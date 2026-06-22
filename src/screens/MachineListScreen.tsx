import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { Machine } from '../types';
import { SvgXml } from 'react-native-svg';
import { useExercises } from '../hooks/useExercises';
import CroppedThumbnail from '../components/CroppedThumbnail';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MachineList'>;
};

type MachineRowProps = {
  machine: Machine;
  letter: string;
  onReserve: (machine: Machine) => void;
};

function getSvgXml(imageUrl: string): string | null {
  if (!imageUrl || !imageUrl.startsWith('data:image/svg+xml,')) return null;
  return decodeURIComponent(imageUrl.replace('data:image/svg+xml,', ''));
}

const MachineRow = ({ machine, letter, onReserve }: MachineRowProps) => {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onReserve(machine);
    }, 600);
  };

  return (
    <View>
      <View style={styles.machineRow}>
        <Text style={styles.letter}>{letter}</Text>
        {(() => {
          const svgXml = getSvgXml(machine.image_url);
          if (svgXml) {
            return <SvgXml xml={svgXml} width={70} height={70} style={{ borderRadius: 8, backgroundColor: 'white' }} />;
          } else if (machine.image_url) {
            return <CroppedThumbnail uri={machine.image_url} size={70} borderRadius={8} />;
          } else {
            return (
              <View style={[styles.machineImage, { alignItems: 'center', justifyContent: 'center' }]}>
                <Icon name="dumbbell" size={36} color={Colors.textSecondary} />
              </View>
            );
          }
        })()}
        <View style={styles.machineInfo}>
          <Text style={styles.machineName}>{machine.name}</Text>
          <Text style={styles.machineCategory}>{machine.location}</Text>
        </View>
        <View style={styles.machineActions}>
          <View style={styles.reserveGroup}>
            {machine.status === 'occupied' && (
              <Text style={styles.inUseLabel}>In use</Text>
            )}
            <TouchableOpacity
              style={[styles.reserveButton, pressed && { backgroundColor: Colors.brand }]}
              onPress={handlePress}
              activeOpacity={1}
            >
              <Text style={styles.reserveLabel}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default function MachineListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [catOffset, setCatOffset] = useState(0);
  const { machines, loading } = useExercises();

  // ── aktiver Tab ──────────────────────────────────────────────
  const activeTab = 'Reserve'; // Diese Seite = Reserve
  // ─────────────────────────────────────────────────────────────

  const CATEGORIES = useMemo(() =>
    ['All', ...Array.from(new Set(machines.map(m => m.location))).sort()],
    [machines]
  );

  const filtered = useMemo(() => machines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || m.location === selectedCategory;
    return matchSearch && matchCat;
  }), [search, selectedCategory, machines]);

  const visibleCats = CATEGORIES.slice(catOffset, catOffset + 3);

  if (loading) return <ActivityIndicator color={Colors.brand} style={{ flex: 1 }} />;

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

      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>Exercise</Text>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={Colors.background} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.background}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.categoryRow}>
          <TouchableOpacity onPress={() => setCatOffset(o => Math.max(0, o - 1))} activeOpacity={0.7}>
            <Icon name="chevron-left" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.categoryChips}>
            {visibleCats.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipLabel} numberOfLines={1}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setCatOffset(o => Math.min(CATEGORIES.length - 3, o + 1))} activeOpacity={0.7}>
            <Icon name="chevron-right" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.listContent}>
          {filtered.map((item, index) => {
            const letter = item.name[0].toUpperCase();
            const prevLetter = index > 0 ? filtered[index - 1].name[0] : '';
            const showLetter = letter.toUpperCase() !== prevLetter.toUpperCase();
            return (
              <MachineRow
                key={item.id}
                machine={item}
                letter={showLetter ? letter : ' '}
                onReserve={(machine) => navigation.navigate('MachineDetail', { machine })}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.75}>
          <Icon name="qrcode" size={45} color={Colors.surface} />
        </TouchableOpacity>
        <View style={styles.tabBar}>

          {/* Suggestion */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Suggestion' && styles.tabItemActive]}
            onPress={() => navigation.navigate('Suggestion')}
            activeOpacity={0.75}
          >
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </TouchableOpacity>

          {/* Reserve */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Reserve' && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </TouchableOpacity>

          {/* Reservations */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Reservations' && styles.tabItemActive]}
            onPress={() => navigation.navigate('Reservations')}
            activeOpacity={0.75}
          >
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </TouchableOpacity>

          {/* Profile – NEU */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Profile' && styles.tabItemActive]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.75}
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
  scroll: { flex: 1 },
  header: { backgroundColor: Colors.surface, height: 131, paddingHorizontal: 50, justifyContent: 'flex-start', paddingTop: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  logoSmall: { width: 60, height: 40, marginRight: -30, marginTop: -30 },
  pageTitle: { fontFamily: 'BabasNeue-Regular', fontSize: 36, color: Colors.textPrimary, marginTop: 20 },
  filterSection: { backgroundColor: Colors.background, paddingHorizontal: 50, paddingTop: 25, paddingBottom: 15 },
  sectionLabel: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 9 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.textSecondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 15, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.background },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryChips: { flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center' },
  chip: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: Colors.stroke },
  chipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipLabel: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  listContent: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 80 },
  letter: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textPrimary, minWidth: 16, paddingTop: 2 },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  machineImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: 'white' },
  machineInfo: { flex: 1 },
  machineName: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  machineCategory: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textSecondary },
  machineActions: { alignItems: 'flex-end', justifyContent: 'flex-end', height: 86, marginRight: 12 },
  reserveGroup: { alignItems: 'flex-end', gap: 2, justifyContent: 'flex-end' },
  inUseLabel: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.accent, paddingRight: 16 },
  reserveButton: { backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-end' },
  reserveLabel: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.stroke, marginBottom: 8 },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});
