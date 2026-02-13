import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Loader2, AlertTriangle, BarChart3, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEO from './SEO';

// Add this function to generate SEO config based on stat type
const getStatsSEOConfig = (statSlug, formatSlug) => {
  const statTypeMap = {
    'most-runs': 'Most Runs',
    'most-wickets': 'Most Wickets',
    'best-average': 'Best Batting Average',
    'best-strike-rate': 'Best Strike Rate',
    'best-economy': 'Best Bowling Economy',
    'most-sixes': 'Most Sixes',
    'most-fours': 'Most Fours',
    'most-hundreds': 'Most Centuries'
  };

  const statName = statTypeMap[statSlug] || 'Cricket Statistics';
  const format = formatSlug.toUpperCase();
  
  const title = `${statName} in ${format} Cricket - All Time Records`;
  const description = `View ${statName.toLowerCase()} in ${format} cricket. Complete list of all-time leading cricketers with detailed statistics, records, and career performance on Track Wicket by Muchu Venkata Karthik.`;
  const keywords = `${statName}, ${format} cricket stats, cricket records, ${format} statistics, all time records, cricket leaders, ${statSlug} ${format}, Track Wicket stats`;

  return {
    title,
    description,
    keywords,
    canonical: `https://trackwicket.tech/stats/${statSlug}/${formatSlug}`,
    breadcrumbs: [
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Statistics",
        "item": "https://trackwicket.tech/stats"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": statName,
        "item": `https://trackwicket.tech/stats/${statSlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": format,
        "item": `https://trackwicket.tech/stats/${statSlug}/${formatSlug}`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": `${statName} - ${format} Cricket`,
      "description": description,
      "keywords": keywords,
      "sport": "Cricket",
      "url": `https://trackwicket.tech/stats/${statSlug}/${formatSlug}`
    }
  };
};

// Utility function to create a clean slug from a player name for the URL
const createSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const StatsPage = ({ theme, toggleTheme }) => {
    // Note: 'year' parameter is now ignored in UI and navigation handlers
    const { statSlug, formatSlug } = useParams();
    const navigate = useNavigate();
    
    // State management
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const seoConfig = getStatsSEOConfig(statSlug, formatSlug);
    
    // Default to 'all' for API call since the filter is removed
    const currentYear = 'all'; 
    const location = useLocation();
    
    // ... (keep state management and titles mapping)
    const currentFormat = formatSlug || 'odi';
    const currentUrl = `https://trackwicket.tech${location.pathname}`;
    
    // Static mapping for display purposes
    const statTitleMap = {
        'most-runs': 'Most Runs',
        'highest-scores': 'Highest Scores',
        'most-100s': 'Most 100s',
        'most-50s': 'Most 50s',
        'most-wickets': 'Most Wickets',
        'most-5-wickets': 'Most 5-Wicket Hauls'
    };

    // Helper to normalize header names to keys (Assuming backend keys are fixed)
    const getPlayerKey = (header) => {
        const key = header.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (key === 'PLAYER' || key === 'BATTER' || key === 'BOWLER') return 'playerName';
        if (key === 'MATCHES' || key === 'M') return 'M';
        if (key === 'INNS') return 'inns';
        if (key === 'RUNS' || key === 'R') return 'R';
        if (key === 'AVG') return 'avg';
        if (key === 'SR') return 'sr';
        if (key === '4S') return '4s';
        if (key === '6S') return '6s';
        if (key === 'OVERS') return 'O';
        if (key === 'BALLS') return 'balls';
        if (key === 'WKTS') return 'W';
        if (key === '4FERS') return '4fers';
        if (key === '5FERS') return '5fers';
        if (key === 'HHS' || key === 'HS') return 'HS';
        if (key === '100S') return '100s';
        if (key === '50S') return '50s';
        if (key === 'VS') return 'Vs';
        
        return key.toLowerCase();
    };
    
    // Update document title
    useEffect(() => {
        const title = statTitleMap[statSlug] || 'Cricket Records';
        document.title = `${title} - ${currentFormat.toUpperCase()} - Track Wicket`;
        
    }, [statSlug, currentFormat]);

    const displayStatName = statTitleMap[statSlug] || 'Cricket Records';
    const displayFormat = currentFormat.toUpperCase();

    // SEO Dynamic Content
    const dynamicTitle = `${displayStatName} in ${displayFormat} | All-Time Cricket Records - Track Wicket`;
    const dynamicDesc = `Explore the official list of players with the ${displayStatName} in ${displayFormat} cricket history. View detailed statistics, averages, and player rankings on Track Wicket.`;
    
    // Fetch stats data
    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // API call always uses currentYear = 'all'
            console.log(`🔄 Fetching: /api/stats/${statSlug}/${currentFormat}/${currentYear}`);
            
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/stats/${statSlug}/${currentFormat}/${currentYear}`);
            
            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ message: 'Unknown server error.' }));
                throw new Error(`HTTP ${response.status}: ${errorResult.message || response.statusText}`);
            }
            
            const result = await response.json();

            if (result.status === 'success' && result.players) {
                setStatsData(result);
                console.log(`✅ Loaded ${result.players.length} players`);
            } else {
                setError(result.message || 'Failed to load cricket stats.');
                setStatsData(null);
            }
        } catch (err) {
            console.error("❌ Stats Fetch Error:", err);
            setError(err.message || 'Network error: Could not retrieve stats data.');
            setStatsData(null);
        } finally {
            setLoading(false);
        }
    }, [statSlug, currentFormat, currentYear]);

    // Fetch data when parameters change
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    
    // Navigation handlers
    const handleFormatChange = (e) => {
        const newFormat = e.target.value;
        // Navigation is always to the short URL format: /stats/:statSlug/:newFormat
        navigate(`/stats/${statSlug}/${newFormat}`);
    };

    // Removed handleYearChange
    
    const handlePlayerClick = (player) => {
        const playerName = player.playerName; 
        const playerSlug = createSlug(playerName);
        const playerId = player.id; 
        
        // FIX: Only pass playerName. Rely on PlayerDetails to fetch faceImageId via its API call.
        navigate(`/player/${playerSlug}/${playerId}`, {
            state: { 
                playerName: playerName
            }
        });
    };
    
    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery={''} setSearchQuery={() => {}} isMatchDetails={false} />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <Loader2 className="animate-spin w-12 h-12 text-primary mb-4" />
                    <p className="text-foreground text-lg">Loading {statTitleMap[statSlug]} records...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !statsData) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery={''} setSearchQuery={() => {}} isMatchDetails={false} />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-500 text-xl font-semibold mb-2">Could not load stats</p>
                    <p className="text-muted-foreground">{error}</p>
                    <button 
                        onClick={fetchStats}
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    const { title, availableFormats, availableYears, tableHeaders, players } = statsData;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO {...seoConfig} />
            <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>Track Wicket - {seoConfig.title}</h1>
            <Helmet>
                {/* Standard SEO */}
                <title>{dynamicTitle}</title>
                <meta name="description" content={dynamicDesc} />
                <link rel="canonical" href={currentUrl} />
                <meta name="keywords" content={`cricket stats, ${displayStatName}, ${displayFormat} records, top cricket players, cricket history data`} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={dynamicTitle} />
                <meta property="og:description" content={dynamicDesc} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:image" content="https://trackwicket.tech/TW.png" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={dynamicTitle} />
                <meta name="twitter:description" content={dynamicDesc} />

                {/* Dataset Schema (Tells Google this is high-value data) */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Dataset",
                        "name": dynamicTitle,
                        "description": dynamicDesc,
                        "url": currentUrl,
                        "isAccessibleForFree": true,
                        "variableMeasured": displayStatName
                    })}
                </script>
            </Helmet>
            <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery={''} setSearchQuery={() => {}} isMatchDetails={false} />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 flex items-center gap-3">
                            <BarChart3 size={32} className="text-primary" /> 
                            {title}
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {currentFormat.toUpperCase()} Cricket Records (All Time)
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 md:p-6 bg-card/80 rounded-xl shadow-lg border border-border justify-start items-start">
                        
                        {/* Format Filter */}
                        <div className="flex flex-col relative flex-1 min-w-[200px] max-w-[300px]">
                            <label className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                                Match Format
                            </label>
                            <select
                                value={currentFormat}
                                onChange={handleFormatChange}
                                className="w-full appearance-none p-3 bg-background border-2 border-border rounded-lg text-foreground font-semibold focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer pr-10"
                            >
                                {availableFormats
                                    .filter(f => f.slug !== 'all')
                                    .map(f => (
                                        <option key={f.slug} value={f.slug}>
                                            {f.desc.toUpperCase()}
                                        </option>
                                    ))}
                            </select>
                            <ChevronDown size={20} className="absolute right-3 bottom-3.5 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Results Count */}
                        <div className="flex flex-col justify-center sm:ml-auto">
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm text-muted-foreground mb-1 font-medium">Total Results</p>
                                <p className="text-2xl font-extrabold text-primary">{players.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Table */}
                    <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border/50">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        {/* Rank Column */}
                                        <th className="px-4 py-4 text-center text-xs font-extrabold text-primary uppercase tracking-wider w-16 sticky left-0 bg-secondary/50 z-20 border-r border-border">
                                            Rank
                                        </th>
                                        
                                        {/* Dynamic Headers */}
                                        {tableHeaders.map((header, index) => {
                                            const key = getPlayerKey(header);
                                            const isPlayerNameCol = key === 'playerName';
                                            const isNumeric = !isPlayerNameCol && !['vs'].includes(key);

                                            return (
                                                <th 
                                                    key={index} 
                                                    className={`px-4 py-4 text-xs font-extrabold text-foreground uppercase tracking-wider 
                                                        ${isNumeric ? 'text-right' : 'text-left'}
                                                        ${isPlayerNameCol ? 'sticky left-16 bg-secondary/50 z-20 border-r border-border min-w-[200px]' : 'min-w-[100px]'}
                                                    `}
                                                >
                                                    {header}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30 bg-card/80">
                                    {players.map((player, index) => (
                                        <tr 
                                            key={player.id || index} 
                                            className="hover:bg-primary/5 transition-colors duration-150 group"
                                        >
                                            {/* Rank Column */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-primary sticky left-0 bg-card/90 group-hover:bg-primary/5 z-10 border-r border-border">
                                                {index + 1}
                                            </td>
                                            
                                            {/* Data Columns */}
                                            {tableHeaders.map((header, colIndex) => {
                                                const key = getPlayerKey(header);
                                                const isPlayerNameCol = key === 'playerName';
                                                
                                                // Retrieve the value using the corrected key
                                                const value = player[key] || '-';
                                                
                                                const isNumeric = !isPlayerNameCol && !['vs'].includes(key);

                                                return (
                                                    <td 
                                                        key={colIndex} 
                                                        className={`px-4 py-3 whitespace-nowrap text-sm
                                                            ${isNumeric ? 'text-right text-muted-foreground font-medium' : 'text-left'}
                                                            ${isPlayerNameCol ? 'font-bold sticky left-16 bg-card/90 group-hover:bg-primary/5 z-10 border-r border-border' : ''}
                                                        `}
                                                    >
                                                        {isPlayerNameCol ? (
                                                            <button 
                                                                onClick={() => handlePlayerClick(player)} 
                                                                className="text-left text-foreground hover:text-primary transition-colors font-semibold w-full block"
                                                                title={`View profile for ${value}`}
                                                            >
                                                                {value}
                                                            </button>
                                                        ) : (
                                                            value
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {players.length === 0 && (
                                <div className="p-12 text-center">
                                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-muted-foreground">No data found for this selection</p>
                                    <p className="text-sm text-muted-foreground mt-2">Try changing the format or year filters</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatsPage;