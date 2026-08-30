import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { QuestionSchema } from '../services/api';

type Answers = Record<string, string | number>;

type Props = {
  questions: QuestionSchema[];
  initialAnswers?: Answers;
  submitLabel: string;
  submitting?: boolean;
  submitError?: string | null;
  onSubmit: (answers: Answers) => void;
};

// Renders one question per page (numeric as a text field, everything else
// as tap-one-of-N chips), reused by both the one-time Risk Profile setup
// and the short Check-In flow -- they only differ in which QuestionSchema
// list they pass in and what happens on submit.
export default function QuestionFlow({
  questions,
  initialAnswers,
  submitLabel,
  submitting,
  submitError,
  onSubmit,
}: Props) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [numericDraft, setNumericDraft] = useState('');
  const [numericError, setNumericError] = useState<string | null>(null);

  const total = questions.length;
  const q = questions[step];
  const isNumeric = q.type === 'numeric';

  useEffect(() => {
    if (isNumeric) {
      const existing = answers[q.key];
      setNumericDraft(existing != null ? String(existing) : '');
    }
    setNumericError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const isLast = step === total - 1;
  const answered = isNumeric ? numericDraft.trim().length > 0 : answers[q.key] != null;

  const select = (value: string) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (!isLast) {
      setTimeout(() => setStep(s => s + 1), 180);
    }
  };

  const handlePrimary = () => {
    if (isNumeric) {
      const n = Number(numericDraft.trim());
      if (!Number.isInteger(n) || (q.min != null && n < q.min) || (q.max != null && n > q.max)) {
        setNumericError(`Enter a whole number between ${q.min} and ${q.max}.`);
        return;
      }
      const next = { ...answers, [q.key]: n };
      setAnswers(next);
      if (isLast) onSubmit(next);
      else setStep(s => s + 1);
      return;
    }
    if (isLast) onSubmit(answers);
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

        {isNumeric ? (
          <TextInput
            style={[styles.numericInput, { borderColor: colors.border, color: colors.textPrimary }]}
            value={numericDraft}
            onChangeText={text => {
              setNumericDraft(text.replace(/[^0-9]/g, ''));
              setNumericError(null);
            }}
            keyboardType="number-pad"
            placeholder={q.min != null && q.max != null ? `${q.min}–${q.max}` : undefined}
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
        ) : (
          (q.options ?? []).map(opt => {
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
          })
        )}

        {numericError ? <Text style={[styles.errorText, { color: colors.danger }]}>{numericError}</Text> : null}
        {submitError ? <Text style={[styles.errorText, { color: colors.danger }]}>{submitError}</Text> : null}
      </View>

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => setStep(s => s - 1)}>
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </Pressable>
        ) : null}
        {isNumeric || isLast ? (
          <Pressable
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              (!answered || submitting) && styles.disabled,
            ]}
            disabled={!answered || submitting}
            onPress={handlePrimary}>
            {isLast && submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.white }]}>{isLast ? submitLabel : 'Next'}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  numericInput: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 17,
    paddingHorizontal: 18,
    fontSize: 20,
    fontWeight: '700',
  },
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
  errorText: { textAlign: 'center', fontSize: 15, marginTop: 12 },
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
