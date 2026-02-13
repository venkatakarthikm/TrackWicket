import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import Home from "./Home";
import LiveDetails from "./LiveDetails";
import ScorecardPage from "./ScorecardPage";
import Players from "./Players.js";
import PlayerDetails from "./PlayerDetails";
import StatsPage from "./StatsPage";
import Footer from "./Footer";
import AccountPage from "./AccountPage";
import Privacy from "./Privacy";
import Terms from "./Terms";
import NotFound from "./NotFound.js";
import Rankings from "./Rankings.js";
import { HelmetProvider } from 'react-helmet-async';
import SeriesView from "./SeriesView.js";
import ServerMonitor from './ServerMonitor';
import Upcoming from "./Upcoming.js";

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPref = window.localStorage.getItem("theme");
    if (typeof storedPref === "string") return storedPref;
    const userMedia = window.matchMedia("(prefers-color-scheme: light)");
    if (userMedia.matches) return "light";
  }
  return "light";
};

const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // trackPage(location.pathname + location.search); // Call the tracking function
    // For manual implementation:
    window.gtag('config', 'G-SQGDJM538K', {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Hide the "Back Online" message after 3 seconds
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Loss of connection UI
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white py-2 px-4 text-center text-sm font-bold shadow-md animate-bounce-subtle">
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
          No Internet Connection. Checking your network...
        </div>
      </div>
    );
  }

  // Recovery UI
  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white py-2 px-4 text-center text-sm font-bold shadow-md">
        ✓ Back Online
      </div>
    );
  }

  return null;
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [oneSignalReady, setOneSignalReady] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        if (!window.OneSignal) {
          setTimeout(initOneSignal, 100);
          return;
        }
        if (window.__oneSignalInit) {
          setOneSignalReady(true);
          return;
        }
        await window.OneSignal.init({
          appId: "6781142f-1aa4-4745-b9d1-908618d9d1f6",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
        });
        window.__oneSignalInit = true;
        setOneSignalReady(true);
      } catch (e) {
        setOneSignalReady(false);
      }
    };
    initOneSignal();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  }, []);

  const themeProps = { theme, toggleTheme, oneSignalReady };

  return (
    <HelmetProvider>
          <Router>
            <RouteChangeTracker />
            <div className="App min-h-screen flex flex-col">
              <OfflineStatus />
              <ServerMonitor/>  
              <Routes>
                <Route path="/" element={<Navigate to="/live" replace />} />
                <Route path="/live" element={<Home type="live" {...themeProps} />} />
                <Route path="/recent" element={<Home type="recent" {...themeProps} />} />
                <Route path="/upcoming" element={<Upcoming />} />
                <Route path="/series/:seriesId" element={<SeriesView {...themeProps} />} />
                <Route path="/series/:seriesId/:seriesSlug" element={<SeriesView {...themeProps} />} />
                <Route path="/players" element={<Players {...themeProps} />} />
                <Route path="/player/:playerSlug/:playerId" element={<PlayerDetails {...themeProps} />} />
                <Route path="/rankings/:gender/:role/:format" element={<Rankings {...themeProps} />} />
                <Route path="/rankings" element={<Navigate to="/rankings/men/batsmen/odi" replace />} />
                <Route path="/account" element={<AccountPage {...themeProps} />} />
                <Route path="/privacy" element={<Privacy {...themeProps} />} />
                <Route path="/terms" element={<Terms {...themeProps} />} />
                <Route path="/match/:matchId/:teamsSlug/:seriesSlug/live" element={<LiveDetails {...themeProps} />} />
                <Route path="/match/:matchId/:teamsSlug/:seriesSlug/scorecard" element={<ScorecardPage {...themeProps} />} />
                <Route path="/stats/:statSlug" element={<Navigate to={(location) => `/stats/${location.pathname.split("/")[2]}/odi`} replace />} />
                <Route path="/stats/:statSlug/:formatSlug" element={<StatsPage {...themeProps} />} />
                <Route path="/stats/:statSlug/:formatSlug/:year" element={<StatsPage {...themeProps} />} />
                <Route path="/series/:seriesId/:seriesSlug/:tab" element={<SeriesView {...themeProps} />} />
                <Route path="/series/:seriesId/:seriesSlug" element={<SeriesView {...themeProps} />} />
                <Route path="/series/:seriesId" element={<SeriesView {...themeProps} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </Router>
    </HelmetProvider>
  );
}

export default App;