import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import QuestionFlow from '../components/QuestionFlow';
import { Api, AppSchema } from '../services/api';
import { Storage } from '../services/storage';
import { RiskProfile, RiskProfileAnswers } from '../services/riskProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'RiskProfile'>;

export default function RiskProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [schema, setSchema] = useState<AppSchema | null>(null);
  const [existing, setExisting] = useState<RiskProfileAnswers | null>(null);
  const [email, setEmail] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [loadedSchema, user] = await Promise.all([Api.fetchSchema(), Storage.currentUser()]);
        setSchema(loadedSchema);
        setEmail(user.email);
        setExisting(user.email ? await RiskProfile.get(user.email) : null);
      } catch {
        setLoadError('Could not load the questionnaire. Check your connection.');
      }
    })();
  }, []);

  const submit = async (answers: RiskProfileAnswers) => {
    setSaving(true);
    try {
      await RiskProfile.save(email, answers);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <QuestionFlow
      questions={schema.profile}
      initialAnswers={existing ?? undefined}
      submitLabel="Save profile"
      submitting={saving}
      onSubmit={submit}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { textAlign: 'center', fontSize: 15 },
});
