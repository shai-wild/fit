import { useState, useEffect, useCallback } from 'react';
import { getProfile } from './utils/storage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import WorkoutSession from './components/WorkoutSession';
import History from './components/History';
import Profile from './components/Profile';
import AchievementsPage from './components/AchievementsPage';

const TABS = {
  HOME: 'home',
  HISTORY: 'history',
  ACHIEVEMENTS: 'achievements',
  PROFILE: 'profile',
};

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setLoaded(true);
  }, []);

  const handleOnboardingComplete = useCallback((p) => {
    setProfile(p);
    setActiveTab(TABS.HOME);
  }, []);

  const handleStartWorkout = useCallback((plan) => {
    setWorkoutPlan(plan);
    setWorkoutActive(true);
  }, []);

  const handleFinishWorkout = useCallback(() => {
    setWorkoutActive(false);
    setWorkoutPlan(null);
    setActiveTab(TABS.HOME);
  }, []);

  if (!loaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)'
      }}>
        <div className="page-title" style={{ fontSize: 36 }}>FitFlow</div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (workoutActive && workoutPlan) {
    return (
      <WorkoutSession
        workout={workoutPlan}
        profile={profile}
        onFinish={handleFinishWorkout}
        onQuit={handleFinishWorkout}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {activeTab === TABS.HOME && (
        <Dashboard profile={profile} onStartWorkout={handleStartWorkout} />
      )}
      {activeTab === TABS.HISTORY && <History />}
      {activeTab === TABS.ACHIEVEMENTS && <AchievementsPage />}
      {activeTab === TABS.PROFILE && (
        <Profile profile={profile} onUpdate={(p) => setProfile(p)} />
      )}

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === TABS.HOME ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.HOME)}
        >
          <span className="nav-icon">🏠</span>
          Home
        </button>
        <button
          className={`nav-item ${activeTab === TABS.HISTORY ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.HISTORY)}
        >
          <span className="nav-icon">📅</span>
          History
        </button>
        <button
          className={`nav-item ${activeTab === TABS.ACHIEVEMENTS ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.ACHIEVEMENTS)}
        >
          <span className="nav-icon">🏆</span>
          Badges
        </button>
        <button
          className={`nav-item ${activeTab === TABS.PROFILE ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.PROFILE)}
        >
          <span className="nav-icon">👤</span>
          Profile
        </button>
      </nav>
    </div>
  );
}
