import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Loading from './Loading';
import { Search, User, ChevronRight, Users } from 'lucide-react';

const createSlug = (text) => {
  if (!text) return 'unknown';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPref = window.localStorage.getItem('theme');
    if (typeof storedPref === 'string') {
      return storedPref;
    }
  }
  return 'dark';
};

const Players = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Start typing a player name to search.');
  const [theme, setTheme] = useState(getInitialTheme);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Search Players - Track Wicket";
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const searchApi = useCallback(async (query) => {
    if (!query.trim()) {
      setPlayers([]);
      setMessage('Start typing a player name to search.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/players/search/${encodedQuery}`);
      const result = await response.json();

      if (result.status === 'success' && result.players) {
        setPlayers(result.players);
        if (result.players.length === 0) {
          setMessage(`No players found matching "${query}".`);
        }
      } else {
        setMessage(result.message || 'Error searching for players.');
      }
    } catch (error) {
      console.error("Search Error:", error);
      setMessage('Network error during search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchApi(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, searchApi]);

  const handlePlayerClick = (player) => {
    const playerSlug = createSlug(player.name);
    const playerId = player.id;
    
    navigate(`/player/${playerSlug}/${playerId}`, {
      state: {
        playerName: player.name,
        teamName: player.teamName,
        faceImageId: player.faceImageId
      }
    });
  };

  const getPlayerImageUrl = (faceImageId) => {
    if (!faceImageId) return `https://placehold.co/100x100/1e3a5f/0ea5e9?text=?`;
    return `https://www.cricbuzz.com/a/img/v1/100x100/i1/c${faceImageId}/player-face.jpg`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery="" setSearchQuery={() => {}} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 shadow-glow-sm">
                <Users size={24} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                Player Search
              </h1>
            </div>
            <p className="text-muted-foreground ml-14">
              Search for any cricket player worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={24} />
            <input
              type="text"
              placeholder="Search player name (e.g., Virat, Smith, Bumrah...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 px-6 py-4 pl-14 text-lg bg-card border-2 border-border rounded-2xl placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 shadow-cyber"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-8">
              <Loading message="Searching players..." size="small" />
            </div>
          )}

          {/* No Results */}
          {!loading && players.length === 0 && searchQuery.length > 0 && (
            <div className="text-center p-8 glass-card rounded-2xl animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <User size={28} className="text-destructive" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">No players found</p>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          
          {/* Initial State */}
          {!loading && players.length === 0 && searchQuery.length === 0 && (
            <div className="text-center p-8 glass-card rounded-2xl animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                <Search size={28} className="text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Ready to search</p>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {/* Results List */}
          {!loading && players.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Found {players.length} Player{players.length !== 1 ? 's' : ''}
                </h2>
              </div>
              
              <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border/50">
                {players.map((player, index) => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-primary/5 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={getPlayerImageUrl(player.faceImageId)}
                          alt={player.name}
                          className="w-14 h-14 object-cover object-center rounded-full border-2 border-primary/30 flex-shrink-0 group-hover:border-primary transition-colors"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = `https://placehold.co/100x100/1e3a5f/0ea5e9?text=${player.name.charAt(0)}`; 
                          }}
                        />
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-sm" />
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {player.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {player.teamName || 'Team Unknown'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight 
                      size={22} 
                      className="text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Track Wicket
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Players;
