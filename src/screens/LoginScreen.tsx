import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabaseClient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      Alert.alert('Login failed', error.message);
      return;
    }

    // Rolle abrufen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profile?.role === 'admin') {
      navigation.reset({ index: 0, routes: [{ name: 'AdminHome' }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Book your lift. Skip the wait.</Text>
      </View>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Log In</Text>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, loading && styles.buttonActive]} onPress={handleLogin} activeOpacity={0.75} disabled={loading}>
          <Text style={styles.buttonLabel}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.75}>
          <Text style={styles.switchText}>No account yet? <Text style={styles.switchLink}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 92 },
  logo: { width: 260, height: 160, marginHorizontal: 49, marginBottom: 20, marginTop: -20, alignSelf: 'center' },
  subtitle: { fontFamily: 'Inter-Medium', fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginHorizontal: 49, marginBottom: 76, alignSelf: 'center' },
  formWrapper: { position: 'absolute', top: 380, left: 50, right: 50, gap: 16 },
  title: { fontFamily: 'Inter-Medium', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonActive: { backgroundColor: Colors.brand },
  buttonLabel: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary },
  switchText: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  switchLink: { color: Colors.brand },
});
