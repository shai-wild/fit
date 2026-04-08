import { useState, useMemo } from 'react';
import { getWorkoutHistory, getWorkoutsForMonth } from '../utils/storage';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function History() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const history = useMemo(() => getWorkoutHistory(), []);
  const monthWorkouts = useMemo(
    () => getWorkoutsForMonth(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const workoutDays = new Set(monthWorkouts.map(w => new Date(w.completedAt).getDate()));
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isToday = (day) => {
    return day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
  };

  const totalMins = monthWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
  const totalExercises = monthWorkouts.reduce((s, w) => s + (w.exercisesCompleted || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Workout History</h1>
        <p className="page-subtitle">Track your consistency</p>
      </div>

      {/* Month navigation */}
      <div className="card" style={{ marginBottom: 16, animation: 'fadeInUp 0.5s ease-out' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <button onClick={prevMonth} style={{
            background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-primary)',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ‹
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              {monthWorkouts.length} workout{monthWorkouts.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={nextMonth} style={{
            background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-primary)',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ›
          </button>
        </div>

        {/* Calendar grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4, textAlign: 'center',
        }}>
          {DAYS.map(d => (
            <div key={d} style={{
              fontSize: 11, color: 'var(--text-muted)', padding: '4px 0',
              fontWeight: 600,
            }}>
              {d}
            </div>
          ))}
          {cells.map((day, i) => (
            <div key={i} style={{
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: isToday(day) ? 700 : 400,
              borderRadius: 'var(--radius-sm)',
              background: day && workoutDays.has(day)
                ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))'
                : isToday(day) ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: day
                ? workoutDays.has(day) ? 'var(--success)'
                  : isToday(day) ? 'var(--primary-light)'
                    : 'var(--text-secondary)'
                : 'transparent',
              border: isToday(day) ? '1.5px solid var(--primary)' : '1.5px solid transparent',
              cursor: day ? 'default' : 'auto',
            }}>
              {day && workoutDays.has(day) ? '✓' : day || ''}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 16,
        animation: 'fadeInUp 0.5s ease-out 0.1s both',
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-light)' }}>
            {monthWorkouts.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Workouts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>
            {totalMins}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Minutes</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
            {totalExercises}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Exercises</div>
        </div>
      </div>

      {/* Recent workouts list */}
      <div style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Workouts</h3>
        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              No workouts yet. Start your first one today!
            </div>
          </div>
        ) : (
          [...history].reverse().slice(0, 20).map((w, i) => {
            const date = new Date(w.completedAt);
            return (
              <div key={i} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                marginBottom: 8, padding: '14px 16px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {w.duration || 0} min · {w.exercisesCompleted || 0} exercises
                  </div>
                </div>
                <span className="tag tag-success" style={{ fontSize: 11 }}>
                  {w.goal?.replace('_', ' ') || 'workout'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
