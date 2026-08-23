import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Radius, bandColor, politeBand, ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { Api, ServerAssessment } from '../services/api';
import { Storage } from '../services/storage';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<ServerAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = await Storage.getToken();
    if (!token) {
      setLoading(false);
      setError('Not signed in');
      return;
    }
    try {
      const h = await Api.getAssessments(token);
      setHistory(h);
    } catch {
      setError('Could not load history — check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScreenContainer onRefresh={load} refreshing={loading}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Your history</Text>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No check-ins yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Complete a check-in and your results will show up here.
          </Text>
        </View>
      ) : (
        <>
          {history.length > 1 ? <TrendChart data={history} colors={colors} /> : null}
          {history.map(r => {
            const color = bandColor(r.risk_band, colors);
            const isOpen = expanded === r.id;
            return (
              <Pressable
                key={r.id}
                style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setExpanded(isOpen ? null : r.id)}>
                <View style={styles.recordHeader}>
                  <View style={[styles.recordDot, { backgroundColor: color + '26' }]}>
                    <Text style={[styles.recordDotText, { color }]}>{Math.round(r.risk_probability * 100)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recordBand, { color }]}>{politeBand(r.risk_band)}</Text>
                    <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                      {new Date(r.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[styles.chevron, { color: colors.textSecondary }]}>{isOpen ? '⌃' : '⌄'}</Text>
                </View>
                {isOpen ? (
                  <View style={[styles.recordBody, { borderTopColor: colors.border }]}>
                    {r.top_factors.map((f, i) => (
                      <Text key={i} style={[styles.recordFactor, { color: colors.textPrimary }]}>
                        {f.direction === 'increases' ? '↑' : '↓'} {f.factor}
                      </Text>
                    ))}
                    {r.note ? (
                      <Text style={[styles.recordNote, { color: colors.textSecondary }]}>"{r.note}"</Text>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </>
      )}
    </ScreenContainer>
  );
}

function TrendChart({ data, colors }: { data: ServerAssessment[]; colors: ThemeColors }) {
  const chrono = [...data].reverse().slice(-10);
  const w = 320;
  const h = 100;
  const pad = 8;
  const points = chrono.map((r, i) => {
    const x = pad + (i / Math.max(chrono.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - r.risk_probability * (h - pad * 2);
    return { x, y, r };
  });
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Card style={{ marginBottom: 18 }}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Recent trend</Text>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={3} />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={bandColor(p.r.risk_band, colors)} />
        ))}
      </Svg>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 18 },
  error: { fontSize: 15 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 10 },
  emptyBody: { fontSize: 14, marginTop: 7, textAlign: 'center' },
  chartTitle: { fontSize: 15, fontWeight: '700', marginBottom: 9 },
  recordCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 11,
  },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  recordDot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  recordDotText: { fontWeight: '800', fontSize: 13 },
  recordBand: { fontSize: 16, fontWeight: '800' },
  recordDate: { fontSize: 12.5, marginTop: 3 },
  chevron: { fontSize: 17 },
  recordBody: { marginTop: 13, paddingTop: 13, borderTopWidth: 1 },
  recordFactor: { fontSize: 13.5, marginBottom: 5 },
  recordNote: { fontSize: 13.5, fontStyle: 'italic', marginTop: 7 },
});
