import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Radius, politeBand } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { Api, ServerAssessment } from '../services/api';
import { Storage } from '../services/storage';
import { parseAge } from '../services/age';
import { computeStreak } from '../services/streak';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MODE_LABELS = { system: 'System', light: 'Light', dark: 'Dark' } as const;
const MODE_ORDER: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];

export default function ProfileScreen({ navigation }: Props) {
  const { colors, mode, setMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [history, setHistory] = useState<ServerAssessment[]>([]);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [age, setAge] = useState<string | null>(null);
  const [ageEditing, setAgeEditing] = useState(false);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const user = await Storage.currentUser();
    setName(user.name);
    setEmail(user.email);
    setAge(user.email ? await Storage.getAccountAge(user.email) : null);
    const token = await Storage.getToken();
    if (token) {
      try {
        setHistory(await Api.getAssessments(token));
      } catch {
        // keep cached
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const saveAge = async () => {
    const parsed = parseAge(draftAge ?? '');
    if (parsed == null) return setAgeError('Enter an age between 17 and 90.');
    if (email) await Storage.setAccountAge(email, String(parsed));
    setAge(String(parsed));
    setAgeError(null);
    setAgeEditing(false);
  };

  const saveName = async () => {
    const token = await Storage.getToken();
    if (token && draftName.trim()) {
      try {
        await Api.updateName(token, draftName.trim());
        await Storage.updateCachedName(draftName.trim());
      } catch {
        // ignore
      }
    }
    setEditing(false);
    load();
  };

  const logout = async () => {
    const token = await Storage.getToken();
    if (token) {
      try {
        await Api.logout(token);
      } catch {
        // ignore
      }
    }
    await Storage.clearSession();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const cycleAppearance = () => {
    const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length];
    setMode(next);
  };

  const streak = computeStreak(history);
  const lastBand = history[0] ? politeBand(history[0].risk_band) : '—';

  return (
    <ScreenContainer>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.white }]}>{name ? name[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{name || 'Guest'}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
        <Pressable
          onPress={() => {
            setDraftName(name);
            setEditing(true);
          }}>
          <Text style={[styles.editLink, { color: colors.primary }]}>Edit name</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Check-ins" value={String(history.length)} colors={colors} />
        <Stat label="Last result" value={lastBand} colors={colors} />
        <Stat label="Streak" value={String(streak)} colors={colors} />
      </View>

      <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MenuRow
          label="Age"
          value={age ? `${age}` : 'Not set'}
          onPress={() => {
            setDraftAge(age);
            setAgeError(null);
            setAgeEditing(true);
          }}
          colors={colors}
        />
        <MenuRow
          label="Appearance"
          value={MODE_LABELS[mode]}
          onPress={cycleAppearance}
          colors={colors}
        />
        <MenuRow label="About this app" value={undefined} onPress={() => setAboutOpen(true)} colors={colors} last />
      </View>

      <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: 26 }} />

      <Modal visible={editing} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit name</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.textPrimary }]}
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setEditing(false)} style={styles.modalCancel}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveName} style={[styles.modalSave, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={ageEditing} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Your age</Text>
            <Text style={[styles.aboutBody, { color: colors.textSecondary, marginTop: -8, marginBottom: 4 }]}>
              Used to tailor your check-in results. Enter an age between 17 and 90.
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.textPrimary }]}
              value={draftAge ?? ''}
              onChangeText={text => {
                setDraftAge(text.replace(/[^0-9]/g, ''));
                setAgeError(null);
              }}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="e.g. 28"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            {ageError ? <Text style={[styles.ageError, { color: colors.danger }]}>{ageError}</Text> : null}
            <View style={styles.modalRow}>
              <Pressable onPress={() => setAgeEditing(false)} style={styles.modalCancel}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveAge} style={[styles.modalSave, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={aboutOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>MomSense — Research Prototype</Text>
            <Text style={[styles.aboutBody, { color: colors.textSecondary }]}>
              An explainable machine learning prototype exploring self-reported low-mood symptom
              co-occurrence from a short screening questionnaire. This estimates how a person's OTHER
              reported symptoms relate to feeling sad or tearful — it is not a validated postpartum
              depression diagnosis or screening tool.
            </Text>
            <Text style={[styles.aboutDanger, { color: colors.danger }]}>
              This app is NOT a diagnostic tool and does not replace professional medical advice.
            </Text>
            <Button title="Close" onPress={() => setAboutOpen(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function MenuRow({
  label,
  value,
  onPress,
  colors,
  last,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, !last && [styles.menuRowBorder, { borderBottomColor: colors.border }]]}>
      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value ? <Text style={{ color: colors.textSecondary, fontSize: 13.5 }}>{value}</Text> : null}
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 13 },
  email: { fontSize: 14, marginTop: 3 },
  editLink: { fontWeight: '700', fontSize: 13.5, marginTop: 9 },
  statsRow: { flexDirection: 'row', gap: 11, marginBottom: 22 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 5 },
  menu: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuRowBorder: { borderBottomWidth: 1 },
  menuLabel: { fontSize: 15.5, fontWeight: '600' },
  chevron: { fontSize: 19 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: Radius.lg, padding: 21, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15 },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    padding: 13,
    fontSize: 16,
  },
  ageError: { fontSize: 12.5, marginTop: 6 },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 19 },
  modalCancel: { paddingVertical: 9, paddingHorizontal: 6 },
  modalSave: { borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 19 },
  aboutCard: { borderRadius: Radius.lg, padding: 23, width: '100%' },
  aboutBody: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  aboutDanger: { fontSize: 13, fontWeight: '700', marginTop: 15, lineHeight: 19 },
});
