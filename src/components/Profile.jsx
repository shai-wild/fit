import { useState } from 'react';
import { saveProfile, getStats, getStreak } from '../utils/storage';

export default function Profile({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const stats = getStats();
  const streak = getStreak();

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const save = () => {
    saveProfile(form);
    onUpdate(form);
    setEditing(false);
  };

  const resetData = () => {
    if (confirm('This will clear all your workout data. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const goalLabels = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    get_fit: 'Get Fit',
    stay_active: 'Stay Active',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your fitness journey</p>
      </div>

      {/* Profile card */}
      <div className="card" style={{
        textAlign: 'center', padding: 28, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 12px',
          boxShadow: '0 0 24px rgba(99,102,241,0.3)',
        }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{profile.name}</h2>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {goalLabels[profile.goal] || profile.goal} · {profile.fitnessLevel} · {profile.preferredDuration} min
        </div>

        {/* Join date */}
        <div style={{
          marginTop: 16, padding: '10px 16px',
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--text-muted)',
        }}>
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
            month: 'long', year: 'numeric',
          })}
        </div>
      </div>

      {/* Stats overview */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10, marginBottom: 16,
        animation: 'fadeInUp 0.5s ease-out 0.1s both',
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary-light)' }}>
            {stats.totalWorkouts}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Workouts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--success)' }}>
            {stats.totalMinutes}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Minutes</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--accent)' }}>
            {streak.best}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best Streak</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--secondary)' }}>
            {stats.totalExercises}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Exercises</div>
        </div>
      </div>

      {/* Settings */}
      <div style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Settings</h3>

        {!editing ? (
          <div className="card" style={{ padding: 0 }}>
            {[
              { label: 'Name', value: profile.name },
              { label: 'Goal', value: goalLabels[profile.goal] || profile.goal },
              { label: 'Fitness Level', value: profile.fitnessLevel },
              { label: 'Duration', value: `${profile.preferredDuration} minutes` },
              { label: 'Current Weight', value: profile.currentWeight ? `${profile.currentWeight} kg` : 'Not set' },
              { label: 'Target Weight', value: profile.targetWeight ? `${profile.targetWeight} kg` : 'Not set' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-full" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Name
                </label>
                <input
                  type="text" value={form.name}
                  onChange={e => update('name', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Goal
                </label>
                <select
                  value={form.goal}
                  onChange={e => update('goal', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                >
                  <option value="lose_weight">Lose Weight</option>
                  <option value="build_muscle">Build Muscle</option>
                  <option value="get_fit">Get Fit</option>
                  <option value="stay_active">Stay Active</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Fitness Level
                </label>
                <select
                  value={form.fitnessLevel}
                  onChange={e => update('fitnessLevel', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Duration: {form.preferredDuration} minutes
                </label>
                <input
                  type="range" min={7} max={45}
                  value={form.preferredDuration}
                  onChange={e => update('preferredDuration', parseInt(e.target.value))}
                  style={{
                    width: '100%', height: 6,
                    WebkitAppearance: 'none', appearance: 'none',
                    background: `linear-gradient(to right, #6366F1 ${((form.preferredDuration - 7) / 38) * 100}%, var(--bg-tertiary) ${((form.preferredDuration - 7) / 38) * 100}%)`,
                    borderRadius: 3, outline: 'none', cursor: 'pointer',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Current Weight (kg)
                  </label>
                  <input
                    type="number" value={form.currentWeight || ''}
                    onChange={e => update('currentWeight', e.target.value)}
                    placeholder="75"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Target Weight (kg)
                  </label>
                  <input
                    type="number" value={form.targetWeight || ''}
                    onChange={e => update('targetWeight', e.target.value)}
                    placeholder="68"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={save} style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 24, animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
        <button
          className="btn btn-secondary btn-full"
          onClick={resetData}
          style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
