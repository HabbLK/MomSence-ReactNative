import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { useTheme } from '../theme/ThemeContext';
import { HomeIcon, EditIcon, ChartIcon, LeafIcon, ProfileIcon } from '../components/TabIcons';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Standard 5-tab bottom bar matching the Flutter app's main_shell.dart
// exactly: Home, Check-in, History, Resources, Profile.
export default function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '700' },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tab.Screen
        name="CheckIn"
        component={AssessmentScreen}
        options={{ tabBarLabel: 'Check-in', tabBarIcon: ({ color }) => <EditIcon color={color} /> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'History', tabBarIcon: ({ color }) => <ChartIcon color={color} /> }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{ tabBarLabel: 'Resources', tabBarIcon: ({ color }) => <LeafIcon color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </Tab.Navigator>
  );
}
