import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './src/lib/supabaseClient';
import HomeScreen from './src/screens/HomeScreen';
import MachineListScreen from './src/screens/MachineListScreen';
import MachineDetailScreen from './src/screens/MachineDetailScreen';
import TimeSlotScreen from './src/screens/TimeSlotScreen';
import BookingConfirmScreen from './src/screens/BookingConfirmScreen';
import BookingSuccessScreen from './src/screens/BookingSuccessScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import SuggestionScreen from './src/screens/SuggestionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import { Machine } from './src/types';
import { isAppRunning, markAppRunning } from './src/lib/appState';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  AdminHome: undefined;
  MachineList: undefined;
  MachineDetail: { machine: Machine };
  TimeSlot: { machine: Machine };
  BookingConfirm: { machine: Machine; startTime: string; endTime: string };
  BookingSuccess: { reservationId: string };
  Reservations: undefined;
  CheckIn: undefined;
  Suggestion: undefined;
  WorkoutProgress: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const NAV_STATE_KEY = 'nav_state';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialNavState, setInitialNavState] = useState<NavigationState | undefined>(undefined);
  const loadingRef = useRef(true);

  const [fontsLoaded] = useFonts({
    'BabasNeue-Regular': require('./assets/fonts/BebasNeue-Regular.ttf'),
    'Inter-Bold':        require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-Medium':      require('./assets/fonts/Inter-Medium.ttf'),
  });

  useEffect(() => {
    const init = async () => {
      console.log('=== INIT ===');
      console.log('isAppRunning:', isAppRunning());
      const navState = await AsyncStorage.getItem(NAV_STATE_KEY);
      console.log('NAV_STATE:', navState);

      if (!isAppRunning()) {
        // Kaltstart (npm run ios) → Nav-State löschen → Login
        await AsyncStorage.removeItem(NAV_STATE_KEY);
        markAppRunning();
      }

      const { data } = await supabase.auth.getSession();
      const activeSession = data.session ?? null;
      setSession(activeSession);

      if (activeSession && isAppRunning()) {
        const savedState = await AsyncStorage.getItem(NAV_STATE_KEY);
        if (savedState) {
          try {
            setInitialNavState(JSON.parse(savedState));
          } catch (_) {}
        }
      } else {
        await AsyncStorage.removeItem(NAV_STATE_KEY);
      }

      loadingRef.current = false;
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (loadingRef.current) return;
      setSession(session);
      if (!session) {
        await AsyncStorage.removeItem(NAV_STATE_KEY);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!fontsLoaded || loading) return null;

  return (
    <NavigationContainer
      initialState={initialNavState}
      onStateChange={(state) => {
        if (!state) return;
        try {
          AsyncStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
        } catch (_) {}
      }}
    >
      <Stack.Navigator
        initialRouteName={initialNavState ? undefined : (session ? 'Home' : 'Login')}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050607' },
          animation: 'none',
        }}
      >
        <Stack.Screen name="Login"           component={LoginScreen} />
        <Stack.Screen name="SignUp"          component={SignUpScreen} />
        <Stack.Screen name="AdminHome"       component={AdminHomeScreen} />
        <Stack.Screen name="Home"            component={HomeScreen} />
        <Stack.Screen name="MachineList"     component={MachineListScreen} />
        <Stack.Screen name="MachineDetail"   component={MachineDetailScreen} />
        <Stack.Screen name="TimeSlot"        component={TimeSlotScreen} />
        <Stack.Screen name="BookingConfirm"  component={BookingConfirmScreen} />
        <Stack.Screen name="BookingSuccess"  component={BookingSuccessScreen} />
        <Stack.Screen name="Reservations"    component={ReservationsScreen} />
        <Stack.Screen name="CheckIn"         component={CheckInScreen} />
        <Stack.Screen name="Suggestion"      component={SuggestionScreen} />
        <Stack.Screen name="WorkoutProgress" component={ProfileScreen} />
        <Stack.Screen name="Profile"         component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}