import React, { Component } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import {
  Check,
  Plus,
  X,
  Shield,
  Bell,
  BellRing,
  Loader2,
  AlertCircle,
} from "lucide-react";

// FIX: Use environment variable or fallback to correct localhost URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

class NotificationComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      username: "",
      isRegistering: false,
      formUsername: "",
      formPassword: "",
      message: "",
      messageType: "",
      selectedTeams: [],
      allAvailableTeams: [],
      oneSignalPlayerId: null,
      permissionStatus: "default",
      isLoading: false,
      isSavingPreferences: false,
      isRequestingPermission: false,
    };
  }

  async componentDidMount() {
    await this.checkLoginStatus();
    this.fetchAvailableTeams();
    if (this.props.oneSignalReady) {
      this.setupOneSignalState();
    }
    setTimeout(() => {
      if (!this.props.oneSignalReady) {
        this.setState({
          permissionStatus: "blocked",
          message:
            "⚠️ OneSignal appears to be blocked by an ad blocker. Please disable it for this site.",
          messageType: "error",
        });
      }
    }, 5000);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.oneSignalReady && this.props.oneSignalReady) {
      this.setupOneSignalState();
    }
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setupOneSignalState = async () => {
    try {
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported();

      if (!isPushSupported) {
        console.warn("⚠️ Push notifications not supported on this browser");
        this.setState({ permissionStatus: "unsupported" });
        return;
      }

      const permission = await window.OneSignal.Notifications.permission;
      let playerId = null;

      // Get player ID if permission is granted
      if (permission) {
        try {
          playerId = await window.OneSignal.User.PushSubscription.id;
        } catch (e) {
          console.warn("⚠️ Could not get player ID:", e);
        }
      }

      console.log(
        "🔔 OneSignal State - Player ID:",
        playerId,
        "Permission:",
        permission
      );

      this.setState({
        oneSignalPlayerId: playerId,
        permissionStatus: permission ? "granted" : "default",
      });

      // Listen for subscription changes
      window.OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
        console.log("📡 Subscription changed:", event);
        
        const newPlayerId = event.current.id;
        this.setState({ 
          oneSignalPlayerId: newPlayerId,
          permissionStatus: newPlayerId ? "granted" : "default" 
        });

        if (this.state.isLoggedIn && newPlayerId) {
          await this.savePreferences(this.state.selectedTeams, newPlayerId);
        }
      });

      // If already granted and logged in, save the player ID
      if (permission && playerId && this.state.isLoggedIn) {
        await this.savePreferences(this.state.selectedTeams, playerId);
      }
    } catch (error) {
      console.error("❌ OneSignal State Setup Error:", error);
    }
  };

  handleRequestPermission = async () => {
  try {
    const result = await window.OneSignal.Notifications.requestPermission();
    const permission = await window.OneSignal.Notifications.permission;

    let playerId = null;
    if (permission) {
      playerId = await window.OneSignal.User.PushSubscription.id;
    }

    this.setState({
      permissionStatus: permission ? "granted" : "denied",
      oneSignalPlayerId: playerId,
    });
  } catch (e) {
    console.error("Permission error:", e);
  }
};


  showMessage = (text, type = "success") => {
    this.setState({ message: text, messageType: type });
    setTimeout(() => this.setState({ message: "", messageType: "" }), 4000);
  };

  checkLoginStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`, {
        withCredentials: true,
      });

      if (response.data.message === "Authenticated") {
        this.setState({
          isLoggedIn: true,
          username: response.data.username,
          selectedTeams: response.data.preferences || [],
          oneSignalPlayerId: response.data.oneSignalPlayerId,
        });
        console.log("✅ User authenticated:", response.data.username);
      }
    } catch (error) {
      console.log("ℹ️ Not authenticated");
      this.setState({ isLoggedIn: false });
    }
  };

  fetchAvailableTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`);
      const teams = response.data.map((t) => t.name);
      this.setState({ allAvailableTeams: teams });
      console.log("✅ Fetched teams:", teams.length);
    } catch (error) {
      console.error("❌ Failed to fetch teams", error);
      this.showMessage("Failed to load teams list.", "error");
    }
  };

  handleAuthSubmit = async (e) => {
    e.preventDefault();
    const { isRegistering, formUsername, formPassword } = this.state;

    if (!formUsername.trim() || !formPassword.trim()) {
      this.showMessage("Please fill in all fields.", "error");
      return;
    }

    if (formUsername.trim().length < 3) {
      this.showMessage("Username must be at least 3 characters.", "error");
      return;
    }

    if (formPassword.length < 6) {
      this.showMessage("Password must be at least 6 characters.", "error");
      return;
    }

    const endpoint = isRegistering ? "/register" : "/login";
    this.setState({ isLoading: true, message: "", messageType: "" });

    try {
      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        {
          username: formUsername.trim(),
          password: formPassword,
        },
        { withCredentials: true }
      );

      if (isRegistering) {
        this.showMessage("Registration successful! Please login.", "success");
        this.setState({
          isRegistering: false,
          formUsername: "",
          formPassword: "",
          isLoading: false,
        });
      } else {
        console.log("✅ Login successful:", response.data);

        this.setState({
          isLoggedIn: true,
          username: response.data.username,
          selectedTeams: response.data.preferences || [],
          oneSignalPlayerId: response.data.oneSignalPlayerId || null,
          formUsername: "",
          formPassword: "",
          isLoading: false,
        });

        this.showMessage(`Welcome back, ${response.data.username}!`, "success");

        // If OneSignal is ready and permission granted, sync the player ID
        if (
          this.props.oneSignalReady &&
          this.state.permissionStatus === "granted"
        ) {
          try {
            const playerId = await window.OneSignal.User.PushSubscription.id;
            if (playerId) {
              await this.savePreferences(this.state.selectedTeams, playerId);
            }
          } catch (e) {
            console.warn("⚠️ Could not sync player ID after login:", e);
          }
        }
      }
    } catch (error) {
      console.error("❌ Auth error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Authentication failed. Please try again.";
      this.showMessage(errorMsg, "error");
      this.setState({ isLoading: false });
    }
  };

  handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
      this.setState({
        isLoggedIn: false,
        selectedTeams: [],
        username: "",
        oneSignalPlayerId: null,
      });
      this.showMessage("Logged out successfully.", "success");
      console.log("✅ Logged out");
    } catch (error) {
      console.error("❌ Logout failed", error);
      this.showMessage("Logout failed.", "error");
    }
  };

  toggleTeam = async (team) => {
    const { selectedTeams } = this.state;
    const newTeams = selectedTeams.includes(team)
      ? selectedTeams.filter((t) => t !== team)
      : [...selectedTeams, team];

    // Optimistically update UI
    this.setState({ selectedTeams: newTeams });

    // Save to backend
    await this.savePreferences(newTeams);
  };

  savePreferences = async (teams, overrideId = null) => {
    const playerId = overrideId || this.state.oneSignalPlayerId;

    this.setState({ isSavingPreferences: true });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/preferences`,
        {
          teams,
          oneSignalPlayerId: playerId,
        },
        { withCredentials: true }
      );

      console.log("✅ Preferences saved:", response.data);

      this.setState({
        isSavingPreferences: false,
        oneSignalPlayerId: response.data.oneSignalPlayerId || playerId,
      });

      this.showMessage("Preferences updated successfully!", "success");
    } catch (error) {
      console.error("❌ Save preferences failed:", error);
      this.setState({ isSavingPreferences: false });
      this.showMessage("Failed to save preferences.", "error");
    }
  };

  renderAuthForm() {
    const {
      isRegistering,
      formUsername,
      formPassword,
      message,
      messageType,
      isLoading,
    } = this.state;

    return (
      <div className="max-w-md mx-auto bg-card border border-border p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-display font-extrabold text-center mb-6 gradient-text">
          {isRegistering ? "Join Track Wicket" : "Welcome Back"}
        </h2>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
              messageType === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500/30"
                : "bg-red-500/10 text-red-500 border border-red-500/30"
            }`}
          >
            <AlertCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={this.handleAuthSubmit} className="space-y-4">
          <input
            type="text"
            name="formUsername"
            placeholder="Username (min 3 characters)"
            value={formUsername}
            onChange={this.handleInputChange}
            className="w-full p-3 rounded-xl bg-secondary/50 border border-border outline-none text-foreground focus:border-primary transition-colors"
            required
            disabled={isLoading}
            minLength={3}
          />
          <input
            type="password"
            name="formPassword"
            placeholder="Password (min 6 characters)"
            value={formPassword}
            onChange={this.handleInputChange}
            className="w-full p-3 rounded-xl bg-secondary/50 border border-border outline-none text-foreground focus:border-primary transition-colors"
            required
            disabled={isLoading}
            minLength={6}
          />
          <button
            type="submit"
            className="w-full btn-futuristic py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading
              ? "Please wait..."
              : isRegistering
              ? "Register"
              : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() =>
              this.setState({
                isRegistering: !isRegistering,
                message: "",
                messageType: "",
                formUsername: "",
                formPassword: "",
              })
            }
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={isLoading}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    );
  }

  renderNotificationSettings() {
    const {
      username,
      selectedTeams,
      allAvailableTeams,
      message,
      messageType,
      permissionStatus,
      isSavingPreferences,
      isRequestingPermission,
    } = this.state;

    const unselectedTeams = allAvailableTeams.filter(
      (team) => !selectedTeams.includes(team)
    );

    return (
      <div className="max-w-4xl mx-auto">
        {/* Permission Banner */}
        {permissionStatus !== "granted" &&
          permissionStatus !== "unsupported" && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-white p-3 rounded-full">
                  <BellRing size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Push Notifications Disabled
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enable permissions to get real-time score updates.
                  </p>
                </div>
              </div>
              <button
                onClick={this.handleRequestPermission}
                className="btn-futuristic px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isRequestingPermission}
              >
                {isRequestingPermission && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isRequestingPermission ? "Requesting..." : "Enable Now"}
              </button>
            </div>
          )}

        {permissionStatus === "unsupported" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-yellow-500" size={24} />
              <div>
                <h3 className="font-bold text-lg">
                  Push Notifications Not Supported
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your browser doesn't support push notifications.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {username}</h2>
              <p className="text-sm text-muted-foreground">
                {this.state.oneSignalPlayerId
                  ? "✅ Notifications Linked"
                  : "❌ Not Linked"}
              </p>
            </div>
            <button
              onClick={this.handleLogout}
              className="text-red-500 text-sm font-bold hover:underline"
            >
              Logout
            </button>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-sm font-bold ${
                messageType === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/30"
                  : "bg-red-500/10 text-red-500 border border-red-500/30"
              }`}
            >
              <AlertCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          {isSavingPreferences && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl mb-6 bg-blue-500/10 text-blue-500 text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>Saving preferences...</span>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Check size={18} /> Subscribed Teams ({selectedTeams.length})
            </h3>
            {selectedTeams.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No teams selected. Add teams below to receive notifications.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedTeams.map((team) => (
                  <button
                    key={team}
                    onClick={() => this.toggleTeam(team)}
                    className="bg-primary/20 border border-primary/40 p-3 rounded-xl flex justify-between items-center hover:bg-red-500/10 transition-all group"
                    disabled={isSavingPreferences}
                  >
                    <span className="text-sm font-semibold">{team}</span>
                    <X
                      size={14}
                      className="text-red-500 group-hover:scale-125 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <Shield size={18} /> Available Teams ({unselectedTeams.length})
            </h3>
            {unselectedTeams.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                You're subscribed to all available teams!
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {unselectedTeams.map((team) => (
                  <button
                    key={team}
                    onClick={() => this.toggleTeam(team)}
                    className="bg-secondary/30 border border-border p-3 rounded-xl flex justify-between items-center hover:border-primary transition-all group"
                    disabled={isSavingPreferences}
                  >
                    <span className="text-sm">{team}</span>
                    <Plus
                      size={14}
                      className="group-hover:text-primary transition-colors"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="min-h-screen bg-background">
        <Navbar theme={this.props.theme} toggleTheme={this.props.toggleTheme} />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-display font-extrabold text-center mb-8 gradient-text">
            Notification Center
          </h1>
          {this.state.isLoggedIn
            ? this.renderNotificationSettings()
            : this.renderAuthForm()}
        </div>
      </div>
    );
  }
}

export default NotificationComponent;
