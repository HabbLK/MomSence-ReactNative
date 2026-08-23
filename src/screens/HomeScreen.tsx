import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Radius, bandColor, politeBand, ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { Api, ServerAssessment } from '../services/api';
import { Storage } from '../services/storage';
import { computeStreak } from '../services/streak';

// Maps a "top factor" label (see api/app.py FACTOR_LABELS) to a short,
// relevant tip -- powers the "Because X came up last time" card.
const FACTOR_TIPS: Record<string, string> = {
  'Trouble sleeping at night': 'Two ways to protect rest tonight',
  'Feeling anxious': 'A short breathing exercise that helps in the moment',
  'Difficulty bonding with baby': 'Small ways to build connection, no pressure',
  'Feelings of guilt': 'Why these feelings are common, and not your fault',
  'Irritability towards baby/partner': 'A gentle reset when patience runs thin',
  'Appetite changes': 'Simple, low-effort meal ideas',
  'Difficulty concentrating or deciding': 'Reducing decision fatigue this week',
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Tip = { text: string; colorKey: keyof ThemeColors };

const TIPS: Tip[] = [
  { text: 'Sleep when the baby sleeps where you can — even one longer stretch makes a difference.', colorKey: 'primary' },
  { text: 'A short, honest chat with someone you trust can ease a heavy day.', colorKey: 'accent' },
  { text: 'Ten minutes outside is linked with a real lift in mood and energy.', colorKey: 'secondary' },
  { text: 'A few slow breaths before a feed can take the edge off anxiety in the moment.', colorKey: 'success' },
  { text: 'Simple, regular meals matter more than "perfect" ones — accept the help if it\'s offered.', colorKey: 'warning' },
];
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [history, setHistory] = useState<ServerAssessment[]>([]);

  const load = useCallback(async () => {
    const user = await Storage.currentUser();
    setName(user.name.split(' ')[0] || 'there');
    const token = await Storage.getToken();
    if (token) {
      try {
        setHistory(await Api.getAssessments(token));
      } catch {
        // keep cached values
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const latest = history[0];
  const streak = computeStreak(history);
  const thisMonth = history.filter(r => {
    const d = new Date(r.timestamp);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todaysTip = TIPS[dayOfYear % TIPS.length];
  const todaysTipColor = colors[todaysTip.colorKey] as string;

  const topIncreasingFactor = latest?.top_factors.find(f => f.direction === 'increases');
  const insightTip = topIncreasingFactor ? FACTOR_TIPS[topIncreasingFactor.factor] : undefined;

  return (
    <ScreenContainer onRefresh={load}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hi, {name} 👋</Text>
          <Text style={styles.subGreeting}>How are you feeling today?</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <StreakIcon color={colors.warning} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
      </View>

      <HeroCard styles={styles} onPress={() => navigation.navigate('CheckIn')} />

      <MoodCard colors={colors} styles={styles} latest={latest} onView={() => navigation.navigate('History')} />

      {insightTip && topIncreasingFactor && (
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <InsightIcon color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightLabel}>Because {topIncreasingFactor.factor.toLowerCase()} came up last time</Text>
            <Text style={styles.insightBody}>{insightTip}</Text>
          </View>
        </View>
      )}

      <WeekStrip colors={colors} styles={styles} history={history} />

      <View style={styles.statsRow}>
        <StatTile styles={styles} value={String(thisMonth)} label="This month" />
        <StatTile styles={styles} value={String(history.length)} label="Total check-ins" />
      </View>

      {history.length > 1 && <TrendCard colors={colors} styles={styles} history={history} />}

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        <ActionTile styles={styles} label="Check-in" color={colors.primary} icon="heart" onPress={() => navigation.navigate('CheckIn')} />
        <ActionTile styles={styles} label="History" color={colors.accent} icon="chart" onPress={() => navigation.navigate('History')} />
        <ActionTile styles={styles} label="Resources" color={colors.secondary} icon="book" onPress={() => navigation.navigate('Resources')} />
      </View>

      <View style={[styles.tipCard, { backgroundColor: todaysTipColor + '1C', borderColor: todaysTipColor + '3E' }]}>
        <Text style={[styles.tipLabel, { color: todaysTipColor }]}>✨ Tip for today</Text>
        <Text style={styles.tipText}>{todaysTip.text}</Text>
      </View>

      <Pressable style={styles.resourceTeaser} onPress={() => navigation.navigate('Resources')}>
        <View style={[styles.resourceIcon]}>
          <BookIcon color={colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resourceTitle}>Explore self-care resources</Text>
          <Text style={styles.resourceSub}>Short, practical tips for the postpartum weeks.</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function StreakIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A6.5 6.5 0 0 1 5 15.5C5 9 9 6 12 2Z" fill={color} />
    </Svg>
  );
}

function InsightIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
      <Path d="M20 20l-4-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HeartIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20s-7-4.35-9.5-8.8C.9 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.5.9-1.4 2.3-2.5 4.3-2.5 3.4 0 4.8 3.5 3.2 6.7C19 15.65 12 20 12 20Z"
        fill={color}
      />
    </Svg>
  );
}

function ChartIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20V10M12 20V4M20 20v-7" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13Z" stroke={color} strokeWidth={1.8} />
      <Path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function HeroIllustration() {
  return (
    <Svg width={92} height={92} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.32} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.06} />
        </LinearGradient>
      </Defs>
      <Circle cx={50} cy={50} r={48} fill="url(#heroGlow)" />
      <Circle cx={40} cy={38} r={13} fill="#FFFFFF" fillOpacity={0.9} />
      <Path d="M22 78c0-13 8-21 18-21s18 8 18 21" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />
      <Circle cx={68} cy={54} r={8} fill="#FFFFFF" fillOpacity={0.85} />
      <Path d="M56 80c0-8 5.5-13.5 12-13.5S80 72 80 80" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={0.8} />
      <Path
        d="M50 28c.6 2.3-1.7 2.9-1.7 5.2a1.7 1.7 0 0 0 3.4 0c.6.6 1.1 1.4 1.1 2.6a3.7 3.7 0 0 1-7.4 0c0-3.7 2.3-5.4 4.6-7.8Z"
        fill="#FFE7A8"
      />
    </Svg>
  );
}

function HeroCard({ onPress, styles }: { onPress: () => void; styles: Styles }) {
  return (
    <View style={styles.heroCard}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.heroTitle}>Start today's wellbeing check-in</Text>
        <Text style={styles.heroSub}>9 quick questions, ~1 minute, with a clear explanation of your result.</Text>
        <Pressable style={styles.heroBtn} onPress={onPress}>
          <Text style={styles.heroBtnText}>Begin check-in →</Text>
        </Pressable>
      </View>
      <HeroIllustration />
    </View>
  );
}

function WeekStrip({ history, colors, styles }: { history: ServerAssessment[]; colors: ThemeColors; styles: Styles }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const entryFor = (day: Date) =>
    history.find(r => {
      const t = new Date(r.timestamp);
      return t.getFullYear() === day.getFullYear() && t.getMonth() === day.getMonth() && t.getDate() === day.getDate();
    });

  return (
    <View style={styles.weekStrip}>
      {days.map((day, i) => {
        const entry = entryFor(day);
        const isToday = day.toDateString() === today.toDateString();
        const color = entry ? bandColor(entry.risk_band, colors) : colors.border;
        return (
          <View key={i} style={{ alignItems: 'center' }}>
            <View
              style={[
                styles.weekDot,
                entry ? { backgroundColor: color + '2E' } : { borderWidth: 1.6, borderColor: color },
              ]}>
              {entry && <Text style={{ color, fontWeight: '800', fontSize: 13 }}>✓</Text>}
            </View>
            <Text style={[styles.weekLetter, isToday && styles.weekLetterActive]}>{DAY_LETTERS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MoodCard({ latest, onView, colors, styles }: { latest?: ServerAssessment; onView: () => void; colors: ThemeColors; styles: Styles }) {
  if (!latest) {
    return (
      <Card style={{ marginTop: 16 }}>
        <Text style={styles.emptyText}>No check-ins yet. Your first result will appear here.</Text>
      </Card>
    );
  }
  const color = bandColor(latest.risk_band, colors);
  const percent = Math.min(Math.max(latest.risk_probability, 0), 1);
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 76, height: 76 }}>
        <Svg width={76} height={76}>
          <Circle cx={38} cy={38} r={r} stroke={colors.border} strokeWidth={7.5} fill="none" />
          <Circle
            cx={38}
            cy={38}
            r={r}
            stroke={color}
            strokeWidth={7.5}
            fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - percent)}
            strokeLinecap="round"
            transform="rotate(-90 38 38)"
          />
        </Svg>
        <View style={styles.moodPercentWrap}>
          <Text style={[styles.moodPercent, { color }]}>{Math.round(percent * 100)}</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginLeft: 18 }}>
        <Text style={[styles.moodBand, { color }]}>Last result: {politeBand(latest.risk_band)}</Text>
        <Text style={styles.moodDate}>{formatRelative(latest.timestamp)}</Text>
      </View>
      <Pressable onPress={onView}>
        <Text style={styles.viewLink}>View</Text>
      </Pressable>
    </Card>
  );
}

function StatTile({ value, label, styles }: { value: string; label: string; styles: Styles }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TrendCard({ history, colors, styles }: { history: ServerAssessment[]; colors: ThemeColors; styles: Styles }) {
  const recent = [...history].reverse().slice(-7);
  const w = 300;
  const h = 96;
  const pad = 8;
  const points = recent.map((r, i) => ({
    x: pad + (i / Math.max(recent.length - 1, 1)) * (w - pad * 2),
    y: h - pad - r.risk_probability * (h - pad * 2),
    r,
  }));
  return (
    <Card style={{ marginTop: 20 }}>
      <View style={styles.trendHeader}>
        <Text style={styles.sectionTitleInline}>Recent trend</Text>
        <Text style={styles.trendCount}>Last {recent.length}</Text>
      </View>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: 12 }}>
        <Path
          d={points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')}
          stroke={colors.primary}
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={bandColor(p.r.risk_band, colors)} />
        ))}
      </Svg>
    </Card>
  );
}

function ActionTile({
  label,
  color,
  icon,
  onPress,
  styles,
}: {
  label: string;
  color: string;
  icon: 'heart' | 'chart' | 'book';
  onPress: () => void;
  styles: Styles;
}) {
  return (
    <Pressable style={styles.actionTile} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '26' }]}>
        {icon === 'heart' && <HeartIcon color={color} />}
        {icon === 'chart' && <ChartIcon color={color} />}
        {icon === 'book' && <BookIcon color={color} />}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

type Styles = ReturnType<typeof makeStyles>;

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
    greeting: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
    subGreeting: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
    sub: { fontSize: 12.5, color: colors.textSecondary },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning + '26',
      borderRadius: Radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 5,
    },
    streakText: { color: colors.warning, fontWeight: '800', fontSize: 15 },
    weekStrip: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      paddingVertical: 16,
      marginTop: 18,
    },
    weekDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    weekLetter: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 7 },
    weekLetterActive: { fontWeight: '800', color: colors.textPrimary },
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: Radius.xl,
      padding: 22,
      marginTop: 20,
    },
    heroTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
    heroSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13.5, marginTop: 9, lineHeight: 19 },
    heroBtn: { backgroundColor: colors.white, borderRadius: Radius.md, alignSelf: 'flex-start', paddingVertical: 13, paddingHorizontal: 20, marginTop: 16 },
    heroBtnText: { color: colors.primaryDark, fontWeight: '800', fontSize: 15 },
    emptyText: { fontSize: 14.5, color: colors.textSecondary },
    moodPercentWrap: { position: 'absolute', width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
    moodPercent: { fontSize: 17, fontWeight: '800' },
    moodBand: { fontSize: 16.5, fontWeight: '800' },
    moodDate: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    viewLink: { color: colors.primary, fontWeight: '700', fontSize: 14.5 },
    statsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
    statTile: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      padding: 16,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
    trendHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    sectionTitleInline: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    trendCount: { fontSize: 13, color: colors.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 26, marginBottom: 14 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13 },
    actionTile: {
      width: '47%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      paddingVertical: 18,
      paddingHorizontal: 15,
      gap: 12,
    },
    actionIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    tipCard: { borderRadius: Radius.lg, borderWidth: 1, padding: 18, marginTop: 26 },
    tipLabel: { fontSize: 14.5, fontWeight: '800', marginBottom: 6 },
    tipText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20.5 },
    resourceTeaser: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      padding: 17,
      marginTop: 16,
      gap: 14,
    },
    resourceIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.secondary + '24', alignItems: 'center', justifyContent: 'center' },
    resourceTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
    resourceSub: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
    chevron: { fontSize: 24, color: colors.textSecondary },
    insightCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.accent + '16',
      borderWidth: 1,
      borderColor: colors.accent + '35',
      borderRadius: Radius.lg,
      padding: 16,
      marginTop: 18,
    },
    insightIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accent + '28', alignItems: 'center', justifyContent: 'center' },
    insightLabel: { fontSize: 11, fontWeight: '800', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.4 },
    insightBody: { fontSize: 13, color: colors.textPrimary, marginTop: 4, lineHeight: 18 },
  });
}
