import { useState, useEffect, useMemo, useRef, memo } from "react";
import { Search, Trophy, ArrowRight, ChevronLeft, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Helmet } from "react-helmet-async";
import SEO from "./SEO";

const createSlug = (text) => {
  if (!text) return "unknown";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPref = window.localStorage.getItem("theme");
    if (typeof storedPref === "string") {
      return storedPref;
    }
    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (userMedia.matches) {
      return "dark";
    }
  }
  return "dark";
};

const getMatchKey = (match) => `${match.matchId}-${match.status}`;

const Home = ({ type = "live" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getSearchQueryFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");
    return query ? decodeURIComponent(query) : "";
  };

  const [isViewingSeries, setIsViewingSeries] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLive = type === "live";
  const pageTitle = isLive
    ? "Live Cricket Scores & Ball-by-Ball Commentary Track Wicket"
    : "Recent Cricket Match Results & Highlights Track Wicket";
  const pageDesc = isLive
    ? "Get fastest live cricket scores, ball-by-ball commentary, and real-time updates for IPL, World Cup, and all international matches."
    : "Catch up on recent cricket match results, scorecards, and series summaries. Never miss the action with Track Wicket.";
  const currentUrl = `https://trackwicket.tech${location.pathname}`;

  const [searchQuery, setSearchQuery] = useState(getSearchQueryFromUrl());
  const [theme, setTheme] = useState(getInitialTheme);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const prevMatchesRef = useRef(new Map());

  // --- START SEO IMPROVEMENTS ---
  const getSEOConfig = () => {
  const commonData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": type === "live" ? "Live Cricket Matches" : "Recent Cricket Results",
    "itemListElement": matches.slice(0, 10).map((match, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SportsEvent",
        "name": `${match.teams.team1.name} vs ${match.teams.team2.name}`,
        "description": match.matchDescription,
        "location": {
          "@type": "Place",
          "name": match.venue
        }
      }
    }))
  };

  if (type === "live") {
    return {
      title: "Live Cricket Scores - Real Time Updates & Commentary | Track Wicket",
      description: "Watch live cricket matches with real-time scores and ball-by-ball commentary. Track ongoing Test, ODI, T20, and IPL matches.",
      keywords: "live cricket score, cricket live, IPL live score, Track Wicket live",
      canonical: "https://trackwicket.tech/live",
      breadcrumbs: [
        { "@type": "ListItem", "position": 2, "name": "Live Scores", "item": "https://trackwicket.tech/live" }
      ],
      structuredData: commonData
    };
  } else {
    return {
      title: "Recent Cricket Matches - Scores & Results | Track Wicket",
      description: "View recently completed cricket match results, scorecards, and summaries on Track Wicket.",
      keywords: "recent cricket matches, cricket results, completed matches, scorecard",
      canonical: "https://trackwicket.tech/recent",
      breadcrumbs: [
        { "@type": "ListItem", "position": 2, "name": "Recent Matches", "item": "https://trackwicket.tech/recent" }
      ],
      structuredData: commonData
    };
  }
};

  const seoConfig = getSEOConfig();
  // --- END SEO IMPROVEMENTS ---

  useEffect(() => {
    setSearchQuery(getSearchQueryFromUrl());
  }, [location.search, location.pathname]);

  useEffect(() => {
    const pageTitle =
      type === "live" ? "Live Cricket Scores" : "Recent Cricket Matches";
    document.title = `${pageTitle} | Track Wicket Get live cricket scores and match results for IPL, World Cup, Test, ODI & T20 matches.`;
  }, [type]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    root.classList.add(theme);
    body.classList.add(theme);
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigateToSeries = (seriesName, allMatches) => {
    const seriesId = allMatches[0]?.seriesId;
    if (seriesId) {
      const seriesSlug = createSlug(seriesName);
      navigate(`/series/${seriesId}/${seriesSlug}`);
    } else {
      setCurrentSeries({ name: seriesName, matches: allMatches });
      setIsViewingSeries(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const params = new URLSearchParams(location.search);
    if (query) {
      params.set("search", encodeURIComponent(query));
    } else {
      params.delete("search");
    }
    window.history.replaceState(
      {},
      "",
      `${location.pathname}?${params.toString()}`
    );
  };

  const fetchMatches = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const endpoint =
        type === "live"
          ? `${process.env.REACT_APP_API_BASE_URL}/live-cricket-scores`
          : `${process.env.REACT_APP_API_BASE_URL}/recent-cricket-scores`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.status === "success" && isMountedRef.current) {
        const newMatches =
          type === "live" ? data.liveMatches || [] : data.recentMatches || [];

        setMatches((prevMatches) => {
          const prevMap = new Map(prevMatches.map((m) => [m.matchId, m]));
          const newMap = new Map(newMatches.map((m) => [m.matchId, m]));
          let hasChanges = prevMatches.length !== newMatches.length;

          if (!hasChanges) {
            for (const match of newMatches) {
              const prevMatch = prevMap.get(match.matchId);
              if (
                !prevMatch ||
                prevMatch.status !== match.status ||
                JSON.stringify(prevMatch.scores) !==
                  JSON.stringify(match.scores)
              ) {
                hasChanges = true;
                break;
              }
            }
          }
          prevMatchesRef.current = newMap;
          return hasChanges ? newMatches : prevMatches;
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(`Error fetching ${type} matches:`, error);
      }
    } finally {
      if (isInitialLoad && isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchMatches(true);
    const pollInterval = type === "live" ? 1000 : 10000;
    intervalRef.current = setInterval(() => {
      fetchMatches(false);
    }, pollInterval);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [type]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        fetchMatches(false);
        const pollInterval = type === "live" ? 1000 : 10000;
        intervalRef.current = setInterval(() => {
          fetchMatches(false);
        }, pollInterval);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [type]);

  const PRIORITY_SERIES = [
    "Indian Premier League 2026",
    "India",
    "ICC",
    "The Ashes",
    "Under-19",
    "Vijay Hazare",
    "Big Bash League",
    "SA20",
    "Womens Premier League 2026",
    "Women's Premier League 2026",
  ];

  const groupMatchesBySeries = (matches) => {
    const grouped = {};
    matches.forEach((match) => {
      if (!grouped[match.seriesName]) {
        grouped[match.seriesName] = [];
      }
      grouped[match.seriesName].push(match);
    });

    const seriesNames = Object.keys(grouped);

    if (type === "recent") {
      seriesNames.sort((a, b) => {
        const getPriorityRank = (name) => {
          const lowerName = name.toLowerCase();
          const index = PRIORITY_SERIES.findIndex((priority) =>
            lowerName.includes(priority.toLowerCase())
          );
          return index === -1 ? Infinity : index;
        };
        const rankA = getPriorityRank(a);
        const rankB = getPriorityRank(b);
        if (rankA < rankB) return -1;
        if (rankA > rankB) return 1;
        return 0;
      });
    }

    const sortedGrouped = {};
    seriesNames.forEach((key) => {
      sortedGrouped[key] = grouped[key];
    });
    return sortedGrouped;
  };

  const filterMatches = (matches) => {
    if (!searchQuery.trim()) return matches;
    const query = searchQuery.toLowerCase();
    return matches.filter(
      (match) =>
        match.seriesName.toLowerCase().includes(query) ||
        match.matchDescription.toLowerCase().includes(query) ||
        match.teams.team1.name.toLowerCase().includes(query) ||
        match.teams.team2.name.toLowerCase().includes(query) ||
        match.teams.team1.sName.toLowerCase().includes(query) ||
        match.teams.team2.sName.toLowerCase().includes(query) ||
        match.venue.toLowerCase().includes(query) ||
        match.status.toLowerCase().includes(query)
    );
  };

  const getScaledImageUrl = (url, width, height) => {
    return url.replace(/\/\d+x\d+\//, `/${width}x${height}/`);
  };

  const getFormatBadgeColor = (format) => {
    switch (format?.toUpperCase()) {
      case "T20":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "ODI":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "TEST":
        return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700 text-white";
    }
  };

  const filteredMatches = useMemo(
    () => filterMatches(matches),
    [matches, searchQuery]
  );
  const groupedMatches = useMemo(
    () => groupMatchesBySeries(filteredMatches),
    [filteredMatches]
  );

  const AnimatedScore = memo(({ value, className = "" }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
      if (displayValue !== value) {
        setIsUpdating(true);
        const timer = setTimeout(() => {
          setDisplayValue(value);
          setIsUpdating(false);
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [value, displayValue]);

    return (
      <span
        className={`inline-block transition-all duration-300 ${isUpdating ? "scale-110 text-primary" : ""} ${className}`}
      >
        {displayValue}
      </span>
    );
  });

  const MatchCard = memo(
    ({ match }) => {
      const team1Slug = createSlug(match.teams.team1.name);
      const team2Slug = createSlug(match.teams.team2.name);
      const teamsSlug = `${team1Slug}-vs-${team2Slug}`;
      const seriesSlug = createSlug(match.seriesName);
      const detailsPath = `/match/${match.matchId}/${teamsSlug}/${seriesSlug}/live`;

      return (
        <Link
          to={detailsPath}
          state={{
            description: match.matchDescription,
            seriesName: match.seriesName,
          }}
          className="group p-5 rounded-2xl shadow-xl border border-border bg-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer block relative overflow-hidden"
          // SEO: Semantic schema markup
          itemScope 
          itemType="https://schema.org/SportsEvent"
        >
          {/* SEO Metadata */}
          <meta itemProp="name" content={`${match.teams.team1.name} vs ${match.teams.team2.name}`} />
          <meta itemProp="description" content={match.matchDescription} />
          <meta itemProp="sport" content="Cricket" />

          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {match.matchDescription}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {match.venue}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${getFormatBadgeColor(match.matchFormat)}`}
              >
                {match.matchFormat}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={getScaledImageUrl(match.teams.team1.imageUrl, 80, 60)}
                    alt={`${match.teams.team1.name} team flag`}
                    className="w-14 h-11 object-contain flex-shrink-0 rounded-lg"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base truncate">
                      {match.teams.team1.sName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {match.teams.team1.name}
                    </p>
                  </div>
                </div>
                {match.scores?.[0] && (
                  <AnimatedScore
                    value={match.scores[0]}
                    className="font-extrabold text-foreground text-lg whitespace-nowrap"
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={getScaledImageUrl(match.teams.team2.imageUrl, 80, 60)}
                    alt={`${match.teams.team2.name} team flag`}
                    className="w-14 h-11 object-contain flex-shrink-0 rounded-lg"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base truncate">
                      {match.teams.team2.sName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {match.teams.team2.name}
                    </p>
                  </div>
                </div>
                {match.scores?.[1] && (
                  <AnimatedScore
                    value={match.scores[1]}
                    className="font-extrabold text-foreground text-lg whitespace-nowrap"
                  />
                )}
              </div>
            </div>

            <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <AnimatedScore
                value={match.status}
                className="text-sm font-semibold text-foreground text-center block"
              />
            </div>

            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-bold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-lg">
              <Zap size={16} /> View Details
            </div>
          </div>
        </Link>
      );
    },
    (prevProps, nextProps) => {
      const prevMatch = prevProps.match;
      const nextMatch = nextProps.match;
      return (
        prevMatch.matchId === nextMatch.matchId &&
        prevMatch.status === nextMatch.status &&
        JSON.stringify(prevMatch.scores) === JSON.stringify(nextProps.match.scores) &&
        prevMatch.matchDescription === nextMatch.matchDescription &&
        prevMatch.venue === nextMatch.venue
      );
    }
  );

  const SkeletonCard = () => (
    <div className="p-5 rounded-2xl shadow-xl border border-border bg-card animate-pulse">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-muted rounded"></div>
          <div className="h-3 w-1/2 bg-muted rounded"></div>
        </div>
        <div className="h-7 w-20 bg-muted rounded-full"></div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="w-14 h-11 bg-muted rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-5 w-16 bg-muted rounded"></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="w-14 h-11 bg-muted rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-5 w-16 bg-muted rounded"></div>
        </div>
      </div>
      <div className="h-10 w-full mb-4 bg-muted rounded-xl"></div>
      <div className="h-12 w-full bg-muted rounded-xl"></div>
    </div>
  );

  const SeriesGroup = memo(
    ({ seriesName, matches }) => {
      const scrollRef = useRef(null);
      const [showScrollbar, setShowScrollbar] = useState(false);

      useEffect(() => {
        setShowScrollbar(matches.length > 3);
      }, [matches.length]);

      if (matches.length < 1) return null;

      return (
        <div className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-5 p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div
              onClick={() => navigateToSeries(seriesName, matches)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80"
            >
              <Trophy className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-foreground">
                {seriesName}
              </h2>
            </div>

            <button
              onClick={() => navigateToSeries(seriesName, matches)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:gap-3"
            >
              View Series
              <ArrowRight size={18} />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            Swipe to see recent {matches.length} matches →
          </p>

          <div className="relative">
            <div
              ref={scrollRef}
              className={`flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory overscroll-x-contain scroll-smooth ${
                showScrollbar ? "custom-scrollbar" : "mobile-hide-scrollbar"
              }`}
            >
              {matches.map((match) => (
                <div
                  key={match.matchId}
                  className="flex-shrink-0 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] snap-start"
                >
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      if (prevProps.seriesName !== nextProps.seriesName) return false;
      if (prevProps.matches.length !== nextProps.matches.length) return false;
      for (let i = 0; i < prevProps.matches.length; i++) {
        if (
          prevProps.matches[i].matchId !== nextProps.matches[i].matchId ||
          prevProps.matches[i].status !== nextProps.matches[i].status ||
          JSON.stringify(prevProps.matches[i].scores) !== JSON.stringify(nextProps.matches[i].scores)
        ) {
          return false;
        }
      }
      return true;
    }
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );

  const renderMatches = (groupedMatches) => {
    const seriesNames = Object.keys(groupedMatches);
    if (seriesNames.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">🏏</div>
          <p className="text-2xl font-bold text-foreground mb-3">
            No matches found
          </p>
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Check back later for updates"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {seriesNames.map((seriesName) => (
          <SeriesGroup
            key={seriesName}
            seriesName={seriesName}
            matches={groupedMatches[seriesName]}
          />
        ))}
      </div>
    );
  };

  const SeriesMatchesView = ({ series, onBack }) => (
    <div className="pb-8 animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-200 font-semibold hover:gap-3 shadow-lg"
        >
          <ChevronLeft size={20} />
          Back to {type === "live" ? "Live Matches" : "Recent Matches"}
        </button>

        <div className="flex items-center gap-4 mb-8 p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/30">
          <Trophy className="text-primary" size={32} />
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              {series.name}
            </h1>
            <span className="text-lg text-muted-foreground">
              {series.matches.length} Total Matches
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.matches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SEO INTEGRATION */}
      <SEO {...seoConfig} />
      
      {/* HIDDEN H1 FOR SEARCH ENGINES */}
      <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Track Wicket - {type === "live" ? "Live Cricket Scores" : type === "recent" ? "Recent Match Results" : "Cricket Matches"}
      </h1>

      <Helmet>
        <title>{`${pageTitle} - Track Wicket`}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={currentUrl} />
        <meta
          name="keywords"
          content={`cricket, ${isLive ? "live score, t20 live, ipl live" : "match results, cricket highlights"}, track wicket, ball by ball`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${pageTitle} | Track Wicket`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:image" content="https://trackwicket.tech/TW.png" />
        <meta property="og:site_name" content="Track Wicket" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content="https://trackwicket.tech/TW.png" />
        <meta name="twitter:site" content="@TrackWicket" />
      </Helmet>

      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        isMatchDetails={isViewingSeries}
      />

      <main className="flex-1">
        {isViewingSeries && currentSeries ? (
          <SeriesMatchesView
            series={currentSeries}
            onBack={() => {
              setIsViewingSeries(false);
              setCurrentSeries(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <p
                className="text-muted-foreground animate-slide-in"
                style={{ animationDelay: "0.1s" }}
              >
                {type === "live"
                  ? "Live scores and updates"
                  : "Recently completed matches"}
              </p>
            </div>

            {loading ? renderSkeletons() : renderMatches(groupedMatches)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;