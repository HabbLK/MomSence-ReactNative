import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { lightColors as Colors } from '../theme/colors';
// The splash is a fixed brand moment (like the Flutter app's), not
// theme-dependent -- it always uses the light-mode primary purple.
import { Storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const route = async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 900));
      const seen = await Storage.hasSeenOnboarding();
      const token = await Storage.getToken();
      if (!seen) {
        navigation.replace('Onboarding');
      } else if (token) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    };
    route();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>N</Text>
      </View>
      <Text style={styles.title}>MomSense</Text>
      <Text style={styles.subtitle}>Explainable postpartum wellbeing check-ins</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeText: { fontSize: 34, fontWeight: '800', color: Colors.primary },
  title: { color: Colors.white, fontSize: 30, fontWeight: '800', letterSpacing: 0.4 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
