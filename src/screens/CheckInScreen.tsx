import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Animated, Dimensions, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;
};

type Stage = 'scanning' | 'ready' | 'training' | 'expired' | 'extend';

function FlashButton({
  onPress, style, children, delay = 0, disableFlash = false,
}: {
  onPress: () => void; style?: any; children: React.ReactNode; delay?: number; disableFlash?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const handle = () => {
    if (disableFlash) { onPress(); return; }
    setPressed(true);
    setTimeout(() => { setPressed(false); onPress(); }, delay);
  };
  return (
    <TouchableOpacity style={[style, pressed && { backgroundColor: Colors.brand }]} onPress={handle} activeOpacity={1}>
      {children}
    </TouchableOpacity>
  );
}

export default function CheckInScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('scanning');
  const [scanned, setScanned] = useState(false);
  const [scannedMachine, setScannedMachine] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [selectedExtend, setSelectedExtend] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const yellowAnim = useRef(new Animated.Value(1)).current;

  const parseDurationToSeconds = (endTime: string): number => {
    if (endTime.includes('Hour')) return parseInt(endTime) * 60 * 60;
    if (endTime.includes('Min')) return parseInt(endTime) * 60;
    return 10 * 60;
  };

  useEffect(() => {
    const restore = async () => {
      const endTimeStr = await AsyncStorage.getItem('trainingEndTime');
      const machine = await AsyncStorage.getItem('trainingMachine');
      if (!endTimeStr || !machine) {
        const stored = await AsyncStorage.getItem('reservations');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            const next = list[0];
            const duration = parseDurationToSeconds(next.endTime);
            setSecondsLeft(duration);
          }
        }
        return;
      }
      const endTime = parseInt(endTimeStr);
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        await AsyncStorage.multiRemove(['trainingEndTime', 'trainingMachine']);
        setStage('expired');
        setScannedMachine(machine);
      } else {
        setScannedMachine(machine);
        setSecondsLeft(remaining);
        setScanned(true);
        setStage('training');
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  useEffect(() => {
    if (stage === 'training') {
      const totalSeconds = secondsLeft;
      const startTime = Date.now();
      const endTime = startTime + totalSeconds * 1000;
      AsyncStorage.setItem('trainingEndTime', endTime.toString());
      AsyncStorage.setItem('trainingMachine', scannedMachine);
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) clearInterval(timerRef.current!);
      }, 100);
      yellowAnim.setValue(1);
      Animated.timing(yellowAnim, {
        toValue: 0,
        duration: totalSeconds * 1000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          clearInterval(timerRef.current!);
          setSecondsLeft(0);
          AsyncStorage.multiRemove(['trainingEndTime', 'trainingMachine']);
          setStage('expired');
        }
      });
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const stored = await AsyncStorage.getItem('reservations');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        setScannedMachine(list[0].machine.name);
        setStage('ready');
        return;
      }
    }
    setScannedMachine(data);
    setStage('ready');
  };

  const handleStart = () => {
    yellowAnim.setValue(1);
    setStage('training');
  };

  const handleStop = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    yellowAnim.stopAnimation();
    await AsyncStorage.multiRemove(['trainingEndTime', 'trainingMachine']);
    setStage('scanning');
    setScanned(false);
    setScannedMachine('');
    setSelectedExtend(null);
    yellowAnim.setValue(1);
    const stored = await AsyncStorage.getItem('reservations');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        setSecondsLeft(parseDurationToSeconds(list[0].endTime));
      }
    } else {
      setSecondsLeft(10 * 60);
    }
  };

  const handleExtend = () => setStage('extend');

  const timeLeftDisplay = secondsLeft < 60
    ? `${secondsLeft} Sec left`
    : `${Math.floor(secondsLeft / 60)} Min left`;

  const yellowHeight = yellowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderContent = () => {
    if (stage === 'scanning') {
      return (
        <View style={styles.scannerContainer}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={handleScan}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
          ) : (
            <FlashButton onPress={requestPermission}>
              <Text style={styles.permissionText}>Allow camera access</Text>
            </FlashButton>
          )}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          <Text style={styles.scanText}>Scan the QR-Code</Text>
          <TouchableOpacity style={styles.demoButton} onPress={() => handleScan({ data: 'demo' })}>
            <Text style={styles.demoText}>Demo: Simulate Scan</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (stage === 'ready') {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.machineText}>{scannedMachine}</Text>
          <FlashButton style={styles.bigButton} onPress={handleStart}>
            <Text style={styles.bigButtonText}>Start</Text>
          </FlashButton>
        </View>
      );
    }
    if (stage === 'training') {
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.yellowContainer}>
            <Animated.View style={[styles.yellowBg, { height: yellowHeight }]} />
          </View>
          <View style={styles.centerContainer}>
            <Text style={styles.machineText}>{scannedMachine}</Text>
            <FlashButton style={styles.bigButtonBlue} onPress={handleStop}>
              <Text style={styles.bigButtonText}>Stop</Text>
            </FlashButton>
          </View>
          <View style={styles.bottomInfo}>
            <Text style={styles.trainingText}>You are training now.</Text>
            <Text style={styles.timeLeftText}>{timeLeftDisplay}</Text>
          </View>
        </View>
      );
    }
    if (stage === 'expired') {
      return (
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredText}>Your reserved time for the machine has expired. Would you like to extend it?</Text>
          <View style={styles.dialogButtons}>
            <FlashButton style={[styles.dialogBtn, styles.dialogBtnActive]} onPress={handleExtend}>
              <Text style={styles.dialogBtnText}>Yes</Text>
            </FlashButton>
            <FlashButton style={styles.dialogBtn} onPress={handleStop}>
              <Text style={styles.dialogBtnText}>No</Text>
            </FlashButton>
          </View>
        </View>
      );
    }
    if (stage === 'extend') {
      const options = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
      const occupiedFrom = 40;
      return (
        <View style={styles.extendContainer}>
          <Text style={styles.extendTitle}>How long do you want to keep using the machine?</Text>
          <View style={styles.optionsGrid}>
            {options.map(min => {
              const isOccupied = min >= occupiedFrom;
              return (
                <FlashButton
                  key={min}
                  style={[styles.optionChip, selectedExtend === min && styles.optionChipActive, isOccupied && styles.optionChipOccupied]}
                  onPress={() => { if (!isOccupied) setSelectedExtend(min); }}
                  disableFlash={isOccupied}
                >
                  <Text style={[styles.optionChipText, isOccupied && styles.optionChipTextOccupied]}>{min} Min.</Text>
                </FlashButton>
              );
            })}
          </View>
          <FlashButton
            style={[styles.reserveBtn, !selectedExtend && styles.reserveBtnDisabled]}
            onPress={() => {
              if (!selectedExtend) return;
              setSecondsLeft(selectedExtend * 60);
              setSelectedExtend(null);
              setStage('training');
            }}
            disableFlash={!selectedExtend}
          >
            <Text style={styles.reserveBtnText}>Reserve</Text>
          </FlashButton>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }} />
          <Image source={require('../../assets/logo.png')} style={styles.logoSmall} resizeMode="contain" />
        </View>
        <Text style={styles.pageTitle}>CHECK-IN</Text>
      </View>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
      <View style={styles.tabBarWrapper}>
        <FlashButton style={styles.qrButton} onPress={() => {}} disableFlash>
          <Icon name="qrcode" size={45} color={Colors.textPrimary} />
        </FlashButton>
        <View style={styles.tabBar}>
          <FlashButton style={styles.tabItem} onPress={() => navigation.navigate('Suggestion')}>
            <Icon name="help-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Suggestion</Text>
          </FlashButton>
          <FlashButton style={styles.tabItem} onPress={() => navigation.navigate('MachineList')}>
            <MaterialIcons name="add-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reserve</Text>
          </FlashButton>
          <FlashButton style={styles.tabItem} onPress={() => navigation.navigate('Reservations')}>
            <MaterialIcons name="check-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Reservations</Text>
          </FlashButton>
          {/* Profile – NEU */}
          <FlashButton style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <MaterialIcons name="account-box" size={36} color={Colors.textPrimary} />
            <Text style={styles.tabLabel}>Profile</Text>
          </FlashButton>
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
  scannerContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  scanText: { position: 'absolute', top: 100, color: Colors.textPrimary, fontFamily: 'Inter-Medium', fontSize: 16 },
  cornerTL: { position: 'absolute', top: '25%', left: '20%', width: 40, height: 40, borderTopWidth: 5, borderLeftWidth: 5, borderColor: Colors.textPrimary },
  cornerTR: { position: 'absolute', top: '25%', right: '20%', width: 40, height: 40, borderTopWidth: 5, borderRightWidth: 5, borderColor: Colors.textPrimary },
  cornerBL: { position: 'absolute', bottom: '25%', left: '20%', width: 40, height: 40, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: Colors.textPrimary },
  cornerBR: { position: 'absolute', bottom: '25%', right: '20%', width: 40, height: 40, borderBottomWidth: 5, borderRightWidth: 5, borderColor: Colors.textPrimary },
  permissionText: { color: Colors.textPrimary, fontFamily: 'Inter-Medium', fontSize: 16 },
  demoButton: { position: 'absolute', top: '55%', backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  demoText: { color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter-Medium', fontSize: 11 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 80 },
  machineText: { fontFamily: 'Inter-Bold', fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginLeft: 20 },
  bigButton: { width: 288, height: 288, borderRadius: 32, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  bigButtonBlue: { width: 288, height: 288, borderRadius: 32, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  bigButtonText: { fontFamily: 'Inter-Medium', fontSize: 64, fontWeight: '500', color: Colors.textPrimary },
  trainingText: { fontFamily: 'Inter-Medium', fontSize: 18, color: Colors.textPrimary },
  timeLeftText: { fontFamily: 'Inter-Medium', fontSize: 18, color: Colors.textPrimary },
  bottomInfo: { position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center', gap: 2 },
  yellowContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 37 },
  yellowBg: { left: 0, right: 0, backgroundColor: '#D4C84A' },
  expiredContainer: { flex: 1, paddingHorizontal: 50, paddingTop: 100, gap: 32 },
  expiredText: { fontFamily: 'Inter-Medium', fontSize: 24, color: Colors.textPrimary, textAlign: 'left', lineHeight: 32 },
  dialogButtons: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  dialogBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 28 },
  dialogBtnActive: { backgroundColor: Colors.brand },
  dialogBtnText: { fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary },
  extendContainer: { flex: 1, paddingHorizontal: 50, paddingTop: 100, gap: 32 },
  extendTitle: { fontFamily: 'Inter-Medium', fontSize: 24, color: Colors.textPrimary, textAlign: 'left', lineHeight: 32 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 10, width: 90, alignItems: 'center', borderWidth: 1, borderColor: Colors.stroke },
  optionChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  optionChipOccupied: { opacity: 0.3 },
  optionChipText: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  optionChipTextOccupied: { color: Colors.textSecondary },
  reserveBtn: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center', alignSelf: 'center' },
  reserveBtnDisabled: { opacity: 0.4 },
  reserveBtnText: { fontFamily: 'Inter-Medium', fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  qrButton: { position: 'absolute', right: 12, top: -70, backgroundColor: Colors.brand, borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
  tabBar: { backgroundColor: Colors.surface, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.stroke, height: 70 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: Colors.brand, borderRadius: 12 },
  tabLabel: { fontFamily: 'Inter-Medium', fontSize: 9, fontWeight: '500', color: Colors.textPrimary },
});
