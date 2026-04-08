import { EXERCISES, WARMUP_EXERCISES, COOLDOWN_EXERCISES, DIFFICULTY, MUSCLE_GROUPS } from '../data/exercises';

const SECONDS_PER_REP = 3;
const REST_BETWEEN_SETS = 15;
const REST_BETWEEN_EXERCISES = 20;
const TRANSITION_TIME = 5;

function getScaledReps(exercise, fitnessLevel, weekNumber) {
  const levelMultiplier = fitnessLevel === 'beginner' ? 0.7
    : fitnessLevel === 'intermediate' ? 1.0
    : 1.4;
  const progressionBonus = Math.min(weekNumber * 0.05, 0.5);
  return Math.round(exercise.baseReps * (levelMultiplier + progressionBonus));
}

function getScaledTime(exercise, fitnessLevel, weekNumber) {
  const levelMultiplier = fitnessLevel === 'beginner' ? 0.7
    : fitnessLevel === 'intermediate' ? 1.0
    : 1.4;
  const progressionBonus = Math.min(weekNumber * 0.03, 0.4);
  return Math.round(exercise.baseTime * (levelMultiplier + progressionBonus));
}

function getSets(fitnessLevel, weekNumber) {
  const base = fitnessLevel === 'beginner' ? 2
    : fitnessLevel === 'intermediate' ? 3
    : 4;
  return Math.min(base + Math.floor(weekNumber / 4), 5);
}

function estimateExerciseTime(exercise, sets, reps, holdTime) {
  if (exercise.type === 'time') {
    return (holdTime * sets) + (REST_BETWEEN_SETS * (sets - 1)) + TRANSITION_TIME;
  }
  return (reps * SECONDS_PER_REP * sets) + (REST_BETWEEN_SETS * (sets - 1)) + TRANSITION_TIME;
}

function filterExercisesByDifficulty(exercises, fitnessLevel) {
  const maxDiff = fitnessLevel === 'beginner' ? DIFFICULTY.BEGINNER
    : fitnessLevel === 'intermediate' ? DIFFICULTY.INTERMEDIATE
    : DIFFICULTY.ADVANCED;
  return exercises.filter(e => (e.difficulty || DIFFICULTY.BEGINNER) <= maxDiff);
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectExercisesForGoal(exercises, goal) {
  let priorityMuscles;
  if (goal === 'lose_weight') {
    priorityMuscles = [MUSCLE_GROUPS.FULL_BODY, MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.CORE];
  } else if (goal === 'build_muscle') {
    priorityMuscles = [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.LEGS, MUSCLE_GROUPS.ARMS];
  } else {
    priorityMuscles = Object.values(MUSCLE_GROUPS);
  }

  const priority = exercises.filter(e =>
    e.muscles && e.muscles.some(m => priorityMuscles.includes(m))
  );
  const rest = exercises.filter(e =>
    !e.muscles || !e.muscles.some(m => priorityMuscles.includes(m))
  );
  return [...shuffleArray(priority), ...shuffleArray(rest)];
}

export function generateWorkout(profile) {
  const {
    duration = 15,
    fitnessLevel = 'beginner',
    goal = 'get_fit',
    weekNumber = 1,
  } = profile;

  const targetSeconds = duration * 60;
  const warmupTime = 60;
  const cooldownTime = 40;
  const mainTime = targetSeconds - warmupTime - cooldownTime;

  const availableExercises = filterExercisesByDifficulty(EXERCISES, fitnessLevel);
  const sortedExercises = selectExercisesForGoal(availableExercises, goal);

  const sets = getSets(fitnessLevel, weekNumber);
  const workoutExercises = [];
  let totalTime = 0;
  const usedMuscles = new Set();

  for (const exercise of sortedExercises) {
    if (totalTime >= mainTime) break;

    const reps = exercise.type === 'reps' ? getScaledReps(exercise, fitnessLevel, weekNumber) : 0;
    const holdTime = exercise.type === 'time' ? getScaledTime(exercise, fitnessLevel, weekNumber) : 0;
    const exerciseTime = estimateExerciseTime(exercise, sets, reps, holdTime) + REST_BETWEEN_EXERCISES;

    if (totalTime + exerciseTime <= mainTime + 30) {
      workoutExercises.push({
        ...exercise,
        sets,
        reps,
        holdTime,
        estimatedTime: exerciseTime,
      });
      totalTime += exerciseTime;
      if (exercise.muscles) {
        exercise.muscles.forEach(m => usedMuscles.add(m));
      }
    }
  }

  const warmup = WARMUP_EXERCISES.map(e => ({
    ...e,
    sets: 1,
    reps: 0,
    holdTime: e.baseTime,
    estimatedTime: e.baseTime + TRANSITION_TIME,
    isWarmup: true,
  }));

  const cooldown = COOLDOWN_EXERCISES.map(e => ({
    ...e,
    sets: 1,
    reps: 0,
    holdTime: e.baseTime,
    estimatedTime: e.baseTime + TRANSITION_TIME,
    isCooldown: true,
  }));

  return {
    id: Date.now().toString(36),
    date: new Date().toISOString(),
    targetDuration: duration,
    fitnessLevel,
    goal,
    warmup,
    exercises: workoutExercises,
    cooldown,
    totalExercises: warmup.length + workoutExercises.length + cooldown.length,
    estimatedDuration: Math.round((warmupTime + totalTime + cooldownTime) / 60),
    muscleGroups: [...usedMuscles],
  };
}

export function getWeekNumber(profile) {
  if (!profile || !profile.createdAt) return 1;
  const created = new Date(profile.createdAt);
  const now = new Date();
  const diffWeeks = Math.floor((now - created) / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
}
