import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Radius, bandColor, politeBand } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Button from '../components/Button';
import { Api } from '../services/api';
import { Storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const SAD_TIPS = [
  "Protect your sleep — nap when the baby naps, and ask someone to cover one night feed if you can.",
  "Tell someone you trust how you're really feeling today, even briefly.",
  'Ten minutes outside, even on the doorstep, can genuinely lift your mood.',
  'Keep meals simple and accept help with food if it\'s offered — it matters more than "perfect".',
  'Be gentle with yourself — this feeling is common, and it is treatable.',
];

const TEARFUL_TIPS = [
  "You don't have to manage this alone — tell a partner, friend, or health visitor today.",
  'Consider raising this with your GP, midwife, or health visitor this week.',
  'A few slow breaths before a feed can take the edge off in the moment.',
  'Lower the bar on chores — rest matters more than getting things done right now.',
  "If this feeling doesn't ease over the next couple of weeks, please don't wait to ask for support.",
];

export default function ResultScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { result } = route.params;
  const color = bandColor(result.risk_band, colors);
  const [note, setNote] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);
  const [saveFailed, setSaveFailed] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await Storage.getToken();
      if (!token) {
        setSaving(false);
        setSaveFailed(true);
        return;
      }
      try {
        const saved = await Api.saveAssessment(
          token,
          result.risk_probability,
          result.risk_band,
          result.top_factors,
        );
        setSavedId(saved.id);
      } catch {
        setSaveFailed(true);
      } finally {
        setSaving(false);
      }
    })();
  }, [result]);

  const saveNote = async () => {
    if (!savedId) return;
    const token = await Storage.getToken();
    if (!token) return;
    setSavingNote(true);
    try {
      await Api.updateNote(token, savedId, note);
    } catch {
      // best-effort
    } finally {
      setSavingNote(false);
    }
  };

  const tips = result.risk_band === 'Sad' ? SAD_TIPS : result.risk_band === 'Tearful' ? TEARFUL_TIPS : null;
  const isExtreme = result.risk_band.startsWith('Extreme');

  return (
    <ScreenContainer>
      <Card style={styles.scoreCard}>
        <View style={{ width: 132, height: 132 }}>
          <Svg width={132} height={132}>
            <Circle cx={66} cy={66} r={55} stroke={colors.border} strokeWidth={13} fill="none" />
            <Circle
              cx={66}
              cy={66}
              r={55}
              stroke={color}
              strokeWidth={13}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 55} ${2 * Math.PI * 55}`}
              strokeDashoffset={2 * Math.PI * 55 * (1 - Math.min(Math.max(result.risk_probability, 0), 1))}
              strokeLinecap="round"
              transform="rotate(-90 66 66)"
            />
          </Svg>
          <View style={styles.scorePercentWrap}>
            <Text style={[styles.scorePercent, { color }]}>{Math.round(result.risk_probability * 100)}%</Text>
          </View>
        </View>
        <Text style={[styles.bandLabel, { color }]}>{politeBand(result.risk_band)}</Text>
        <Text style={[styles.disclaimerSmall, { color: colors.textSecondary }]}>
          Self-reported mood estimate — not a clinical diagnosis
        </Text>
        {saving ? (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={[styles.savingText, { color: colors.textSecondary }]}>Saving to your history…</Text>
          </View>
        ) : saveFailed ? (
          <Text style={[styles.saveFailedText, { color: colors.danger }]}>
            Could not save this result — it won't appear in your history.
          </Text>
        ) : (
          <Text style={[styles.savedText, { color: colors.success }]}>✓ Saved to your history</Text>
        )}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What influenced this estimate</Text>
      {result.top_factors.map((f, i) => {
        const up = f.direction === 'increases';
        return (
          <View key={i} style={[styles.factorRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.factorArrow, { color: up ? colors.danger : colors.success }]}>{up ? '↑' : '↓'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.factorName, { color: colors.textPrimary }]}>{f.factor}</Text>
              <Text style={[styles.factorSub, { color: colors.textSecondary }]}>
                {up ? 'Pushed the estimate higher' : 'Pushed the estimate lower'}
              </Text>
            </View>
          </View>
        );
      })}

      {tips ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Things that might help right now</Text>
          <Text style={[styles.tipsIntro, { color: colors.textSecondary }]}>
            A few small, practical things — not a substitute for professional support.
          </Text>
          {tips.map((text, i) => (
            <View key={i} style={[styles.tipRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.textPrimary }]}>{text}</Text>
            </View>
          ))}
        </>
      ) : null}

      {isExtreme ? (
        <View style={[styles.urgentCard, { backgroundColor: colors.critical + '18', borderColor: colors.critical }]}>
          <Text style={[styles.urgentTitle, { color: colors.critical }]}>This result suggests you may need support soon</Text>
          <Text style={[styles.urgentBody, { color: colors.textPrimary }]}>
            Please consider speaking to your GP, midwife, or health visitor as soon as you can. If you need
            to talk to someone right now, contact your local emergency or crisis service.
          </Text>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Private note (optional)</Text>
      <TextInput
        style={[
          styles.noteInput,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
        ]}
        multiline
        numberOfLines={3}
        placeholder="e.g. Rough night, baby was unwell..."
        placeholderTextColor={colors.textSecondary}
        value={note}
        onChangeText={setNote}
        editable={!!savedId}
      />
      <Pressable style={styles.saveNoteBtn} disabled={!savedId || savingNote} onPress={saveNote}>
        <Text style={[styles.saveNoteText, { color: colors.primary }]}>{savingNote ? 'Saving…' : 'Save note'}</Text>
      </Pressable>

      <View style={[styles.disclaimerBox, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>{result.disclaimer}</Text>
      </View>

      <Button title="Start a new check-in" onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 20 }} />
      <Button
        title="Back to home"
        variant="outline"
        onPress={() => navigation.navigate('MainTabs')}
        style={{ marginTop: 10 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scoreCard: { alignItems: 'center', paddingVertical: 30 },
  scorePercentWrap: { position: 'absolute', width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  scorePercent: { fontSize: 28, fontWeight: '800' },
  bandLabel: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  disclaimerSmall: { fontSize: 13, marginTop: 5, textAlign: 'center' },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  savingText: { fontSize: 13 },
  saveFailedText: { fontSize: 13, marginTop: 11, textAlign: 'center' },
  savedText: { fontSize: 13, marginTop: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 11 },
  tipsIntro: { fontSize: 13.5, marginBottom: 11, marginTop: -4 },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 9,
    gap: 13,
  },
  factorArrow: { fontSize: 21, fontWeight: '900' },
  factorName: { fontSize: 15.5, fontWeight: '700' },
  factorSub: { fontSize: 12.5, marginTop: 2 },
  tipRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 9,
    gap: 13,
    alignItems: 'flex-start',
  },
  tipDot: { width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  tipText: { flex: 1, fontSize: 14.5, lineHeight: 20 },
  urgentCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 17,
    marginTop: 22,
  },
  urgentTitle: { fontWeight: '800', fontSize: 15.5, marginBottom: 9 },
  urgentBody: { fontSize: 14, lineHeight: 20 },
  noteInput: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: 15,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 84,
  },
  saveNoteBtn: { alignSelf: 'flex-end', marginTop: 11 },
  saveNoteText: { fontWeight: '700', fontSize: 14.5 },
  disclaimerBox: {
    borderRadius: Radius.md,
    padding: 15,
    marginTop: 20,
  },
  disclaimerText: { fontSize: 13, lineHeight: 19 },
});
