import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Image, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabaseClient';
import { useExercises } from '../hooks/useExercises';
import { Machine } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Suggestion'>;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getMachineNames = (goal: string, day: string): string[] => {
  const g = goal.toLowerCase();
  if (g.includes('muscle') || g.includes('bulk') || g.includes('strength') || g.includes('build')) {
    const plans: Record<string, string[]> = {
      Sunday:    ['Chest Press', 'Cable', 'Tricep', 'Pec Deck'],
      Monday:    ['Chest Press', 'Cable', 'Tricep', 'Pec Deck'],
      Tuesday:   ['Lat Pulldown', 'Cable Row', 'Bicep', 'Face Pull'],
      Wednesday: ['Leg Press', 'Leg Extension', 'Leg Curl', 'Calf'],
      Thursday:  ['Shoulder Press', 'Lateral Raise', 'Face Pull', 'Shrug'],
      Friday:    ['Chest Press', 'Lat Pulldown', 'Leg Press', 'Shoulder Press'],
      Saturday:  ['Bicep', 'Tricep', 'Cable Crunch', 'Ab'],
    };
    return plans[day] ?? plans['Monday'];
  }
  if (g.includes('lose') || g.includes('weight') || g.includes('fat') || g.includes('slim') || g.includes('cardio')) {
    const plans: Record<string, string[]> = {
      Sunday:    ['Treadmill', 'Bike'],
      Monday:    ['Treadmill', 'Rowing', 'Cable', 'Chest Press'],
      Tuesday:   ['Elliptical', 'Leg Press', 'Leg Curl', 'Stair'],
      Wednesday: ['Treadmill', 'Rowing'],
      Thursday:  ['Treadmill', 'Rowing', 'Bike'],
      Friday:    ['Rowing', 'Leg Press', 'Lat Pulldown', 'Chest Press'],
      Saturday:  ['Treadmill', 'Bike'],
    };
    return plans[day] ?? plans['Monday'];
  }
  if (g.includes('fit') || g.includes('health') || g.includes('tone') || g.includes('shape')) {
    const plans: Record<string, string[]> = {
      Sunday:    ['Elliptical', 'Back Extension'],
      Monday:    ['Chest Press', 'Lat Pulldown', 'Cable Row', 'Pec Deck'],
      Tuesday:   ['Leg Press', 'Leg Extension', 'Treadmill'],
      Wednesday: ['Ab', 'Cable Crunch', 'Back Extension'],
      Thursday:  ['Shoulder Press', 'Bicep', 'Tricep', 'Lateral Raise'],
      Friday:    ['Leg Press', 'Chest Press', 'Lat Pulldown', 'Shoulder Press'],
      Saturday:  ['Elliptical', 'Ab', 'Back Extension'],
    };
    return plans[day] ?? plans['Monday'];
  }
  return ['Chest Press', 'Lat Pulldown', 'Leg Press', 'Shoulder Press'];
};

const generateSuggestion = (goal: string, details: string, name: string, day: string): string => {
  const g = goal.toLowerCase();
  const firstName = name.split(' ')[0];

  if (g.includes('muscle') || g.includes('bulk') || g.includes('strength') || g.includes('build')) {
    const plans: Record<string, string> = {
      Sunday:    `Hey ${firstName}! Today is chest & triceps day 💪\n\n🎯 Focus: Push muscles\n\n💡 Tip: Go heavy on the first exercise, then drop weight each set. Rest 90 seconds between sets.`,
      Monday:    `Hey ${firstName}! Today is chest & triceps day 💪\n\n🎯 Focus: Push muscles\n\n💡 Tip: Go heavy on the first exercise, then drop weight each set. Rest 90 seconds between sets.`,
      Tuesday:   `Hey ${firstName}! Today is back & biceps day 💪\n\n🎯 Focus: Pull muscles\n\n💡 Tip: Squeeze the muscle at the top of each rep for maximum activation.`,
      Wednesday: `Hey ${firstName}! Today is leg day 🦵\n\n🎯 Focus: Lower body\n\n💡 Tip: Control the descent slowly — 3 seconds down, explosive up.`,
      Thursday:  `Hey ${firstName}! Today is shoulder day 💪\n\n🎯 Focus: Shoulders & traps\n\n💡 Tip: Keep your core tight and avoid swinging — controlled movement builds more muscle.`,
      Friday:    `Hey ${firstName}! Today is full body day 💪\n\n🎯 Focus: All major muscle groups\n\n💡 Tip: Keep rest short (60 sec) to maximize intensity across all groups.`,
      Saturday:  `Hey ${firstName}! Today is arms & core day 💪\n\n🎯 Focus: Biceps, triceps & core\n\n💡 Tip: Slow and controlled reps — feel the burn in each rep.`,
    };
    return plans[day] ?? plans['Monday'];
  }
  if (g.includes('lose') || g.includes('weight') || g.includes('fat') || g.includes('slim') || g.includes('cardio')) {
    const plans: Record<string, string> = {
      Sunday:    `Hey ${firstName}! Active Sunday today 🔥\n\n🎯 Focus: Light cardio\n\n💡 Tip: Light movement on Sunday keeps your metabolism active.`,
      Monday:    `Hey ${firstName}! Let's burn some calories today 🔥\n\n🎯 Focus: Cardio + upper body\n\n💡 Tip: Keep your heart rate between 130-150 bpm for optimal fat burning.`,
      Tuesday:   `Hey ${firstName}! Cardio & lower body today 🔥\n\n🎯 Focus: Legs + cardio\n\n💡 Tip: Supersets (no rest between exercises) burn more calories in less time.`,
      Wednesday: `Hey ${firstName}! Active recovery day 🔥\n\n🎯 Focus: Light cardio\n\n💡 Tip: Today keep it light — this helps your body recover while still moving.`,
      Thursday:  `Hey ${firstName}! HIIT day today 🔥\n\n🎯 Focus: High intensity intervals\n\n💡 Tip: Push hard during the fast intervals — that's where the magic happens.`,
      Friday:    `Hey ${firstName}! Full body burn today 🔥\n\n🎯 Focus: Full body circuit\n\n💡 Tip: Circuit training — do each machine back to back with minimal rest.`,
      Saturday:  `Hey ${firstName}! Cardio finisher today 🔥\n\n🎯 Focus: Endurance cardio\n\n💡 Tip: End the week strong — steady state cardio at a comfortable pace burns fat efficiently.`,
    };
    return plans[day] ?? plans['Monday'];
  }
  if (g.includes('fit') || g.includes('health') || g.includes('tone') || g.includes('shape')) {
    const plans: Record<string, string> = {
      Sunday:    `Hey ${firstName}! Sunday movement day 💫\n\n🎯 Focus: Light activity\n\n💡 Tip: Keep it easy today — your body will thank you tomorrow.`,
      Monday:    `Hey ${firstName}! Upper body day today 💫\n\n🎯 Focus: Chest & back\n\n💡 Tip: Focus on form over weight — quality reps build a better physique.`,
      Tuesday:   `Hey ${firstName}! Legs & cardio today 💫\n\n🎯 Focus: Lower body + cardio\n\n💡 Tip: Mix strength and cardio for best overall fitness results.`,
      Wednesday: `Hey ${firstName}! Core & flexibility today 💫\n\n🎯 Focus: Core strength\n\n💡 Tip: A strong core improves every other exercise you do.`,
      Thursday:  `Hey ${firstName}! Shoulders & arms today 💫\n\n🎯 Focus: Upper body definition\n\n💡 Tip: Lighter weight, more reps (12-15) for toning and definition.`,
      Friday:    `Hey ${firstName}! Full body today 💫\n\n🎯 Focus: Total body workout\n\n💡 Tip: Full body workouts are great for overall fitness and calorie burn.`,
      Saturday:  `Hey ${firstName}! Active day today 💫\n\n🎯 Focus: Cardio & core\n\n💡 Tip: Finish the week feeling great — cardio boosts your mood and energy.`,
    };
    return plans[day] ?? plans['Monday'];
  }
  return `Hey ${firstName}! Great that you're at the gym today 💪\n\n🎯 Focus: Full body workout\n\n💡 Tip: Consistency is the key to results — showing up is already half the battle.`;
};

export default function SuggestionScreen({ navigation }: Props) {
  const activeTab = 'Suggestion';
  const [userName, setUserName] = useState('');
  const [goal, setGoal] = useState('');
  const [goalDetails, setGoalDetails] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [goalDetailsInput, setGoalDetailsInput] = useState('');
  const [pressedId, setPressedId] = useState<string | null>(null);

  const { machines, loading: machinesLoading } = useExercises();
  const today = DAYS[new Date().getDay()];

  const suggestedMachines = useMemo(() => {
    if (!goal || !machines.length) return [];
    const names = getMachineNames(goal, today);
    return names
      .map(name => machines.find(m => m.name.toLowerCase().includes(name.toLowerCase())))
      .filter(Boolean) as Machine[];
  }, [goal, machines, today]);

  useEffect(() => {
    fetchUserAndSuggestion();
  }, []);

  const fetchUserAndSuggestion = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, goal, goal_details, last_suggestion')
        .eq('id', user.id)
        .single();
      const name = profile?.full_name ?? user.email ?? '';
      const userGoal = profile?.goal ?? '';
      const userGoalDetails = profile?.goal_details ?? '';
      const savedSuggestion = profile?.last_suggestion ?? '';
      setUserName(name);
      setGoal(userGoal);
      setGoalDetails(userGoalDetails);
      setGoalInput(userGoal);
      setGoalDetailsInput(userGoalDetails);
      if (savedSuggestion) {
        setSuggestion(savedSuggestion);
      } else if (userGoal) {
        const newSuggestion = generateSuggestion(userGoal, userGoalDetails, name, today);
        setSuggestion(newSuggestion);
        await supabase.from('profiles').update({ last_suggestion: newSuggestion }).eq('id', user.id);
      }
    }
    setLoading(false);
  };

  const handleSaveGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const newSuggestion = generateSuggestion(goalInput, goalDetailsInput, userName, today);
      await supabase.from('profiles').update({
        goal: goalInput,
        goal_details: goalDetailsInput,
        last_suggestion: newSuggestion,
      }).eq('id', user.id);
      setGoal(goalInput);
      setGoalDetails(goalDetailsInput);
      setSuggestion(newSuggestion);
      setShowGoalModal(false);
    }
  };

  const handleRefresh = async () => {
    const newSuggestion = generateSuggestion(goal, goalDetails, userName, today);
    setSuggestion(newSuggestion);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ last_suggestion: newSuggestion }).eq('id', user.id);
    }
  };

  const handleClearSuggestion = async () => {
    setSuggestion('');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ last_suggestion: null }).eq('id', user.id);
    }
  };

  const handleReserve = (machine: Machine) => {
    setPressedId(machine.id);
    setTimeout(() => {
      setPressedId(null);
      navigation.navigate('MachineDetail', { machine });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }} />
          <Image source={require('../../assets/logo.png')} style={styles.logoSmall} resizeMode="contain" />
        </View>
        <Text style={styles.pageTitle}>TODAY'S SUGGESTION</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.greeting}>{userName ? `Hey, ${userName.split(' ')[0]} 👋` : 'Hey 👋'}</Text>
                <Text style={styles.dayLabel}>{today}</Text>
              </View>
            </View>

            {goal ? (
              <View style={styles.goalCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.goalLabel}>Your Goal</Text>
                  <TouchableOpacity onPress={() => setShowGoalModal(true)} activeOpacity={0.75}>
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.brand }}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.goalText}>{goal}</Text>
                {goalDetails ? <Text style={styles.goalDetails}>{goalDetails}</Text> : null}
              </View>
            ) : (
              <TouchableOpacity style={styles.setGoalCard} onPress={() => setShowGoalModal(true)} activeOpacity={0.75}>
                <Icon name="target" size={32} color={Colors.textSecondary} />
                <Text style={styles.setGoalTitle}>Set your fitness goal</Text>
                <Text style={styles.setGoalSubtitle}>Get personalized workout suggestions based on your goal.</Text>
              </TouchableOpacity>
            )}

            {goal && (
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionTitle}>Today's Plan</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={handleRefresh} activeOpacity={0.75} style={styles.refreshBtn}>
                      <Icon name="refresh" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClearSuggestion} activeOpacity={0.75} style={styles.refreshBtn}>
                      <Icon name="delete-outline" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                {suggestion ? (
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                ) : (
                  <TouchableOpacity onPress={handleRefresh} activeOpacity={0.75}>
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.brand }}>Tap refresh to generate a new plan</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {goal && machinesLoading && (
              <ActivityIndicator color={Colors.brand} style={{ marginTop: 16 }} />
            )}

            {goal && !machinesLoading && suggestedMachines.length > 0 && (
              <>
                <Text style={styles.machinesTitle}>Suggested Machines</Text>
                {suggestedMachines.map((machine) => (
                  <View key={machine.id}>
                    <View style={styles.machineRow}>
                      {machine.image_url ? (
                        <Image source={{ uri: machine.image_url }} style={styles.machineImage} />
                      ) : (
                        <View style={[styles.machineImage, { alignItems: 'center', justifyContent: 'center' }]}>
                          <Icon name="dumbbell" size={28} color={Colors.textSecondary} />
                        </View>
                      )}
                      <View style={styles.machineInfo}>
                        <Text style={styles.machineName}>{machine.name}</Text>
                        <Text style={styles.machineCategory}>{machine.location}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.reserveButton, pressedId === machine.id && { backgroundColor: Colors.brand }]}
                        onPress={() => handleReserve(machine)}
                        activeOpacity={1}
                      >
                        <Text style={styles.reserveLabel}>Reserve</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                  </View>
                ))}
              </>
            )}

            {goal && !machinesLoading && suggestedMachines.length === 0 && (
              <TouchableOpacity style={styles.reserveBtn} onPress={() => navigation.navigate('MachineList')} activeOpacity={0.75}>
                <MaterialIcons name="add-box" size={20} color={Colors.textPrimary} />
                <Text style={styles.reserveBtnText}>Browse all Machines</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Fitness Goal</Text>
            <Text style={styles.inputLabel}>What is your main goal?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lose weight, Build muscle, Stay fit..."
              placeholderTextColor={Colors.textSecondary}
              value={goalInput}
              onChangeText={setGoalInput}
            />
            <Text style={styles.inputLabel}>Tell us more (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. I want to lose 5kg in 3 months, I can train 3x per week..."
              placeholderTextColor={Colors.textSecondary}
              value={goalDetailsInput}
              onChangeText={setGoalDetailsInput}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowGoalModal(false)} activeOpacity={0.75}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoal} activeOpacity={0.75}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.tabBarWrapper}>
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.75}>
          <Icon name="qrcode" size={45} color={Colors.surface} />
        </TouchableOpacity>
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'Suggestion' && styles.tabItemActive]} activeOpacity={0.75}>
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MachineList')} activeOpacity={0.75}>
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Reservations')} activeOpacity={0.75}>
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')} activeOpacity={0.75}>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontFamily: 'Inter-Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  dayLabel: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textSecondary },
  goalCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 },
  goalLabel: { fontFamily: 'Inter-Medium', fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  goalText: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  goalDetails: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  setGoalCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, marginBottom: 16 },
  setGoalTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary },
  setGoalSubtitle: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  suggestionCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  suggestionTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary },
  refreshBtn: { padding: 4 },
  suggestionText: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  machinesTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 12, marginTop: 4 },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  machineImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: 'white' },
  machineInfo: { flex: 1 },
  machineName: { fontFamily: 'Inter-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  machineCategory: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textSecondary },
  reserveButton: { backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  reserveLabel: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.stroke, marginBottom: 8 },
  reserveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 14, marginTop: 4 },
  reserveBtnText: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 20 },
  inputLabel: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter-Medium', fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelModalBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  cancelModalText: { fontFamily: 'Inter-Medium', fontSize: 15, color: Colors.textPrimary },
  saveBtn: { flex: 2, backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter-Bold', fontSize: 15, color: Colors.textPrimary },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.textPrimary, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});