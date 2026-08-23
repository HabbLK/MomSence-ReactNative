import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { Api, ApiError, AppSchema, QuestionSchema } from '../services/api';
import { Storage } from '../services/storage';
import { storedAgeToBracket } from '../services/age';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CheckIn'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssessmentScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [schema, setSchema] = useState<AppSchema | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    Api.fetchSchema()
      .then(setSchema)
      .catch(() => setLoadError('Could not load the questionnaire. Check your connection.'));
  }, []);

  if (loadError) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>{loadError}</Text>
      </SafeAreaView>
    );
  }
  if (!schema) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const questions: QuestionSchema[] = schema.symptoms;
  const total = questions.length;
  const q = questions[step];

  const select = (value: string) => {
    setAnswers(prev => ({ ...prev, [q.key]: value }));
    setTimeout(() => {
      if (step < total - 1) setStep(s => s + 1);
    }, 180);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // The server rejects /predict without a valid Age bracket, but the
      // questionnaire no longer asks for it -- resolve it from the age the
      // user typed on their Profile (re-read fresh in case it changed).
      const user = await Storage.currentUser();
      const stored = user.email ? await Storage.getAccountAge(user.email) : null;
      const bracket = storedAgeToBracket(stored, schema.age.options);
      if (!bracket) {
        setSubmitError('Add your age on your Profile tab first, then try again.');
        return;
      }
      const result = await Api.predict({ ...answers, Age: bracket });
      navigation.getParent()?.navigate('Result', { result });
      setAnswers({});
      setStep(0);
    } catch (e) {
      setSubmitError(
        e instanceof ApiError ? e.message : 'Could not compute a result. Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${((step + 1) / total) * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        Question {step + 1} of {total}
      </Text>

      <View style={styles.body}>
        <Text style={[styles.question, { color: colors.textPrimary }]}>{q.label}</Text>
        {q.options.map(opt => {
          const selected = answers[q.key] === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => select(opt)}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
              ]}>
              <Text
                style={[
                  styles.optionText,
                  { color: colors.textPrimary },
                  selected && { color: colors.primaryDark },
                ]}>
                {opt}
              </Text>
              {selected ? <Text style={[styles.check, { color: colors.primary }]}>✓</Text> : null}
            </Pressable>
          );
        })}
        {submitError ? <Text style={[styles.errorText, { color: colors.danger }]}>{submitError}</Text> : null}
      </View>

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => setStep(s => s - 1)}>
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </Pressable>
        ) : null}
        {step === total - 1 ? (
          <Pressable
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              (!answers[q.key] || submitting) && styles.disabled,
            ]}
            disabled={!answers[q.key] || submitting}
            onPress={submit}>
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.white }]}>Get my result</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { textAlign: 'center', fontSize: 15 },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    marginHorizontal: 20,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: { height: 7, borderRadius: 4 },
  stepLabel: { fontSize: 13.5, marginTop: 10, marginHorizontal: 20 },
  body: { flex: 1, padding: 20 },
  question: { fontSize: 24, fontWeight: '800', marginTop: 14, marginBottom: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 17,
    paddingHorizontal: 18,
    marginBottom: 13,
  },
  optionText: { fontSize: 17, fontWeight: '600' },
  check: { fontWeight: '900', fontSize: 18 },
  footer: { padding: 20, flexDirection: 'row', gap: 12 },
  backBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backBtnText: { fontWeight: '700', fontSize: 16 },
  submitBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  submitBtnText: { fontWeight: '800', fontSize: 16.5 },
});
