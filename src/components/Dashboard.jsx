import { useState, useEffect, useMemo } from 'react';
import { getStats, getTodayWorkout, getStreak, getWorkoutsForMonth } from '../utils/storage';
import { generateWorkout, getWeekNumber } from '../utils/workoutGenerator';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const workouts = getWorkoutsForMonth(year, month);
  const workoutDays = new Set(workouts.map(w => new Date(w.completedAt).getDate()));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{MONTH_NAMES[month]} {year}</h3>
        <span className="tag tag-primary">{workouts.length} workouts</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {DAYS.map(d => (
          <div key={d} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 0', fontWeight: 600 }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: day === today ? 700 : 400,
            borderRadius: 'var(--radius-sm)',
            background: day && workoutDays.has(day)
              ? 'rgba(16, 185, 129, 0.25)'
              : day === today
                ? 'rgba(99, 102, 241, 0.15)'
                : 'transparent',
            color: day
              ? workoutDays.has(day)
                ? 'var(--success)'
                : day === today
                  ? 'var(--primary-light)'
                  : 'var(--text-secondary)'
              : 'transparent',
            border: day === today ? '1px solid var(--primary)' : '1px solid transparent',
            position: 'relative',
          }}>
            {day || ''}
            {day && workoutDays.has(day) && (
              <div style={{
                position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: '50%', background: 'var(--success)',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ profile, onStartWorkout }) {
  const [todayDone, setTodayDone] = useState(false);
  const stats = useMemo(() => getStats(), []);
  const streak = useMemo(() => getStreak(), []);

  useEffect(() => {
    setTodayDone(!!getTodayWorkout());
  }, []);

  const handleStart = () => {
    const weekNum = getWeekNumber(profile);
    const workout = generateWorkout({
      ...profile,
      weekNumber: weekNum,
    });
    onStartWorkout(workout);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24, animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 4 }}>
          {greeting()},
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 900,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 0,
        }}>
          {profile.name} 👋
        </h1>
      </div>

      {/* Streak Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.3)',
        marginBottom: 16,
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 60, height: 60,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            🔥
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 }}>
              Current Streak
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>
                {streak.current}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                {streak.current === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
              {streak.best}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 16,
        animation: 'fadeInUp 0.5s ease-out 0.1s both',
      }}>
        {[
          { label: 'Workouts', value: stats.totalWorkouts, icon: '🏋️', color: 'var(--primary-light)' },
          { label: 'Minutes', value: stats.totalMinutes, icon: '⏱️', color: 'var(--success)' },
          { label: 'Exercises', value: stats.totalExercises, icon: '💪', color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Workout CTA */}
      <div className="card" style={{
        marginBottom: 16,
        background: todayDone
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))'
          : 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(99,102,241,0.12))',
        border: todayDone
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(99,102,241,0.2)',
        animation: 'fadeInUp 0.5s ease-out 0.15s both',
      }}>
        {todayDone ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', marginBottom: 4 }}>
              Today's Workout Done!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Great job! Rest up and come back tomorrow.
            </p>
            <button
              className="btn btn-secondary"
              onClick={handleStart}
              style={{ marginTop: 16 }}
            >
              Do Another Workout
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8, animation: 'pulse 2s ease infinite' }}>⚡</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Ready for Today's Workout?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              {profile.preferredDuration} min · {profile.fitnessLevel} · {profile.goal.replace('_', ' ')}
            </p>
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleStart}
              style={{ animation: 'glow 2s ease infinite' }}
            >
              Start Workout 🚀
            </button>
          </div>
        )}
      </div>

      {/* Calendar */}
      <MiniCalendar />

      {/* Weekly Tip */}
      <div className="card" style={{
        marginTop: 16,
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))',
        border: '1px solid rgba(245,158,11,0.2)',
        animation: 'fadeInUp 0.5s ease-out 0.3s both',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Daily Tip</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {[
                "Consistency beats intensity. A short daily workout is better than an occasional long one.",
                "Stay hydrated! Drink at least 8 glasses of water daily for optimal performance.",
                "Rest days are growth days. Your muscles repair and grow stronger during rest.",
                "Focus on form over speed. Quality reps prevent injury and build better results.",
                "Warm up properly to prevent injuries and improve your workout performance.",
                "Track your progress weekly. Small improvements add up to massive results.",
                "Sleep 7-9 hours for optimal muscle recovery and fat loss.",
              ][new Date().getDay()]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
