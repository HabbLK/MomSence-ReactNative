import { RiskResult } from '../services/api';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { registeredEmail?: string } | undefined;
  Register: undefined;
  MainTabs: undefined;
  RiskProfile: undefined;
  Result: { result: RiskResult };
};

export type MainTabParamList = {
  Home: undefined;
  CheckIn: undefined;
  History: undefined;
  Resources: undefined;
  Profile: undefined;
};
