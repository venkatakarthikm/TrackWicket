import { useState, useEffect, useCallback, memo } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Loading from './Loading';
import { ChevronLeft, User, Trophy, Calendar, Zap, ListOrdered, Clock, Heart, Flag, AlertTriangle } from 'lucide-react'; 
import { Helmet } from 'react-helmet-async';
import SEO from './SEO';

// Add this function to generate player-specific SEO
const getPlayerSEOConfig = (profileData) => {
  if (!profileData) {
    return {
      title: "Cricket Player Profile - Track Wicket",
      description: "View detailed cricket player profile, career statistics, and performance records on Track Wicket.",
      keywords: "cricket player, player profile, cricket statistics, Track Wicket",
      canonical: window.location.href
    };
  }
const seoConfig = getPlayerSEOConfig(profileData);
  const playerName = profileData.name || "Cricket Player";
  const country = profileData.country || "International";
  const role = profileData.role || "Cricketer";
  
  const title = `${playerName} - ${country} ${role} Profile & Stats`;
  const description = `${playerName} cricket player profile. View complete career statistics, batting and bowling records, matches played, and performance analysis for ${country} ${role.toLowerCase()} on Track Wicket.`;
  const keywords = `${playerName}, ${playerName} stats, ${playerName} profile, ${country} cricket, ${role}, cricket player profile, ${playerName} career, Track Wicket ${playerName}`;

  return {
    title,
    description,
    keywords,
    canonical: window.location.href,
    ogImage: profileData.faceImageId ? 
      `https://www.cricbuzz.com/a/img/v1/200x200/i1/c${profileData.faceImageId}/player-face.jpg` : 
      "https://trackwicket.tech/twmini.png",
    breadcrumbs: [
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Players",
        "item": "https://trackwicket.tech/players"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": playerName,
        "item": window.location.href
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": playerName,
      "jobTitle": role,
      "nationality": country,
      "sport": "Cricket",
      "description": description,
      "url": window.location.href,
      "image": profileData.faceImageId ? 
        `https://www.cricbuzz.com/a/img/v1/200x200/i1/c${profileData.faceImageId}/player-face.jpg` : 
        undefined
    }
  };
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPref = window.localStorage.getItem('theme');
    if (typeof storedPref === 'string') return storedPref;
  }
  return 'dark';
};

const getPlayerImageUrl = (faceImageId) => {
  if (!faceImageId || faceImageId === 0) return `https://placehold.co/200x200/1e3a5f/0ea5e9?text=?`;
  return `https://www.cricbuzz.com/a/img/v1/200x200/i1/c${faceImageId}/player-face.jpg`;
};

const PlayerDetails = () => {
  const { playerId, playerSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);

  const [profileData, setProfileData] = useState(null);
  const seoConfig = getPlayerSEOConfig(profileData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [rankingSubTab, setRankingSubTab] = useState('batting'); // New: sub-tab for rankings

  const navigationState = location.state || {};

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const displayName = navigationState.playerName || playerSlug.replace(/-/g, ' ').toUpperCase();
    document.title = `Profile: ${displayName} - Track Wicket`;
  }, [playerSlug, navigationState]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/players/profile/${playerId}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        setProfileData(result.data);
      } else {
        setError(result.message || 'Failed to load player profile.');
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setError('Network error: Could not retrieve player data.');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleBack = () => navigate('/players');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery="" setSearchQuery={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="TRACKWICKET" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery="" setSearchQuery={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="glass-card p-8 rounded-2xl text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Error Loading Profile</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              onClick={handleBack} 
              className="btn-futuristic"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }
    
  const { 
    player_name, 
    country, 
    personal_information, 
    batting_career_summary, 
    bowling_career_summary, 
    icc_rankings, 
    career_information,
    role 
  } = profileData;
    
  const info = personal_information || {};

  const displayName = player_name 
    || navigationState.playerName 
    || info.nickname 
    || playerSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    || 'Unknown Player';
    
  const displayCountry = country 
    || navigationState.teamName 
    || info.birth_place?.split(',').pop()?.trim()
    || 'Unknown';
    
  const playerRole = role || info.role || 'Player';
    
  const faceImageId = info.face_image_id || navigationState.faceImageId || 0;

  const TabButton = ({ tabId, icon: Icon, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
        activeTab === tabId
          ? "bg-primary text-primary-foreground shadow-glow-sm"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  );

  const StatTable = memo(({ title, stats, icon: Icon }) => {
    const formats = Object.keys(stats || {}).filter(f => Object.keys(stats[f] || {}).length > 0);
    if (formats.length === 0) return (
      <div className="text-center p-8 glass-card rounded-2xl">
        <p className="text-lg font-semibold text-muted-foreground">{title} - No data available</p>
      </div>
    );

    const statNames = Object.keys(stats[formats[0]]);

    const { 
    player_name, 
    country, 
    personal_information, 
    batting_career_summary, 
    bowling_career_summary, 
    icc_rankings, 
    career_information,
    role 
  } = profileData || {};

  const info = personal_information || {};
  const displayName = player_name || navigationState.playerName || 'Cricket Player';
  const displayCountry = country || navigationState.teamName || 'International';
  const playerRole = role || info.role || 'Professional Cricketer';
  const faceImageId = info.face_image_id || navigationState.faceImageId || 0;
  const playerImageUrl = getPlayerImageUrl(faceImageId);
  const currentUrl = window.location.href;

    return (
      <div className="glass-card rounded-2xl overflow-hidden mb-6">
        <SEO {...seoConfig} />
        <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>Track Wicket - {profileData?.name} Cricket Player Profile</h1>
        <Helmet>
        {/* Standard SEO */}
        <title>{`${displayName} Profile | Stats, Rankings & Career - Track Wicket`}</title>
        <meta name="description" content={`View ${displayName}'s full cricket profile. Career batting average, bowling stats, latest ICC rankings, and debut details for ${displayCountry}.`} />
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${displayName} (${displayCountry}) | Cricket Stats`} />
        <meta property="og:description" content={`Full career summary and ICC rankings for ${displayName}. Follow live cricket updates on Track Wicket.`} />
        <meta property="og:image" content={playerImageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="Track Wicket" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayName} - ${playerRole}`} />
        <meta name="twitter:description" content={`Explore stats and career history for ${displayName} on Track Wicket.`} />
        <meta name="twitter:image" content={playerImageUrl} />
        <meta name="twitter:site" content="@TrackWicket" />

        {/* Structured Data (JSON-LD) for Google Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": displayName,
            "jobTitle": playerRole,
            "nationality": {
              "@type": "Country",
              "name": displayCountry
            },
            "image": playerImageUrl,
            "description": `${displayName} is a ${playerRole} representing ${displayCountry}.`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": currentUrl
            }
          })}
        </script>
      </Helmet>
        <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <Icon size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider min-w-[120px]">STAT</th>
                {formats.map(f => (
                  <th key={f} className="px-4 py-3 text-right text-xs font-bold text-primary uppercase tracking-wider min-w-[80px]">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {statNames.map(statName => (
                <tr key={statName} className="hover:bg-primary/5 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-foreground">{statName}</td>
                  {formats.map(f => (
                    <td key={`${f}-${statName}`} className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {stats[f][statName] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  });

  const RankingView = () => {
    const battingRanks = icc_rankings?.batting || {};
    const bowlingRanks = icc_rankings?.bowling || {};
    const allRounderRanks = icc_rankings?.all_rounder || {};
    
    // Determine which ranking type to show based on sub-tab
    let currentRanks = {};
    let rankingTitle = '';
    
    if (rankingSubTab === 'batting') {
      currentRanks = battingRanks;
      rankingTitle = 'ICC Batting Rankings';
    } else if (rankingSubTab === 'bowling') {
      currentRanks = bowlingRanks;
      rankingTitle = 'ICC Bowling Rankings';
    } else if (rankingSubTab === 'all_rounder') {
      currentRanks = allRounderRanks;
      rankingTitle = 'ICC All-Rounder Rankings';
    }
    
    const formats = Object.keys(currentRanks);
    
    if (formats.length === 0) {
      return (
        <div className="text-center p-8 glass-card rounded-2xl">
          <p className="text-lg font-semibold text-muted-foreground">ICC Rankings data not available.</p>
        </div>
      );
    }

    return (
      <div className="glass-card rounded-2xl p-6">
        {/* Sub-tabs for ranking types */}
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-secondary/20 rounded-xl">
          <button
            onClick={() => setRankingSubTab('batting')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              rankingSubTab === 'batting'
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Zap size={16} />
            Batting
          </button>
          <button
            onClick={() => setRankingSubTab('bowling')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              rankingSubTab === 'bowling'
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Trophy size={16} />
            Bowling
          </button>
          <button
            onClick={() => setRankingSubTab('all_rounder')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              rankingSubTab === 'all_rounder'
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <User size={16} />
            All-Rounder
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ListOrdered size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">{rankingTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formats.map(format => (
            <div key={format} className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 shadow-cyber">
              <p className="text-sm font-bold text-primary mb-2">{format}</p>
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                #{currentRanks[format]?.current_rank || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Best: #{currentRanks[format]?.best_rank || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div className="space-y-6">
      <StatTable title="Batting Career Summary" stats={batting_career_summary} icon={Zap} />
      <StatTable title="Bowling Career Summary" stats={bowling_career_summary} icon={Trophy} />
    </div>
  );
    
  const CareerInfoView = () => {
    const formats = Object.keys(career_information || {});
    if (formats.length === 0) {
      return (
        <div className="text-center p-8 glass-card rounded-2xl">
          <p className="text-lg font-semibold text-muted-foreground">Career Information not available.</p>
        </div>
      );
    }
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">Debut & History</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {formats.map(format => (
            <div key={format} className="p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border">
              <p className="text-lg font-bold text-foreground mb-3">{format}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Debut</p>
                  <p className="text-sm font-semibold text-primary">{career_information[format]?.debut || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Played</p>
                  <p className="text-sm font-semibold text-primary">{career_information[format]?.last_played || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery="" setSearchQuery={() => {}} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">

          {/* Player Header Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Player Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-glow-md">
                  <img 
                    src={getPlayerImageUrl(faceImageId)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = `https://placehold.co/200x200/1e3a5f/0ea5e9?text=${displayName.charAt(0)}`; 
                    }}
                  />
                </div>
                <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary/40 animate-glow-pulse" />
              </div>

              {/* Player Info */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{displayName}</h1>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-4">
                  <Flag size={16} />
                  <span className="font-medium text-lg">{displayCountry}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <Clock size={16} className="text-primary" />
                    <span className="text-muted-foreground">Born:</span>
                    <span className="font-semibold text-foreground">{info.born || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <Heart size={16} className="text-primary" />
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-semibold text-foreground">{playerRole}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <Zap size={16} className="text-primary" />
                    <span className="text-muted-foreground">Batting:</span>
                    <span className="font-semibold text-foreground">{info.batting_style || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <Trophy size={16} className="text-primary" />
                    <span className="text-muted-foreground">Bowling:</span>
                    <span className="font-semibold text-foreground">{info.bowling_style || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-2 glass-card rounded-xl justify-center sm:justify-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <TabButton tabId="stats" icon={Zap}>Career Stats</TabButton>
            <TabButton tabId="ranking" icon={ListOrdered}>ICC Rankings</TabButton>
            <TabButton tabId="career" icon={Calendar}>Career Info</TabButton>
          </div>

          {/* Content Area */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {activeTab === 'stats' && <StatsView />}
            {activeTab === 'ranking' && <RankingView />}
            {activeTab === 'career' && <CareerInfoView />}
          </div>
        </div>
      </main>

    </div>
  );
};

export default PlayerDetails;