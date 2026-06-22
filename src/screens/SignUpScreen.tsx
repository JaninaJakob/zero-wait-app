import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabaseClient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      Alert.alert('Sign up failed', error.message);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, role: 'user', full_name: fullName.trim() });
    }

    setLoading(false);
    Alert.alert('Account created!', 'You can now log in.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Book your lift. Skip the wait.</Text>
      </View>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textSecondary} value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, loading && styles.buttonActive]} onPress={handleSignUp} activeOpacity={0.75} disabled={loading}>
          <Text style={styles.buttonLabel}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.75}>
          <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Log In</Text></Text>
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
  formWrapper: { position: 'absolute', top: 340, left: 50, right: 50, gap: 16 },
  title: { fontFamily: 'Inter-Medium', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter-Medium', fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonActive: { backgroundColor: Colors.brand },
  buttonLabel: { fontFamily: 'Inter-Bold', fontSize: 16, color: Colors.textPrimary },
  switchText: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  switchLink: { color: Colors.brand },
});