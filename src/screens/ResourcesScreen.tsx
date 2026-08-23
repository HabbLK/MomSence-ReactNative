import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius, ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';

function buildTips(colors: ThemeColors): [string, string, string][] {
  return [
    [colors.primary, 'Protect your sleep', 'Sleep when the baby sleeps where possible, and ask a partner or family member to cover a night feed so you can get one longer stretch of rest.'],
    [colors.accent, 'Talk to someone you trust', 'Sharing how you feel with a partner, friend, or health visitor — even briefly — can reduce feelings of isolation.'],
    [colors.secondary, 'Gentle movement', 'A short walk outside, even 10 minutes, is linked with improved mood and energy during the postpartum period.'],
    [colors.warning, 'Keep meals simple', 'Regular, simple meals matter more than "perfect" ones. Batch-cooking or accepting help with food reduces daily load.'],
    [colors.success, 'Small mindful pauses', 'A few slow breaths before feeding or during a nap can help regulate anxiety in the moment.'],
    [colors.danger, 'Know when to ask for help', 'Persistent sadness, anxiety, or difficulty bonding for more than two weeks is worth raising with a healthcare professional.'],
  ];
}

export default function ResourcesScreen() {
  const { colors } = useTheme();
  const tips = buildTips(colors);
  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Self-care resources</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        General wellbeing tips — not a substitute for professional care.
      </Text>

      {tips.map(([color, heading, body], i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.accentBar, { backgroundColor: color }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>{heading}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 7, marginBottom: 22 },
  card: {
    flexDirection: 'row',
    gap: 15,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 11,
    alignItems: 'stretch',
  },
  accentBar: { width: 4, borderRadius: 2 },
  heading: { fontSize: 15.5, fontWeight: '800', marginBottom: 5 },
  body: { fontSize: 13.5, lineHeight: 19 },
});
