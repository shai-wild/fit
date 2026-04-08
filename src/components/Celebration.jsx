import { useState, useEffect, useMemo } from 'react';
import { getAchievements, getStreak } from '../utils/storage';

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'][
        Math.floor(Math.random() * 6)
      ],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  , []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Celebration({ totalTime, exercisesCompleted, onFinish }) {
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const streak = useMemo(() => getStreak(), []);
  const achievements = useMemo(() => getAchievements(), []);

  // Find newly earned achievements (within last minute)
  const newAchievements = useMemo(() => {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    return achievements.filter(a => a.earnedAt > oneMinuteAgo);
  }, [achievements]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 800);
    const t2 = setTimeout(() => setShowAchievements(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const minutes = Math.round(totalTime / 60);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Confetti />

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 400, width: '100%' }}>
        {/* Trophy */}
        <div style={{
          fontSize: 80,
          animation: 'bounce 1s ease infinite',
          marginBottom: 16,
        }}>
          🏆
        </div>

        <h1 style={{
          fontSize: 36, fontWeight: 900,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
          animation: 'scaleIn 0.5s ease-out',
        }}>
          WORKOUT COMPLETE!
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 16, marginBottom: 32,
          animation: 'fadeIn 0.5s ease-out 0.3s both',
        }}>
          You crushed it! Amazing effort! 💪
        </p>

        {/* Stats */}
        {showStats && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, marginBottom: 24,
            animation: 'fadeInUp 0.5s ease-out',
          }}>
            <div className="card" style={{
              padding: 16, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary-light)' }}>
                {minutes}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>MINUTES</div>
            </div>
            <div className="card" style={{
              padding: 16, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>
                {exercisesCompleted}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EXERCISES</div>
            </div>
            <div className="card" style={{
              padding: 16, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>
                {streak.current}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>STREAK</div>
            </div>
          </div>
        )}

        {/* New achievements */}
        {showAchievements && newAchievements.length > 0 && (
          <div style={{ marginBottom: 24, animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: 'var(--accent)',
              marginBottom: 12, letterSpacing: 1,
            }}>
              🎉 NEW ACHIEVEMENT{newAchievements.length > 1 ? 'S' : ''}!
            </div>
            {newAchievements.map(a => (
              <div key={a.id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', marginBottom: 8,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(236,72,153,0.08))',
                border: '1px solid rgba(245,158,11,0.3)',
                animation: 'scaleIn 0.5s ease-out',
              }}>
                <span style={{ fontSize: 32 }}>{a.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Done button */}
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={onFinish}
          style={{ animation: 'fadeIn 0.5s ease-out 1.5s both' }}
        >
          Done 🎯
        </button>
      </div>
    </div>
  );
}
