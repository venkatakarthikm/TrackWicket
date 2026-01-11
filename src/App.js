import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPref = window.localStorage.getItem("theme");
    if (typeof storedPref === "string") return storedPref;
    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (userMedia.matches) return "dark";
  }
  return "dark";
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        // CRITICAL CHECK: Prevent double initialization error
        if (window.OneSignal && !window.OneSignal.initialized) {
          await window.OneSignal.init({
            appId: "6781142f-1aa4-4745-b9d1-908618d9d1f6",
            allowLocalhostAsSecureOrigin: true,
            notifyButton: { enabled: false }, // We use our own custom UI
          });
          console.log("✅ OneSignal Initialized");
        }
      } catch (e) {
        console.error("OneSignal Global Init Error:", e);
      }
    };

    // Ensure script is loaded before calling init
    if (window.OneSignal) {
      initOneSignal();
    }
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

  const themeProps = { theme, toggleTheme };

  return (
    <HelmetProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/live" replace />} />
            <Route path="/live" element={<Home type="live" {...themeProps} />} />
          <Route
            path="/recent"
            element={<Home type="recent" {...themeProps} />}
          />
          <Route path="/players" element={<Players {...themeProps} />} />
          <Route
            path="/player/:playerSlug/:playerId"
            element={<PlayerDetails {...themeProps} />}
          />
          <Route
            path="/rankings/:gender/:role/:format"
            element={<Rankings {...themeProps} />}
          />
          <Route
            path="/rankings"
            element={<Navigate to="/rankings/men/batsmen/odi" replace />}
          />

          <Route
            path="/notifications"
            element={<Notification {...themeProps} />}
          />
          <Route path="/privacy" element={<Privacy {...themeProps} />} />
          <Route path="/terms" element={<Terms {...themeProps} />} />
          <Route
            path="/match/:matchId/:teamsSlug/:seriesSlug/live"
            element={<LiveDetails {...themeProps} />}
          />
          <Route
            path="/match/:matchId/:teamsSlug/:seriesSlug/scorecard"
            element={<ScorecardPage {...themeProps} />}
          />
          <Route
            path="/stats/:statSlug"
            element={
              <Navigate
                to={(location) =>
                  `/stats/${location.pathname.split("/")[2]}/odi`
                }
                replace
              />
            }
          />
          <Route
            path="/stats/:statSlug/:formatSlug"
            element={<StatsPage {...themeProps} />}
          />
          <Route
            path="/stats/:statSlug/:formatSlug/:year"
            element={<StatsPage {...themeProps} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;
