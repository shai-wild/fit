import { useState, useEffect, useRef, useCallback } from 'react';
import ExerciseModel from './ExerciseModel';
import { saveWorkout } from '../utils/storage';
import { MOTIVATIONAL_QUOTES } from '../data/exercises';
import Celebration from './Celebration';

const PHASE = {
  COUNTDOWN: 'countdown',
  WARMUP: 'warmup',
  EXERCISE: 'exercise',
  REST: 'rest',
  TRANSITION: 'transition',
  COOLDOWN: 'cooldown',
  COMPLETE: 'complete',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CircularTimer({ current, total, size = 160, color = '#6366F1' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (current / total) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
          {current}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          {total > 0 ? `/ ${total}` : 'sec'}
        </span>
      </div>
    </div>
  );
}

export default function WorkoutSession({ workout, profile, onFinish, onQuit }) {
  const [phase, setPhase] = useState(PHASE.COUNTDOWN);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timer, setTimer] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const intervalRef = useRef(null);
  const totalTimerRef = useRef(null);
  const allExercises = [...workout.warmup, ...workout.exercises, ...workout.cooldown];
  const currentExercise = allExercises[currentExerciseIndex];

  const totalExercisesCount = allExercises.length;
  const overallProgress = ((currentExerciseIndex + (currentSet - 1) / (currentExercise?.sets || 1)) / totalExercisesCount) * 100;

  const isWarmup = currentExercise?.isWarmup;
  const isCooldown = currentExercise?.isCooldown;

  const getPhaseLabel = () => {
    if (isWarmup) return 'WARM UP';
    if (isCooldown) return 'COOL DOWN';
    return `EXERCISE ${currentExerciseIndex - workout.warmup.length + 1} / ${workout.exercises.length}`;
  };

  const triggerMotivation = useCallback(() => {
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setMotivationText(quote);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 2500);
  }, []);

  // Total time counter
  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN && phase !== PHASE.COMPLETE && !isPaused) {
      totalTimerRef.current = setInterval(() => {
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(totalTimerRef.current);
  }, [phase, isPaused]);

  // Countdown
  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN) return;
    if (countdownValue <= 0) {
      setPhase(PHASE.EXERCISE);
      if (currentExercise?.type === 'time') {
        setTimer(currentExercise.holdTime || 30);
      }
      return;
    }
    const timeout = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, countdownValue]);

  // Timer for timed exercises
  useEffect(() => {
    if (phase !== PHASE.EXERCISE || isPaused || currentExercise?.type !== 'time') return;
    if (timer <= 0) {
      handleSetComplete();
      return;
    }
    intervalRef.current = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(intervalRef.current);
  }, [phase, timer, isPaused, currentExercise]);

  // Rest timer
  useEffect(() => {
    if (phase !== PHASE.REST || isPaused) return;
    if (restTimer <= 0) {
      goToNextSetOrExercise();
      return;
    }
    const timeout = setTimeout(() => setRestTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, restTimer, isPaused]);

  // Transition timer
  useEffect(() => {
    if (phase !== PHASE.TRANSITION || isPaused) return;
    if (restTimer <= 0) {
      setPhase(PHASE.EXERCISE);
      setCurrentSet(1);
      setRepsCompleted(0);
      if (currentExercise?.type === 'time') {
        setTimer(currentExercise.holdTime || 30);
      }
      return;
    }
    const timeout = setTimeout(() => setRestTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, restTimer, isPaused, currentExercise]);

  const handleSetComplete = useCallback(() => {
    if (currentSet < (currentExercise?.sets || 1)) {
      // Rest between sets
      setCurrentSet(prev => prev + 1);
      setRepsCompleted(0);
      if (currentExercise?.type === 'time') {
        setTimer(currentExercise.holdTime || 30);
      }
      setRestTimer(15);
      setPhase(PHASE.REST);
      if (Math.random() > 0.5) triggerMotivation();
    } else {
      // Exercise complete
      setExercisesCompleted(prev => prev + 1);

      if (currentExerciseIndex < allExercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setRestTimer(10);
        setPhase(PHASE.TRANSITION);
        triggerMotivation();
      } else {
        completeWorkout();
      }
    }
  }, [currentSet, currentExercise, currentExerciseIndex, allExercises.length]);

  const handleRepTap = useCallback(() => {
    if (phase !== PHASE.EXERCISE || currentExercise?.type !== 'reps') return;

    const newReps = repsCompleted + 1;
    setRepsCompleted(newReps);

    if (newReps >= (currentExercise?.reps || 10)) {
      handleSetComplete();
    }
  }, [phase, repsCompleted, currentExercise, handleSetComplete]);

  const goToNextSetOrExercise = useCallback(() => {
    setPhase(PHASE.EXERCISE);
    setRepsCompleted(0);
    if (currentExercise?.type === 'time') {
      setTimer(currentExercise.holdTime || 30);
    }
  }, [currentExercise]);

  const completeWorkout = () => {
    const workoutData = {
      id: workout.id,
      duration: Math.round(totalTimeElapsed / 60),
      exercisesCompleted,
      goal: workout.goal,
      fitnessLevel: workout.fitnessLevel,
    };
    saveWorkout(workoutData);
    setShowCelebration(true);
    setPhase(PHASE.COMPLETE);
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setRepsCompleted(0);
      setRestTimer(5);
      setPhase(PHASE.TRANSITION);
    } else {
      completeWorkout();
    }
  };

  if (showCelebration) {
    return (
      <Celebration
        totalTime={totalTimeElapsed}
        exercisesCompleted={exercisesCompleted}
        onFinish={onFinish}
      />
    );
  }

  if (phase === PHASE.COUNTDOWN) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 20, fontWeight: 600 }}>
          GET READY
        </div>
        <div style={{
          fontSize: 120, fontWeight: 900,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'countUp 0.5s ease-out',
          key: countdownValue,
        }}>
          {countdownValue || 'GO!'}
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: 20, fontSize: 14 }}>
          First up: {allExercises[0]?.name}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-primary)', overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Motivation popup */}
      {showMotivation && (
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(99,102,241,0.95)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-xl)',
          animation: 'slideDown 0.3s ease-out',
          maxWidth: '80%', textAlign: 'center',
          fontSize: 15, fontWeight: 700,
          boxShadow: '0 0 30px rgba(99,102,241,0.5)',
        }}>
          {motivationText}
        </div>
      )}

      {/* Quit confirmation */}
      {showQuitConfirm && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)',
        }}>
          <div className="card" style={{
            maxWidth: 320, textAlign: 'center', padding: 28,
            animation: 'scaleIn 0.3s ease-out',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😤</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Quit Workout?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              You've done {exercisesCompleted} exercises. Don't give up now!
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => setShowQuitConfirm(false)}>
                Keep Going
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }}
                onClick={onQuit}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(15,23,42,0.95)',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setShowQuitConfirm(true)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', padding: '8px',
          }}
        >
          ✕ Quit
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1 }}>
            {getPhaseLabel()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {formatTime(totalTimeElapsed)}
          </div>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            background: 'none', border: 'none',
            color: isPaused ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 20, cursor: 'pointer', padding: '8px',
          }}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Overall progress */}
      <div style={{ padding: '0 16px', marginTop: 8 }}>
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Rest / Transition screen overlay */}
      {(phase === PHASE.REST || phase === PHASE.TRANSITION) && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text-muted)',
            letterSpacing: 2, marginBottom: 16,
          }}>
            {phase === PHASE.REST ? 'REST' : 'NEXT UP'}
          </div>

          <CircularTimer
            current={restTimer}
            total={phase === PHASE.REST ? 15 : 10}
            size={180}
            color={phase === PHASE.REST ? '#10B981' : '#F59E0B'}
          />

          {phase === PHASE.TRANSITION && currentExercise && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                {currentExercise.name}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {currentExercise.description}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
                {currentExercise.type === 'reps' && (
                  <span className="tag tag-primary">{currentExercise.reps} reps × {currentExercise.sets} sets</span>
                )}
                {currentExercise.type === 'time' && (
                  <span className="tag tag-primary">{currentExercise.holdTime}s × {currentExercise.sets} sets</span>
                )}
              </div>
            </div>
          )}

          {phase === PHASE.REST && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Set {currentSet} of {currentExercise?.sets}
              </div>
              <button
                className="btn btn-secondary"
                onClick={goToNextSetOrExercise}
                style={{ marginTop: 16 }}
              >
                Skip Rest →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Exercise screen */}
      {phase === PHASE.EXERCISE && currentExercise && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* 3D Model */}
          <ExerciseModel
            animation={currentExercise.animation || 'idle'}
            style={{
              margin: '8px 16px',
              height: 240,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          />

          {/* Exercise info */}
          <div style={{ padding: '12px 20px', textAlign: 'center', flex: 1 }}>
            <div style={{
              fontSize: 24, fontWeight: 800, marginBottom: 4,
              color: 'var(--text-primary)',
            }}>
              {currentExercise.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {currentExercise.description}
            </div>

            {/* Set indicator */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16,
            }}>
              {Array.from({ length: currentExercise.sets || 1 }).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < currentSet
                    ? 'var(--primary-light)'
                    : i === currentSet - 1
                      ? 'var(--accent)'
                      : 'var(--bg-tertiary)',
                  transition: 'all 0.3s',
                  boxShadow: i === currentSet - 1 ? '0 0 8px var(--accent)' : 'none',
                }} />
              ))}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                Set {currentSet}/{currentExercise.sets || 1}
              </span>
            </div>

            {/* Rep counter or Timer */}
            {currentExercise.type === 'reps' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    fontSize: 56, fontWeight: 900,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {repsCompleted}
                  </span>
                  <span style={{ fontSize: 24, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {' / '}{currentExercise.reps}
                  </span>
                </div>

                {/* Rep progress bar */}
                <div style={{ width: '80%', marginBottom: 16 }}>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div className="progress-fill" style={{
                      width: `${(repsCompleted / (currentExercise.reps || 1)) * 100}%`,
                      background: 'var(--gradient-success)',
                    }} />
                  </div>
                </div>

                {/* Tap to count button */}
                <button
                  onClick={handleRepTap}
                  disabled={isPaused}
                  style={{
                    width: 100, height: 100,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    border: 'none',
                    color: 'white',
                    fontSize: 16, fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                    transition: 'transform 0.1s',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPointerDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  TAP
                </button>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Tap for each rep
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularTimer
                  current={timer}
                  total={currentExercise.holdTime || 30}
                  size={140}
                  color={timer <= 5 ? '#EF4444' : '#6366F1'}
                />
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  {timer <= 5 && timer > 0 ? 'Almost there!' : 'Hold steady!'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div style={{
            display: 'flex', gap: 10, padding: '12px 20px 20px',
          }}>
            <button
              className="btn btn-secondary"
              onClick={handleSkipExercise}
              style={{ flex: 1 }}
            >
              Skip →
            </button>
            {currentExercise.type === 'reps' && (
              <button
                className="btn btn-success"
                onClick={handleSetComplete}
                style={{ flex: 1 }}
              >
                Done ✓
              </button>
            )}
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && phase === PHASE.EXERCISE && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 40, backdropFilter: 'blur(5px)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>PAUSED</div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {formatTime(totalTimeElapsed)} elapsed
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsPaused(false)}
          >
            Resume ▶
          </button>
        </div>
      )}
    </div>
  );
}
