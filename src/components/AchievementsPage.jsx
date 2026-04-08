import { useMemo } from 'react';
import { getAchievements, getStats } from '../utils/storage';

const ALL_ACHIEVEMENTS = [
  { id: 'first_workout', name: 'First Step', desc: 'Complete your first workout', icon: '🎯', requirement: '1 workout' },
  { id: 'five_workouts', name: 'Getting Started', desc: 'Complete 5 workouts', icon: '⭐', requirement: '5 workouts' },
  { id: 'ten_workouts', name: 'Dedicated', desc: 'Complete 10 workouts', icon: '💪', requirement: '10 workouts' },
  { id: 'twenty_five', name: 'Committed', desc: 'Complete 25 workouts', icon: '🔥', requirement: '25 workouts' },
  { id: 'fifty_workouts', name: 'Beast Mode', desc: 'Complete 50 workouts', icon: '🏆', requirement: '50 workouts' },
  { id: 'hundred_workouts', name: 'Legend', desc: 'Complete 100 workouts', icon: '👑', requirement: '100 workouts' },
  { id: 'streak_3', name: 'Hat Trick', desc: '3 day streak', icon: '🎩', requirement: '3 day streak' },
  { id: 'streak_7', name: 'Week Warrior', desc: '7 day streak', icon: '⚡', requirement: '7 day streak' },
  { id: 'streak_14', name: 'Unstoppable', desc: '14 day streak', icon: '🌟', requirement: '14 day streak' },
  { id: 'streak_30', name: 'Iron Will', desc: '30 day streak', icon: '💎', requirement: '30 day streak' },
];

export default function AchievementsPage() {
  const earned = useMemo(() => {
    const achievements = getAchievements();
    return new Set(achievements.map(a => a.id));
  }, []);

  const stats = useMemo(() => getStats(), []);
  const earnedCount = earned.size;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Achievements</h1>
        <p className="page-subtitle">{earnedCount} of {ALL_ACHIEVEMENTS.length} unlocked</p>
      </div>

      {/* Progress */}
      <div className="card" style={{
        marginBottom: 20,
        animation: 'fadeInUp 0.5s ease-out',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(236,72,153,0.06))',
        border: '1px solid rgba(245,158,11,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            🏅
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              {earnedCount} / {ALL_ACHIEVEMENTS.length} Badges
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${(earnedCount / ALL_ACHIEVEMENTS.length) * 100}%`,
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ALL_ACHIEVEMENTS.map((a, i) => {
          const isEarned = earned.has(a.id);
          return (
            <div
              key={a.id}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px',
                opacity: isEarned ? 1 : 0.5,
                background: isEarned
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.06))'
                  : 'var(--bg-card)',
                border: isEarned ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
              }}
            >
              <div style={{
                width: 50, height: 50,
                borderRadius: 'var(--radius-md)',
                background: isEarned ? 'rgba(245,158,11,0.15)' : 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
                filter: isEarned ? 'none' : 'grayscale(1)',
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700, fontSize: 15,
                  color: isEarned ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.desc}
                </div>
              </div>
              {isEarned ? (
                <span style={{ color: 'var(--success)', fontSize: 18, fontWeight: 700 }}>✓</span>
              ) : (
                <span className="tag" style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                }}>
                  {a.requirement}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
