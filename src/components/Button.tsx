import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const bg = variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: bg }
          : { backgroundColor: bg },
        (disabled || loading) && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isOutline ? bg : colors.white} />
      ) : (
        <Text style={[styles.text, { color: isOutline ? bg : colors.white }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 17, fontWeight: '700' },
});
