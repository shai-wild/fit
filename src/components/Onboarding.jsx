import { useState } from 'react';
import { saveProfile } from '../utils/storage';

const STEPS = ['welcome', 'goal', 'fitness', 'duration', 'ready'];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    goal: '',
    currentWeight: '',
    targetWeight: '',
    fitnessLevel: '',
    pushupCapacity: '',
    squatCapacity: '',
    plankCapacity: '',
    preferredDuration: 15,
    createdAt: new Date().toISOString(),
  });

  const currentStep = STEPS[step];

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    saveProfile(profile);
    onComplete(profile);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return profile.name.trim().length > 0;
      case 'goal': return !!profile.goal;
      case 'fitness': return !!profile.fitnessLevel;
      case 'duration': return profile.preferredDuration >= 7 && profile.preferredDuration <= 45;
      default: return true;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -200,
        right: -200,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.1), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Progress indicator */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4,
              borderRadius: 2,
              background: i <= step ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'right' }}>
          {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 24px',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.4s ease-out',
        key: step,
      }}>
        {currentStep === 'welcome' && (
          <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16, textAlign: 'center' }}>💪</div>
            <h1 style={{
              fontSize: 36, fontWeight: 900,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Welcome to FitFlow
            </h1>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
              Your personal calisthenics coach with 3D guided workouts. No equipment needed — just you and your determination.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
                What's your name?
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => updateProfile('name', e.target.value)}
                placeholder="Enter your name"
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: 18, fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        )}

        {currentStep === 'goal' && (
          <div className="animate-in" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
              What's your goal?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
              We'll customize your workouts based on this
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'lose_weight', icon: '🔥', title: 'Lose Weight', desc: 'Burn fat with high-intensity bodyweight circuits' },
                { id: 'build_muscle', icon: '💪', title: 'Build Muscle', desc: 'Strength-focused calisthenics progressions' },
                { id: 'get_fit', icon: '⚡', title: 'Get Fit', desc: 'Balanced workouts for overall fitness' },
                { id: 'stay_active', icon: '🧘', title: 'Stay Active', desc: 'Maintain fitness with moderate daily movement' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => updateProfile('goal', g.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px',
                    background: profile.goal === g.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                    border: `2px solid ${profile.goal === g.id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.3s ease',
                    color: 'var(--text-primary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{g.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{g.desc}</div>
                  </div>
                  {profile.goal === g.id && (
                    <span style={{ marginLeft: 'auto', color: 'var(--primary-light)', fontSize: 20 }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            {(profile.goal === 'lose_weight' || profile.goal === 'build_muscle') && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Current weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.currentWeight}
                    onChange={e => updateProfile('currentWeight', e.target.value)}
                    placeholder="75"
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: 16, fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Target weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.targetWeight}
                    onChange={e => updateProfile('targetWeight', e.target.value)}
                    placeholder="68"
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: 16, fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'fitness' && (
          <div className="animate-in" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Your Fitness Level
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
              Be honest — this helps us create the perfect plan for you
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {[
                { id: 'beginner', icon: '🌱', title: 'Beginner', desc: 'New to exercise or getting back into it' },
                { id: 'intermediate', icon: '🌿', title: 'Intermediate', desc: 'Exercise regularly, comfortable with basics' },
                { id: 'advanced', icon: '🌳', title: 'Advanced', desc: 'Very active, looking for challenging workouts' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => updateProfile('fitnessLevel', l.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px',
                    background: profile.fitnessLevel === l.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                    border: `2px solid ${profile.fitnessLevel === l.id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.3s ease',
                    color: 'var(--text-primary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{l.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{l.desc}</div>
                  </div>
                  {profile.fitnessLevel === l.id && (
                    <span style={{ marginLeft: 'auto', color: 'var(--primary-light)', fontSize: 20 }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
              padding: 20, border: '1px solid var(--border)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                Quick Fitness Check (optional)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Max push-ups in a row
                  </label>
                  <input
                    type="number"
                    value={profile.pushupCapacity}
                    onChange={e => updateProfile('pushupCapacity', e.target.value)}
                    placeholder="e.g. 10"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Max squats in a row
                  </label>
                  <input
                    type="number"
                    value={profile.squatCapacity}
                    onChange={e => updateProfile('squatCapacity', e.target.value)}
                    placeholder="e.g. 20"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Max plank hold (seconds)
                  </label>
                  <input
                    type="number"
                    value={profile.plankCapacity}
                    onChange={e => updateProfile('plankCapacity', e.target.value)}
                    placeholder="e.g. 30"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'duration' && (
          <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
              Workout Duration
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40, textAlign: 'center', fontSize: 15 }}>
              How many minutes can you dedicate daily?
            </p>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                fontSize: 72, fontWeight: 900,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}>
                {profile.preferredDuration}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 4 }}>minutes</div>
            </div>

            <div style={{ padding: '0 10px' }}>
              <input
                type="range"
                min={7}
                max={45}
                value={profile.preferredDuration}
                onChange={e => updateProfile('preferredDuration', parseInt(e.target.value))}
                style={{
                  width: '100%', height: 8,
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: `linear-gradient(to right, #6366F1 ${((profile.preferredDuration - 7) / 38) * 100}%, var(--bg-tertiary) ${((profile.preferredDuration - 7) / 38) * 100}%)`,
                  borderRadius: 4,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                <span>7 min</span>
                <span>45 min</span>
              </div>
            </div>

            <div style={{
              marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
            }}>
              {[10, 15, 20, 25, 30, 45].map(d => (
                <button
                  key={d}
                  onClick={() => updateProfile('preferredDuration', d)}
                  style={{
                    padding: '12px',
                    background: profile.preferredDuration === d ? 'rgba(99,102,241,0.2)' : 'var(--bg-secondary)',
                    border: `1px solid ${profile.preferredDuration === d ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: profile.preferredDuration === d ? 'var(--primary-light)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 15,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'ready' && (
          <div className="animate-in" style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{ fontSize: 80, marginBottom: 20, animation: 'bounce 1s ease infinite' }}>🚀</div>
            <h2 style={{
              fontSize: 32, fontWeight: 900, marginBottom: 12,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              You're All Set, {profile.name}!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 16, maxWidth: 340 }}>
              Your personalized {profile.preferredDuration}-minute
              {' '}{profile.fitnessLevel} plan is ready.
              {profile.goal === 'lose_weight' && ' Time to burn some calories!'}
              {profile.goal === 'build_muscle' && ' Let\'s build that strength!'}
              {profile.goal === 'get_fit' && ' Let\'s get you in shape!'}
              {profile.goal === 'stay_active' && ' Let\'s keep you moving!'}
            </p>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
              padding: 20, width: '100%', maxWidth: 320,
              border: '1px solid var(--border)', marginBottom: 32,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-light)' }}>
                    {profile.preferredDuration}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>min/day</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>
                    {profile.fitnessLevel === 'beginner' ? '🌱' : profile.fitnessLevel === 'intermediate' ? '🌿' : '🌳'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {profile.fitnessLevel}
                  </div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
                    {profile.goal === 'lose_weight' ? '🔥' : profile.goal === 'build_muscle' ? '💪' : '⚡'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {profile.goal.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 24,
          paddingBottom: 20,
        }}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={prev} style={{ flex: step === STEPS.length - 1 ? 0 : 1 }}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={!canProceed()}
              style={{ flex: 1 }}
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={finish}
              style={{ flex: 1 }}
            >
              Let's Go! 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
