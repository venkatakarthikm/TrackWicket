import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OneSignal from 'react-onesignal';
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
        console.log("🚀 Initializing OneSignal via NPM...");
        
        await OneSignal.init({
          appId: "6781142f-1aa4-4745-b9d1-908618d9d1f6",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true, // We use custom UI
          },
          // Safari-specific settings
          safari_web_id: 'web.onesignal.auto.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Optional: Add if you have Safari Web ID
        });

        // Wait for OneSignal to be fully ready
        await OneSignal.setSubscription(true); // Don't auto-subscribe

        setOneSignalReady(true);
        console.log("✅ OneSignal Initialized Successfully");

        // Log current status
        const isPushSupported = await OneSignal.isPushNotificationsSupported();
        const permission = await OneSignal.getNotificationPermission();
        const userId = await OneSignal.getUserId();
        
        console.log("📱 Push Supported:", isPushSupported);
        console.log("🔔 Permission:", permission);
        console.log("👤 User ID:", userId);

        // Listen for permission changes
        OneSignal.on('subscriptionChange', function(isSubscribed) {
          console.log("📡 Subscription changed:", isSubscribed);
        });

        OneSignal.on('notificationPermissionChange', function(permissionChange) {
          console.log("🔔 Permission changed:", permissionChange);
        });

      } catch (error) {
        console.error("❌ OneSignal Init Error:", error);
        
        // Retry once after 2 seconds
        if (!window.OneSignalInitRetried) {
          window.OneSignalInitRetried = true;
          console.log("🔄 Retrying OneSignal initialization...");
          setTimeout(initOneSignal, 2000);
        } else {
          console.error("❌ OneSignal initialization failed permanently");
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
