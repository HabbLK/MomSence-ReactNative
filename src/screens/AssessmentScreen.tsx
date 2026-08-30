import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import Button from '../components/Button';
import QuestionFlow from '../components/QuestionFlow';
import { Api, ApiError, AppSchema } from '../services/api';
import { Storage } from '../services/storage';
import { RiskProfile, RiskProfileAnswers } from '../services/riskProfile';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CheckIn'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssessmentScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [schema, setSchema] = useState<AppSchema | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<RiskProfileAnswers | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    Api.fetchSchema()
      .then(setSchema)
      .catch(() => setLoadError('Could not load the questionnaire. Check your connection.'));
  }, []);

  // Re-check the stored profile every time this tab gains focus, so
  // finishing "Set up your risk profile" and returning here picks it up.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const user = await Storage.currentUser();
        setEmail(user.email);
        setProfile(user.email ? await RiskProfile.get(user.email) : null);
      })();
    }, []),
  );

  const submit = async (answers: Record<string, string | number>) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await Api.predict({ ...profile, ...answers });
      navigation.getParent()?.navigate('Result', { result });
    } catch (e) {
      setSubmitError(
        e instanceof ApiError ? e.message : 'Could not compute a result. Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>{loadError}</Text>
      </SafeAreaView>
    );
  }
  if (!schema || profile === undefined) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.promptTitle, { color: colors.textPrimary }]}>Set up your risk profile</Text>
        <Text style={[styles.promptBody, { color: colors.textSecondary }]}>
          Before your first check-in, we need a few background details -- things like age and pregnancy
          history that don't change day to day. It only takes a couple of minutes and you can update it
          any time from your Profile tab.
        </Text>
        <Button
          title="Set up risk profile"
          onPress={() => navigation.getParent()?.navigate('RiskProfile')}
          style={styles.promptBtn}
        />
      </SafeAreaView>
    );
  }

  return (
    <QuestionFlow
      questions={schema.checkin}
      submitLabel="Get my result"
      submitting={submitting}
      submitError={submitError}
      onSubmit={submit}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { textAlign: 'center', fontSize: 15 },
  promptTitle: { fontSize: 21, fontWeight: '800', textAlign: 'center' },
  promptBody: { fontSize: 14.5, textAlign: 'center', marginTop: 12, lineHeight: 21 },
  promptBtn: { marginTop: 24, alignSelf: 'stretch' },
});
