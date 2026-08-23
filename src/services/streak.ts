import { ServerAssessment } from './api';

/** Consecutive-day check-in streak, counting back from today. */
export function computeStreak(history: ServerAssessment[]): number {
  if (history.length === 0) return 0;

  const dayKey = (iso: string) => iso.slice(0, 10);
  const uniqueDays = Array.from(new Set(history.map(r => dayKey(r.timestamp)))).sort(
    (a, b) => (a < b ? 1 : -1),
  );

  const today = new Date();
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = toKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toKey(yesterday);

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const cur = new Date(uniqueDays[i]);
    const next = new Date(uniqueDays[i + 1]);
    const diffDays = Math.round((cur.getTime() - next.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
