const KEYS = {
  PROFILE: 'fitflow_profile',
  WORKOUTS: 'fitflow_workouts',
  STREAK: 'fitflow_streak',
  ACHIEVEMENTS: 'fitflow_achievements',
};

export function getProfile() {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getWorkoutHistory() {
  try {
    const data = localStorage.getItem(KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveWorkout(workout) {
  const history = getWorkoutHistory();
  history.push({ ...workout, completedAt: new Date().toISOString() });
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(history));
  updateStreak();
  checkAchievements(history);
}

export function getStreak() {
  try {
    const data = localStorage.getItem(KEYS.STREAK);
    return data ? JSON.parse(data) : { current: 0, best: 0, lastWorkoutDate: null };
  } catch { return { current: 0, best: 0, lastWorkoutDate: null }; }
}

function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastWorkoutDate === today) return;

  if (streak.lastWorkoutDate === yesterday) {
    streak.current += 1;
  } else if (streak.lastWorkoutDate !== today) {
    streak.current = 1;
  }

  streak.lastWorkoutDate = today;
  streak.best = Math.max(streak.best, streak.current);
  localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
}

export function getTodayWorkout() {
  const history = getWorkoutHistory();
  const today = new Date().toISOString().split('T')[0];
  return history.find(w => w.completedAt && w.completedAt.startsWith(today));
}

export function getWorkoutsForMonth(year, month) {
  const history = getWorkoutHistory();
  return history.filter(w => {
    if (!w.completedAt) return false;
    const d = new Date(w.completedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getAchievements() {
  try {
    const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function checkAchievements(history) {
  const achievements = getAchievements();
  const earned = new Set(achievements.map(a => a.id));

  const ACHIEVEMENT_DEFS = [
    { id: 'first_workout', name: 'First Step', desc: 'Complete your first workout', icon: '🎯', check: h => h.length >= 1 },
    { id: 'five_workouts', name: 'Getting Started', desc: 'Complete 5 workouts', icon: '⭐', check: h => h.length >= 5 },
    { id: 'ten_workouts', name: 'Dedicated', desc: 'Complete 10 workouts', icon: '💪', check: h => h.length >= 10 },
    { id: 'twenty_five', name: 'Committed', desc: 'Complete 25 workouts', icon: '🔥', check: h => h.length >= 25 },
    { id: 'fifty_workouts', name: 'Beast Mode', desc: 'Complete 50 workouts', icon: '🏆', check: h => h.length >= 50 },
    { id: 'hundred_workouts', name: 'Legend', desc: 'Complete 100 workouts', icon: '👑', check: h => h.length >= 100 },
    { id: 'streak_3', name: 'Hat Trick', desc: '3 day streak', icon: '🎩', check: () => getStreak().best >= 3 },
    { id: 'streak_7', name: 'Week Warrior', desc: '7 day streak', icon: '⚡', check: () => getStreak().best >= 7 },
    { id: 'streak_14', name: 'Unstoppable', desc: '14 day streak', icon: '🌟', check: () => getStreak().best >= 14 },
    { id: 'streak_30', name: 'Iron Will', desc: '30 day streak', icon: '💎', check: () => getStreak().best >= 30 },
  ];

  let newAchievements = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (!earned.has(def.id) && def.check(history)) {
      const achievement = { ...def, earnedAt: new Date().toISOString() };
      delete achievement.check;
      achievements.push(achievement);
      newAchievements.push(achievement);
    }
  }

  if (newAchievements.length > 0) {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }
  return newAchievements;
}

export function getStats() {
  const history = getWorkoutHistory();
  const streak = getStreak();
  const totalMinutes = history.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalExercises = history.reduce((sum, w) => sum + (w.exercisesCompleted || 0), 0);

  return {
    totalWorkouts: history.length,
    totalMinutes,
    totalExercises,
    currentStreak: streak.current,
    bestStreak: streak.best,
  };
}
