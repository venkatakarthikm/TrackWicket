import { useState, useEffect, useMemo, useRef, memo } from "react";
import { Trophy, ArrowRight, Clock, Calendar } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Helmet } from "react-helmet-async";

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

const Upcoming = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getSearchQueryFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");
    return query ? decodeURIComponent(query) : "";
  };

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(getSearchQueryFromUrl());
  const [theme, setTheme] = useState(getInitialTheme);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const pageTitle = "Upcoming Cricket Matches & Schedule";
  const pageDesc = "View upcoming cricket match schedules, fixtures, and timings for IPL, World Cup, and all international matches.";
  const currentUrl = `https://trackwicket.onrender.com${location.pathname}`;

  useEffect(() => {
    setSearchQuery(getSearchQueryFromUrl());
  }, [location.search, location.pathname]);

  useEffect(() => {
    document.title = "Upcoming Cricket Matches - Track Wicket";
  }, []);

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

  const navigateToSeries = (seriesName, allMatches) => {
    const seriesId = allMatches[0]?.seriesId;
    if (seriesId) {
      const seriesSlug = createSlug(seriesName);
      navigate(`/series/${seriesId}/${seriesSlug}`);
    }
  };

  const fetchMatches = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/upcoming-cricket-scores`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.status === "success" && isMountedRef.current) {
        const upcomingMatches = data.upcomingMatches || [];
        setMatches(upcomingMatches);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching upcoming matches:", error);
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

    intervalRef.current = setInterval(() => {
      fetchMatches(false);
    }, 30000); // Update every 30 seconds

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        fetchMatches(false);
        intervalRef.current = setInterval(() => {
          fetchMatches(false);
        }, 30000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const PRIORITY_SERIES = [
    "Indian Premier League 2026",
    "Womens Premier League 2026",
    "Women's Premier League 2026",
    "India",
    "The Ashes",
    "Under-19",
    "Vijay Hazare",
    "ICC",
    "Big Bash League",
    "SA20",
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
        match.venue.toLowerCase().includes(query)
    );
  };

  const getScaledImageUrl = (url, width, height) => {
    return url.replace(/\/\d+x\d+\//, `/${width}x${height}/`);
  };

  const filteredMatches = useMemo(
    () => filterMatches(matches),
    [matches, searchQuery]
  );
  
  const groupedMatches = useMemo(
    () => groupMatchesBySeries(filteredMatches),
    [filteredMatches]
  );

  const MatchCard = memo(({ match }) => {
    const team1Slug = createSlug(match.teams.team1.name);
    const team2Slug = createSlug(match.teams.team2.name);
    const teamsSlug = `${team1Slug}-vs-${team2Slug}`;
    const seriesSlug = createSlug(match.seriesName);
    const detailsPath = `/match/${match.matchId}/${teamsSlug}/${seriesSlug}/live`;

    // Extract actual start time from the startTime field or use match description
    const matchTitle = match.startTime || match.matchDescription;

    return (
      <Link
        to={detailsPath}
        state={{
          description: match.matchDescription,
          seriesName: match.seriesName,
        }}
        className="group p-5 rounded-2xl shadow-xl border border-border bg-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer block relative overflow-hidden"
      >
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-lg">
              <Calendar size={12} />
              Soon
            </div>
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
                    {match.teams.team1.name.replace(match.teams.team1.name.slice(0, match.teams.team1.name.length / 2), '')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">VS</span>
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
                    {match.teams.team2.name.replace(match.teams.team2.name.slice(0, match.teams.team2.name.length / 2), '')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <Clock size={16} className="text-primary" />
              <span>Upcoming Match</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-bold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-lg">
            <Calendar size={16} /> View Details
          </div>
        </div>
      </Link>
    );
  });

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
        </div>
        <div className="h-8 w-full bg-muted/30 rounded-xl"></div>
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="w-14 h-11 bg-muted rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
      <div className="h-10 w-full mb-4 bg-muted rounded-xl"></div>
      <div className="h-12 w-full bg-muted rounded-xl"></div>
    </div>
  );

  const SeriesGroup = memo(({ seriesName, matches }) => {
    const scrollRef = useRef(null);

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
          {matches.length} upcoming {matches.length === 1 ? 'match' : 'matches'} →
        </p>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory overscroll-x-contain scroll-smooth mobile-hide-scrollbar"
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
  });

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
          <div className="text-8xl mb-6 animate-bounce">📅</div>
          <p className="text-2xl font-bold text-foreground mb-3">
            No upcoming matches found
          </p>
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Check back later for scheduled matches"}
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${pageTitle} - Track Wicket`}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={currentUrl} />
        <meta
          name="keywords"
          content="cricket, upcoming matches, cricket schedule, match fixtures, track wicket, cricket calendar"
        />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${pageTitle} | Track Wicket`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={currentUrl} />
        <meta
          property="og:image"
          content="https://trackwicket.onrender.com/TW.png"
        />
        <meta property="og:site_name" content="Track Wicket" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta
          name="twitter:image"
          content="https://trackwicket.onrender.com/TW.png"
        />
        <meta name="twitter:site" content="@TrackWicket" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            description: pageDesc,
            publisher: {
              "@type": "Organization",
              name: "Track Wicket",
              logo: {
                "@type": "ImageObject",
                url: "https://trackwicket.onrender.com/TW.png",
              },
            },
          })}
        </script>
      </Helmet>

      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <p
              className="text-muted-foreground animate-slide-in"
              style={{ animationDelay: "0.1s" }}
            >
              Scheduled cricket matches and fixtures
            </p>
          </div>

          {loading ? renderSkeletons() : renderMatches(groupedMatches)}
        </div>
      </main>
    </div>
  );
};

export default Upcoming;