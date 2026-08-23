import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import { Api, ApiError } from '../services/api';
import { Storage } from '../services/storage';
import { parseAge } from '../services/age';
import { RegisterIllustration } from '../components/AuthIllustrations';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return setError('Enter your name.');
    if (!email.includes('@')) return setError('Enter a valid email.');
    const parsedAge = parseAge(age);
    if (parsedAge == null) return setError('Enter an age between 17 and 90.');
    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    setError(null);
    try {
      const auth = await Api.register(name.trim(), email.trim(), password);
      // Age isn't part of the account backend yet, so it's kept on-device,
      // scoped to this email -- see Storage.getAccountAge/setAccountAge.
      await Storage.setAccountAge(auth.email, String(parsedAge));
      // Registration no longer signs the user in automatically -- they
      // must log in with their new credentials, matching the Flutter app.
      navigation.navigate('Login', { registeredEmail: auth.email });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.illustrationWrap}>
        <RegisterIllustration size={170} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Join MomSense</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create a free account to save your check-in history</Text>

      <View style={styles.form}>
        <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <Input
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="••••••••"
        />
        <Input
          label="Age"
          value={age}
          onChangeText={text => setAge(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="e.g. 28"
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Create account" onPress={submit} loading={loading} style={styles.button} />
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          This is a research build, not a production-hardened system — avoid reusing a sensitive password.
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.muted, { color: colors.textSecondary }]}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: colors.primary }]}>Log in</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: { alignItems: 'center', marginTop: 12 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  subtitle: { fontSize: 14.5, textAlign: 'center', marginTop: 7 },
  form: { marginTop: 28 },
  button: { marginTop: 6 },
  error: { fontSize: 13.5, marginBottom: 10 },
  disclaimer: { fontSize: 12.5, marginTop: 13, textAlign: 'center', lineHeight: 18 },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { fontSize: 14.5 },
  link: { fontWeight: '700', fontSize: 14.5 },
});
