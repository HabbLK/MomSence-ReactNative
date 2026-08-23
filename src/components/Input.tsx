import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type Props = TextInputProps & { label: string; error?: string };

export default function Input({ label, error, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: { fontSize: 12.5, marginTop: 5 },
});
