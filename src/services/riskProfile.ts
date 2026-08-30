import AsyncStorage from '@react-native-async-storage/async-storage';

// The retrained model needs 45 risk factors per prediction. Most are stable
// facts (age, education, relationships, pregnancy/birth history) that don't
// change day to day, so they're collected once as a "Risk Profile" and
// stored on-device, keyed by email so switching accounts on the same device
// can't leak one user's profile into another's. The backend has no field
// for this yet, matching the existing account-age approach it replaces.
const K_PROFILE_PREFIX = 'risk_profile_';

export type RiskProfileAnswers = Record<string, string | number>;

export const RiskProfile = {
  get: async (email: string): Promise<RiskProfileAnswers | null> => {
    const raw = await AsyncStorage.getItem(`${K_PROFILE_PREFIX}${email.toLowerCase()}`);
    return raw ? (JSON.parse(raw) as RiskProfileAnswers) : null;
  },
  save: (email: string, answers: RiskProfileAnswers) =>
    AsyncStorage.setItem(`${K_PROFILE_PREFIX}${email.toLowerCase()}`, JSON.stringify(answers)),
  has: async (email: string): Promise<boolean> => (await RiskProfile.get(email)) != null,
};
