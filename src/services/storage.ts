import AsyncStorage from '@react-native-async-storage/async-storage';

const K_TOKEN = 'session_token';
const K_NAME = 'session_name';
const K_EMAIL = 'session_email';
const K_ONBOARDING = 'seen_onboarding';
const K_JOURNAL = 'journal_notes';
// Age bracket is asked once at registration and lives on-device only (the
// backend has no field for it), keyed by email so switching accounts on the
// same device can't leak one user's age bracket into another's.
const K_AGE_PREFIX = 'account_age_';

export type JournalEntry = { date: string; text: string };

export const Storage = {
  saveSession: async (token: string, name: string, email: string) => {
    await AsyncStorage.setMany({ [K_TOKEN]: token, [K_NAME]: name, [K_EMAIL]: email });
  },
  clearSession: () => AsyncStorage.removeMany([K_TOKEN, K_NAME, K_EMAIL]),
  getToken: () => AsyncStorage.getItem(K_TOKEN),
  currentUser: async (): Promise<{ name: string; email: string }> => {
    const values = await AsyncStorage.getMany([K_NAME, K_EMAIL]);
    return { name: values[K_NAME] ?? '', email: values[K_EMAIL] ?? '' };
  },
  updateCachedName: (name: string) => AsyncStorage.setItem(K_NAME, name),
  hasSeenOnboarding: async () => (await AsyncStorage.getItem(K_ONBOARDING)) === '1',
  setSeenOnboarding: () => AsyncStorage.setItem(K_ONBOARDING, '1'),

  getAccountAge: (email: string) => AsyncStorage.getItem(`${K_AGE_PREFIX}${email.toLowerCase()}`),
  setAccountAge: (email: string, age: string) =>
    AsyncStorage.setItem(`${K_AGE_PREFIX}${email.toLowerCase()}`, age),

  // A short private note per calendar day, separate from the per-assessment
  // note already saved with each check-in -- this is a standalone daily
  // journal entry, stored locally only.
  getJournal: async (): Promise<JournalEntry[]> => {
    const raw = await AsyncStorage.getItem(K_JOURNAL);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  },
  getTodayNote: async (): Promise<string> => {
    const entries = await Storage.getJournal();
    const todayKey = new Date().toISOString().slice(0, 10);
    return entries.find(e => e.date === todayKey)?.text ?? '';
  },
  saveTodayNote: async (text: string) => {
    const entries = await Storage.getJournal();
    const todayKey = new Date().toISOString().slice(0, 10);
    const idx = entries.findIndex(e => e.date === todayKey);
    if (idx >= 0) {
      entries[idx] = { date: todayKey, text };
    } else {
      entries.unshift({ date: todayKey, text });
    }
    await AsyncStorage.setItem(K_JOURNAL, JSON.stringify(entries.slice(0, 90)));
  },
};
