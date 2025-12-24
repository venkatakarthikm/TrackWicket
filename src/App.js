import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import LiveDetails from './LiveDetails';
import ScorecardPage from './ScorecardPage';
import Players from './Players.js';
import PlayerDetails from './PlayerDetails';
import StatsPage from './StatsPage';
import Footer from './Footer';
import Notification from './Notification';
import Privacy from './Privacy';
import Terms from './Terms';
import NotFound from './NotFound.js';

const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPref = window.localStorage.getItem('theme');
        if (typeof storedPref === 'string') return storedPref;
        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) return 'dark';
    }
    return 'dark';
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [oneSignalReady, setOneSignalReady] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        // Wait for OneSignal script to load
        if (!window.OneSignal) {
          console.log("⏳ Waiting for OneSignal to load...");
          // Retry after a delay
          setTimeout(initOneSignal, 500);
          return;
        }

        // Check if already initialized
        if (window.OneSignalInitialized) {
          console.log("✅ OneSignal already initialized");
          setOneSignalReady(true);
          return;
        }

        console.log("🚀 Initializing OneSignal...");
        
        await window.OneSignal.init({
          appId: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enabled: false },
          // Automatically show prompt on first visit (optional)
          // autoResubscribe: true,
          // autoRegister: false, // We'll manually trigger it from Notification page
        });

        // Mark as initialized
        window.OneSignalInitialized = true;
        setOneSignalReady(true);
        
        console.log("✅ OneSignal Initialized Successfully");

        // Log current subscription status
        const isPushSupported = await window.OneSignal.isPushNotificationsSupported();
        const permission = await window.OneSignal.getNotificationPermission();
        console.log("📱 Push Supported:", isPushSupported);
        console.log("🔔 Permission Status:", permission);

      } catch (e) {
        console.error("❌ OneSignal Init Error:", e);
        // Retry once after error
        if (!window.OneSignalInitRetried) {
          window.OneSignalInitRetried = true;
          setTimeout(initOneSignal, 1000);
        }
      }
    };

    initOneSignal();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  const themeProps = { theme, toggleTheme };

  return (
    <Router>
      <div className="App min-h-screen flex flex-col"> 
        <Routes>
          <Route path="/" element={<Navigate to="/live" replace />} />
          <Route path="/live" element={<Home type="live" {...themeProps} />} />
          <Route path="/recent" element={<Home type="recent" {...themeProps} />} />
          <Route path="/players" element={<Players {...themeProps} />} />
          <Route path="/player/:playerSlug/:playerId" element={<PlayerDetails {...themeProps} />} />
          <Route path="/notifications" element={<Notification {...themeProps} oneSignalReady={oneSignalReady} />} />
          <Route path="/privacy" element={<Privacy {...themeProps} />} />
          <Route path="/terms" element={<Terms {...themeProps} />} />
          <Route path="/match/:matchId/:teamsSlug/:seriesSlug/live" element={<LiveDetails {...themeProps} />} /> 
          <Route path="/match/:matchId/:teamsSlug/:seriesSlug/scorecard" element={<ScorecardPage {...themeProps} />} /> 
          <Route path="/stats/:statSlug" element={<Navigate to={(location) => `/stats/${location.pathname.split('/')[2]}/odi`} replace />} />
          <Route path="/stats/:statSlug/:formatSlug" element={<StatsPage {...themeProps} />} />
          <Route path="/stats/:statSlug/:formatSlug/:year" element={<StatsPage {...themeProps} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
