import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export default function Card({ style, children, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
  },
});
