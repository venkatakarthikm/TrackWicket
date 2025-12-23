import React, { Component } from 'react';
import Navbar from './Navbar';
import axios from 'axios'; 
import { Check, Plus, X, Shield, Bell, BellRing } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

class NotificationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            username: '',
            isRegistering: false, 
            formUsername: '',
            formPassword: '',
            message: '',
            selectedTeams: [],
            allAvailableTeams: [],
            oneSignalPlayerId: null,
            permissionStatus: 'default'
        };
    }

    async componentDidMount() {
        this.checkLoginStatus();
        this.fetchAvailableTeams();
        this.setupOneSignalState();
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    setupOneSignalState = async () => {
        if (!window.OneSignal) return;
        try {
            const playerId = await window.OneSignal.getUserId();
            const permission = await window.OneSignal.getNotificationPermission();
            
            this.setState({ 
                oneSignalPlayerId: playerId,
                permissionStatus: permission 
            });

            window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
                const id = await window.OneSignal.getUserId();
                this.setState({ oneSignalPlayerId: id });
                if (this.state.isLoggedIn) {
                    this.savePreferences(this.state.selectedTeams, id);
                }
            });
        } catch (error) {
            console.error('OneSignal State Error:', error);
        }
    };

    handleRequestPermission = async () => {
        if (!window.OneSignal) return;
        try {
            // This triggers the browser's native permission dialog
            await window.OneSignal.showNativePrompt();
            
            // Re-check after a short delay
            setTimeout(async () => {
                const id = await window.OneSignal.getUserId();
                const perm = await window.OneSignal.getNotificationPermission();
                this.setState({ oneSignalPlayerId: id, permissionStatus: perm });
            }, 1000);
        } catch (error) {
            console.error("Permission request failed:", error);
        }
    };

    checkLoginStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/status`, { withCredentials: true });
            if (response.data.message === 'Authenticated') {
                this.setState({ 
                    isLoggedIn: true, 
                    username: response.data.username,
                    selectedTeams: response.data.preferences || [],
                    oneSignalPlayerId: response.data.oneSignalPlayerId
                });
            }
        } catch (error) {
            this.setState({ isLoggedIn: false });
        }
    }

    fetchAvailableTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/teams`);
            const teams = response.data.map(t => t.name);
            this.setState({ allAvailableTeams: teams });
        } catch (error) {
            console.error("Failed to fetch teams", error);
        }
    }

    handleAuthSubmit = async (e) => {
        e.preventDefault();
        const { isRegistering, formUsername, formPassword } = this.state;
        const endpoint = isRegistering ? '/register' : '/login';

        try {
            const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
                username: formUsername,
                password: formPassword
            }, { withCredentials: true });

            if (isRegistering) {
                this.setState({ isRegistering: false, message: 'Registration successful! Login now.', formUsername: '', formPassword: '' });
            } else {
                this.setState({ 
                    isLoggedIn: true, 
                    username: response.data.username,
                    selectedTeams: response.data.preferences || [],
                    message: '',
                    formUsername: '', 
                    formPassword: ''
                }, () => {
                    if(this.state.oneSignalPlayerId) {
                        this.savePreferences(this.state.selectedTeams);
                    }
                });
            }
        } catch (error) {
            this.setState({ message: error.response?.data?.message || 'Authentication failed' });
        }
    }

    handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
            this.setState({ isLoggedIn: false, selectedTeams: [], username: '' });
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    toggleTeam = (team) => {
        const { selectedTeams } = this.state;
        const newTeams = selectedTeams.includes(team)
            ? selectedTeams.filter(t => t !== team)
            : [...selectedTeams, team];
        
        this.setState({ selectedTeams: newTeams });
        this.savePreferences(newTeams);
    }

    savePreferences = async (teams, overrideId = null) => {
        const playerId = overrideId || this.state.oneSignalPlayerId;
        try {
            await axios.post(`${API_BASE_URL}/preferences`, {
                teams,
                oneSignalPlayerId: playerId
            }, { withCredentials: true });
            this.setState({ message: 'Preferences updated!' });
            setTimeout(() => this.setState({ message: '' }), 2000);
        } catch (error) {
            console.error('Save preferences failed');
        }
    }

    renderAuthForm() {
        const { isRegistering, formUsername, formPassword, message } = this.state;
        return (
            <div className="max-w-md mx-auto bg-card border border-border p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-6 gradient-text">
                    {isRegistering ? 'Join Track Wicket' : 'Welcome Back'}
                </h2>
                {message && <p className={`text-center mb-4 text-sm ${message.includes('success') || message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
                
                <form onSubmit={this.handleAuthSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="formUsername"
                        placeholder="Username"
                        value={formUsername}
                        onChange={this.handleInputChange}
                        className="w-full p-3 rounded-xl bg-secondary/50 border border-border outline-none text-foreground"
                        required
                    />
                    <input
                        type="password"
                        name="formPassword"
                        placeholder="Password"
                        value={formPassword}
                        onChange={this.handleInputChange}
                        className="w-full p-3 rounded-xl bg-secondary/50 border border-border outline-none text-foreground"
                        required
                    />
                    <button type="submit" className="w-full btn-futuristic py-3 rounded-xl font-bold mt-2">
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => this.setState({ isRegistering: !isRegistering, message: '' })}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        );
    }

    renderNotificationSettings() {
        const { username, selectedTeams, allAvailableTeams, message, permissionStatus } = this.state;
        const unselectedTeams = allAvailableTeams.filter(team => !selectedTeams.includes(team));

        return (
            <div className="max-w-4xl mx-auto">
                {permissionStatus !== 'granted' && (
                    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary text-white p-3 rounded-full"><BellRing size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg">Push Notifications Disabled</h3>
                                <p className="text-sm text-muted-foreground">Please enable permissions to get real-time score updates.</p>
                            </div>
                        </div>
                        <button onClick={this.handleRequestPermission} className="btn-futuristic px-6 py-2 rounded-xl text-sm font-bold">Enable Now</button>
                    </div>
                )}

                <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl mb-8">
                    <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Welcome, {username}</h2>
                            <p className="text-sm text-muted-foreground">{this.state.oneSignalPlayerId ? "Linked to Browser ✅" : "Not Linked ❌"}</p>
                        </div>
                        <button onClick={this.handleLogout} className="text-red-500 text-sm font-bold hover:underline">Logout</button>
                    </div>

                    {message && <div className="p-3 rounded-xl mb-6 bg-green-500/10 text-green-500 text-sm text-center font-bold">{message}</div>}

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><Check size={18} /> Subscribed Teams</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {selectedTeams.map(team => (
                                <button key={team} onClick={() => this.toggleTeam(team)} className="bg-primary/20 border border-primary/40 p-3 rounded-xl flex justify-between items-center hover:bg-red-500/10 transition-all group">
                                    <span className="text-sm font-semibold">{team}</span>
                                    <X size={14} className="text-red-500 group-hover:scale-125" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-muted-foreground mb-4 flex items-center gap-2"><Shield size={18} /> Available Teams</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {unselectedTeams.map(team => (
                                <button key={team} onClick={() => this.toggleTeam(team)} className="bg-secondary/30 border border-border p-3 rounded-xl flex justify-between items-center hover:border-primary transition-all group">
                                    <span className="text-sm">{team}</span>
                                    <Plus size={14} className="group-hover:text-primary" />
                                </button>
                            ))}
                        </div>
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
                    <h1 className="text-4xl font-display font-extrabold text-center mb-8 gradient-text">Notification Center</h1>
                    {this.state.isLoggedIn ? this.renderNotificationSettings() : this.renderAuthForm()}
                </div>
            </div>
        );
    }
}

export default NotificationComponent;