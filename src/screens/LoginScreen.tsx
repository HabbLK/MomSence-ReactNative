import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import { Api, ApiError } from '../services/api';
import { Storage } from '../services/storage';
import { LoginIllustration } from '../components/AuthIllustrations';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (route.params?.registeredEmail) {
      setEmail(route.params.registeredEmail);
      setJustRegistered(true);
    }
  }, [route.params]);

  const submit = async () => {
    if (!email.includes('@') || password.length < 4) {
      setError('Enter a valid email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = await Api.login(email.trim(), password);
      await Storage.saveSession(auth.token, auth.name, auth.email);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.illustrationWrap}>
        <LoginIllustration size={180} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your check-ins</Text>

      {justRegistered ? (
        <View style={[styles.successBanner, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.successText, { color: colors.success }]}>Account created — log in to continue</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Log in" onPress={submit} loading={loading} style={styles.button} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.muted, { color: colors.textSecondary }]}>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: colors.primary }]}>Register</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  illustrationWrap: { alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14.5, textAlign: 'center', marginTop: 7 },
  successBanner: { borderRadius: 12, padding: 13, marginTop: 18 },
  successText: { fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  form: { marginTop: 28 },
  button: { marginTop: 6 },
  error: { fontSize: 13.5, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { fontSize: 14.5 },
  link: { fontWeight: '700', fontSize: 14.5 },
});
