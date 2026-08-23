import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  label?: string;
  value: string | null;
  options: string[];
  onChange: (v: string) => void;
  error?: string;
};

export default function ChipSelectField({ label, value, options, onChange, error }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map(opt => {
          const selected = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                selected && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
              ]}>
              <Text style={[styles.chipText, { color: selected ? colors.primaryDark : colors.textPrimary }]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 9 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  error: { fontSize: 12.5, marginTop: 7 },
});
