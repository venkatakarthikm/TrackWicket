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
import Notification from "./Notification";
import Privacy from "./Privacy";
import Terms from "./Terms";
import NotFound from "./NotFound.js";
import Rankings from "./Rankings.js";
import { HelmetProvider } from 'react-helmet-async';
import SeriesView from "./SeriesView.js";
import ServerMonitor from './ServerMonitor';
import Upcoming from "./Upcoming.js";
import { Turnstile } from "@marsidev/react-turnstile";

const VerificationGate = ({ children }) => {
  const [isVerified, setIsVerified] = useState(() => {
    return sessionStorage.getItem("cf_verified") === "true";
  });
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (token) => {
  setLoading(true);
  
  // Create an AbortController to timeout the request after 15 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/verify-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem("cf_verified", "true");
      setIsVerified(true);
    } else {
      // If the backend explicitly says "This is a bot", we block them
      alert("Security check failed. Please refresh the page.");
    }
  } catch (err) {
    // FALLBACK: If backend is down, timed out, or network error occurs
    console.error("Backend unreachable, allowing entry via fallback:", err);
    
    // We still set verified to true so the user isn't stuck
    sessionStorage.setItem("cf_verified", "true");
    setIsVerified(true);
  } finally {
    setLoading(false);
  }
};

  if (!isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#3700B3] text-white p-6 text-center">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-2xl">
          <img src="TW.png" alt="Track Wicket" className="w-20 h-20 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
          <p className="text-gray-300 mb-8 text-sm">
            {loading ? "Confirming you're human..." : "Please complete the security check to access live cricket updates."}
          </p>

          <div className="flex justify-center">
            <Turnstile 
              siteKey="0x4AAAAAAB_x3SK-HvHfdNob" 
              onSuccess={handleSuccess}
              theme="dark"
            />
          </div>
        </div>
      </div>
    );
  }

  return children;
};

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
      <VerificationGate>
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
                <Route path="/notifications" element={<Notification {...themeProps} />} />
                <Route path="/privacy" element={<Privacy {...themeProps} />} />
                <Route path="/terms" element={<Terms {...themeProps} />} />
                <Route path="/match/:matchId/:teamsSlug/:seriesSlug/live" element={<LiveDetails {...themeProps} />} />
                <Route path="/match/:matchId/:teamsSlug/:seriesSlug/scorecard" element={<ScorecardPage {...themeProps} />} />
                <Route path="/stats/:statSlug" element={<Navigate to={(location) => `/stats/${location.pathname.split("/")[2]}/odi`} replace />} />
                <Route path="/stats/:statSlug/:formatSlug" element={<StatsPage {...themeProps} />} />
                <Route path="/stats/:statSlug/:formatSlug/:year" element={<StatsPage {...themeProps} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </Router>
      </VerificationGate>
    </HelmetProvider>
  );
}

export default App;