import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { Storage } from '../services/storage';
import { HeartPulseIllustration, InsightIllustration, PrivacyShieldIllustration } from '../components/OnboardingIllustrations';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    Illustration: HeartPulseIllustration,
    title: 'Check in on yourself',
    body: 'Answer a short, private wellbeing questionnaire any time you want a check-in after childbirth.',
  },
  {
    Illustration: InsightIllustration,
    title: 'Understand your result',
    body: 'Every estimate comes with a plain-language explanation of the factors that shaped it — powered by SHAP.',
  },
  {
    Illustration: PrivacyShieldIllustration,
    title: 'Private, on your device',
    body: 'Your answers and history stay on this device. This is a research prototype, not a diagnostic tool.',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    await Storage.setSeenOnboarding();
    navigation.replace('Login');
  };

  const goNext = () => {
    if (last) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={finish}>
          <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}>
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <s.Illustration size={220} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{s.title}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: colors.border },
              i === index && [styles.dotActive, { backgroundColor: colors.primary }],
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goNext}>
          <Text style={[styles.nextBtnText, { color: colors.white }]}>{last ? 'Get started' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  skipRow: { alignItems: 'flex-end', padding: 14 },
  skipText: { fontWeight: '700', fontSize: 15 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 38,
  },
  body: {
    fontSize: 14.5,
    textAlign: 'center',
    marginTop: 13,
    lineHeight: 21,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: { width: 26 },
  footer: { padding: 24 },
  nextBtn: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: { fontWeight: '800', fontSize: 17 },
});
