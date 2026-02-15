import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Filter,
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  Trophy,
  Calendar,
  MapPin,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import Navbar from "./Navbar";
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
    const userMedia = window.matchMedia("(prefers-color-scheme: light)");
    if (userMedia.matches) {
      return "light";
    }
  }
  return "light";
};

const formatScore = (scoreObj) => {
  if (!scoreObj) return null;
  const inngs = Object.values(scoreObj)[0];
  if (!inngs) return null;
  return `${inngs.runs}/${inngs.wickets} (${inngs.overs})`;
};

const SeriesView = () => {
  const { seriesId, tab } = useParams();
  const navigate = useNavigate();
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tab || "matches");

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

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab,activeTab]);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          setSeriesData(data);
        } else {
          setError("Failed to load series details");
        }
      } catch (err) {
        console.error("Error fetching series details:", err);
        setError("Failed to load series details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (seriesId) {
      fetchSeriesDetails();
    }
  }, [seriesId]);

  // Add this function to generate series-specific SEO
  const getSeriesSEOConfig = (seriesData) => {
    if (!seriesData) {
      return {
        title: "Cricket Series - Track Wicket",
        description:
          "View cricket series details, standings, and match schedules on Track Wicket.",
        keywords:
          "cricket series, series standings, cricket tournament, Track Wicket",
        canonical: window.location.href,
      };
    }

    const seriesName = seriesData.seriesName || "Cricket Series";
    const year = seriesData.year || new Date().getFullYear();

    const title = `${seriesName} - Matches, Points Table & Schedule`;
    const description = `Complete coverage of ${seriesName} ${year}. View live scores, match schedule, points table, team standings, and series statistics on Track Wicket by Muchu Venkata Karthik.`;
    const keywords = `${seriesName}, ${seriesName} ${year}, cricket series, points table, series schedule, team standings, ${seriesName} matches, Track Wicket series`;

    return {
      title,
      description,
      keywords,
      canonical: window.location.href,
      breadcrumbs: [
        {
          "@type": "ListItem",
          position: 2,
          name: "Series",
          item: "https://trackwicket.tech/series",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: seriesName,
          item: window.location.href,
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SportsOrganization",
        name: seriesName,
        sport: "Cricket",
        description: description,
        url: window.location.href,
        event: {
          "@type": "SportsEvent",
          name: `${seriesName} ${year}`,
          sport: "Cricket",
        },
      },
    };
  };

  const seoConfig = getSeriesSEOConfig(seriesData);
  const handleTabChange = (newTab) => {
    const seriesSlug = createSlug(seriesData?.seriesName || "series");
    navigate(`/series/${seriesId}/${seriesSlug}/${newTab}`);
    setActiveTab(newTab);
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

  const getMatchStatusColor = (status) => {
    if (status.toLowerCase().includes("live")) {
      return "text-red-600 dark:text-red-400";
    } else if (
      status.toLowerCase().includes("won") ||
      status.toLowerCase().includes("complete")
    ) {
      return "text-green-600 dark:text-green-400";
    } else {
      return "text-blue-600 dark:text-blue-400";
    }
  };

  const filteredMatches = useMemo(() => {
    if (!seriesData?.matches) return [];
    if (!searchQuery.trim()) return seriesData.matches;

    const query = searchQuery.toLowerCase();
    return seriesData.matches.filter(
      (match) =>
        match.matchDescription?.toLowerCase().includes(query) ||
        match.teams.team1?.name?.toLowerCase().includes(query) ||
        match.teams.team2?.name?.toLowerCase().includes(query) ||
        match.venue?.toLowerCase().includes(query) ||
        match.status?.toLowerCase().includes(query),
    );
  }, [seriesData, searchQuery]);

  const MatchCard = ({ match }) => {
    const team1Slug = createSlug(match.teams.team1.name);
    const team2Slug = createSlug(match.teams.team2.name);
    const teamsSlug = `${team1Slug}-vs-${team2Slug}`;
    const seriesSlug = createSlug(seriesData.seriesName);
    const detailsPath = `/match/${match.matchId}/${teamsSlug}/${seriesSlug}/live`;

    const team1Score = formatScore(match.scores?.team1Score);
    const team2Score = formatScore(match.scores?.team2Score);

    return (
      <div
        onClick={() =>
          navigate(detailsPath, {
            state: {
              description: match.matchDescription,
              seriesName: seriesData.seriesName,
            },
          })
        }
        className="group p-5 rounded-2xl shadow-xl border border-border bg-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {match.matchDescription}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin size={12} />
                <p className="line-clamp-1">
                  {match.venue}
                  {match.city ? `, ${match.city}` : ""}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${getFormatBadgeColor(
                match.matchFormat,
              )}`}
            >
              {match.matchFormat}
            </span>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {match.teams.team1.imageUrl && (
                  <img
                    src={getScaledImageUrl(match.teams.team1.imageUrl, 80, 60)}
                    alt={match.teams.team1.name}
                    className="w-14 h-11 object-contain flex-shrink-0 rounded-lg"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base truncate">
                    {match.teams.team1.sName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {match.teams.team1.name}
                  </p>
                </div>
              </div>
              {team1Score && (
                <span className="font-extrabold text-foreground text-lg whitespace-nowrap">
                  {team1Score}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {match.teams.team2.imageUrl && (
                  <img
                    src={getScaledImageUrl(match.teams.team2.imageUrl, 80, 60)}
                    alt={match.teams.team2.name}
                    className="w-14 h-11 object-contain flex-shrink-0 rounded-lg"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base truncate">
                    {match.teams.team2.sName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {match.teams.team2.name}
                  </p>
                </div>
              </div>
              {team2Score && (
                <span className="font-extrabold text-foreground text-lg whitespace-nowrap">
                  {team2Score}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <p
              className={`text-sm font-semibold text-center ${getMatchStatusColor(
                match.status,
              )}`}
            >
              {match.status}
            </p>
          </div>

          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-bold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-lg">
            <Zap size={16} /> View Details
          </div>
        </div>
      </div>
    );
  };

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="text-8xl mb-6">⚠️</div>
          <p className="text-2xl font-bold text-foreground mb-3">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "matches":
        return (
          <MatchesTab matches={filteredMatches} searchQuery={searchQuery} />
        );
      case "points-table":
        return <PointsTableTab seriesId={seriesId} />;
      case "stats":
        return <StatsTab seriesId={seriesId} />;
      case "squads":
        return <SquadsTab seriesId={seriesId} />;
      default:
        return <DefaultTab />;
    }
  };

  const MatchesTab = ({ matches, searchQuery }) => {
    const [selectedTeam, setSelectedTeam] = useState("all");
    const [isOpen, setIsOpen] = useState(false);
    const [internalSearch, setInternalSearch] = useState("");
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // 1. Extract Unique Teams
    const uniqueTeams = useMemo(() => {
      const teams = new Set();
      matches.forEach((m) => {
        const t1 = m.teams?.team1?.name;
        const t2 = m.teams?.team2?.name;
        if (t1) teams.add(t1);
        if (t2) teams.add(t2);
      });
      return Array.from(teams).sort();
    }, [matches]);

    // 2. Filter list for the dropdown search
    const displayedTeams = uniqueTeams.filter((team) =>
      team.toLowerCase().includes(internalSearch.toLowerCase()),
    );

    // 3. Final filtered matches for the grid
    const filteredMatches = useMemo(() => {
      return matches.filter((m) => {
        if (selectedTeam === "all") return true;
        const t1 = m.teams?.team1?.name;
        const t2 = m.teams?.team2?.name;
        return t1 === selectedTeam || t2 === selectedTeam;
      });
    }, [matches, selectedTeam]);

    if (matches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-8xl mb-6">🏏</div>
          <p className="text-2xl font-bold text-foreground mb-3">
            No matches found
          </p>
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "No matches available for this series"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SEO {...seoConfig} />
        {/* PREMIUM FILTER HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm ring-1 ring-black/[0.02]">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Filter size={20} className="text-primary" />
            </div>
            <div>
              <span className="block font-bold text-sm text-foreground leading-none mb-1">
                Filter by Team
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                Match Selection
              </span>
            </div>
          </div>

          {/* CUSTOM DROPDOWN CONTAINER */}
          <div className="relative w-full sm:w-72" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
              ${
                isOpen
                  ? "bg-background border-primary ring-4 ring-primary/10 shadow-lg"
                  : "bg-secondary/30 border-border border hover:bg-secondary/50"
              }
            `}
            >
              <span className="truncate">
                {selectedTeam === "all"
                  ? `All Teams (${uniqueTeams.length})`
                  : selectedTeam}
              </span>
              <ChevronDown
                size={18}
                className={`text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
              <div className="absolute z-50 mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Internal Search Input */}
                <div className="p-2 border-b border-border bg-muted/20">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Search team..."
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      value={internalSearch}
                      onChange={(e) => setInternalSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Options List */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedTeam("all");
                      setIsOpen(false);
                      setInternalSearch("");
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 transition-colors text-left"
                  >
                    <span
                      className={
                        selectedTeam === "all"
                          ? "text-primary font-bold"
                          : "text-foreground font-medium"
                      }
                    >
                      All Teams
                    </span>
                    {selectedTeam === "all" && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>

                  {displayedTeams.map((team) => (
                    <button
                      key={team}
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsOpen(false);
                        setInternalSearch("");
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 transition-colors text-left border-t border-border/40"
                    >
                      <span
                        className={
                          selectedTeam === team
                            ? "text-primary font-bold"
                            : "text-foreground font-medium"
                        }
                      >
                        {team}
                      </span>
                      {selectedTeam === team && (
                        <Check size={16} className="text-primary" />
                      )}
                    </button>
                  ))}

                  {displayedTeams.length === 0 && (
                    <div className="px-4 py-10 text-center">
                      <p className="text-muted-foreground text-xs italic">
                        No teams found matching "{internalSearch}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MATCHES GRID */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border shadow-inner">
            <Users
              size={48}
              className="mx-auto text-muted-foreground mb-4 opacity-20"
            />
            <p className="text-muted-foreground font-medium text-lg">
              No matches found for{" "}
              <span className="text-primary font-black underline decoration-primary/30">
                {selectedTeam}
              </span>
            </p>
            <button
              onClick={() => setSelectedTeam("all")}
              className="mt-6 px-8 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    );
  };

  const DefaultTab = () => {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <SEO {...seoConfig} />
        <div className="text-8xl mb-6">🏆</div>
        <p className="text-2xl font-bold text-foreground mb-3">
          Welcome to Series Overview
        </p>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          Select a tab above to view matches, points table, stats, or squad
          information
        </p>
      </div>
    );
  };

  const SquadsTab = ({ seriesId }) => {
    const [teamsData, setTeamsData] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [squadData, setSquadData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [squadLoading, setSquadLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch teams list
    useEffect(() => {
      const fetchTeams = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}/squads`,
          );
          const data = await response.json();

          if (data.status === "success") {
            setTeamsData(data);
            // Auto-select first team
            if (data.teams && data.teams.length > 0) {
              setSelectedTeam(data.teams[0]);
            }
          } else {
            setError("Squads not available for this series");
          }
        } catch (err) {
          console.error("Error fetching teams:", err);
          setError("Failed to load squads");
        } finally {
          setLoading(false);
        }
      };

      fetchTeams();
    }, [seriesId]);

    // Fetch squad when team is selected
    useEffect(() => {
      if (!selectedTeam) return;

      const fetchSquad = async () => {
        setSquadLoading(true);

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}/squads/${selectedTeam.squadId}`,
          );
          const data = await response.json();

          if (data.status === "success") {
            setSquadData(data);
          } else {
            setSquadData(null);
          }
        } catch (err) {
          console.error("Error fetching squad:", err);
          setSquadData(null);
        } finally {
          setSquadLoading(false);
        }
      };

      fetchSquad();
    }, [selectedTeam, seriesId]);

    const handleTeamSelect = (team) => {
      setSelectedTeam(team);
      setSquadData(null);
    };

    if (loading) {
      return (
        <div className="space-y-6">
          <SEO {...seoConfig} />
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-muted rounded mb-6"></div>
            <div className="flex gap-4 mb-8 overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 w-32 bg-muted rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-muted/30 rounded-xl"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="text-8xl mb-6">👥</div>
          <p className="text-2xl font-bold text-foreground mb-3">{error}</p>
        </div>
      );
    }

    if (!teamsData?.teams || teamsData.teams.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="text-8xl mb-6">👥</div>
          <p className="text-2xl font-bold text-foreground mb-3">
            No Squads Available
          </p>
          <p className="text-lg text-muted-foreground">
            Squad information is not available for this series
          </p>
        </div>
      );
    }

    // Group players by category
    const groupedPlayers =
      squadData?.players?.reduce((acc, player) => {
        if (player.isHeader) {
          acc.push({ header: player.name, players: [] });
        } else if (acc.length > 0) {
          acc[acc.length - 1].players.push(player);
        }
        return acc;
      }, []) || [];

    return (
      <div className="space-y-6">
        <SEO {...seoConfig} />
        {/* Team Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" size={28} />
            Select Team
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {teamsData.teams.map((team) => (
              <button
                key={team.squadId}
                onClick={() => handleTeamSelect(team)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 min-w-[120px] ${
                  selectedTeam?.squadId === team.squadId
                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                {team.imageUrl && (
                  <img
                    src={team.imageUrl}
                    alt={team.teamName}
                    className="w-16 h-12 object-contain"
                    loading="lazy"
                  />
                )}
                <span className="text-sm font-bold text-foreground text-center">
                  {team.teamName}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Squad Display */}
        {squadLoading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted/30 rounded-xl"></div>
          </div>
        ) : squadData ? (
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: "url(/cricbg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8">
              {/* Team Header */}
              <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b-2 border-white/30">
                {selectedTeam?.imageUrl && (
                  <img
                    src={selectedTeam.imageUrl}
                    alt={selectedTeam.teamName}
                    className="w-20 h-16 object-contain"
                  />
                )}
                <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                  {selectedTeam?.teamName}
                </h2>
              </div>

              {/* Players Grid */}
              <div className="space-y-8">
                {groupedPlayers.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-4">
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-primary/80 to-accent/80 px-4 py-2 rounded-lg">
                      <h3 className="text-xl font-bold text-white drop-shadow-md">
                        {group.header}
                      </h3>
                    </div>

                    {/* Players Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.players.map((player, playerIdx) => (
                        <div
                          key={playerIdx}
                          className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:from-white/20 hover:to-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                          {/* Player Image */}
                          <div className="flex items-center gap-4 mb-3">
                            {player.imageUrl && (
                              <div className="relative">
                                <img
                                  src={player.imageUrl}
                                  alt={player.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30 group-hover:border-primary/80 transition-all"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                {player.captain && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                                    C
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm sm:text-base truncate drop-shadow-md">
                                {player.name}
                              </h4>
                              <p className="text-xs text-white/80 truncate">
                                {player.role}
                              </p>
                            </div>
                          </div>

                          {/* Player Details */}
                          <div className="space-y-1 text-xs text-white/90">
                            {player.battingStyle && (
                              <div className="flex items-start gap-2">
                                <span className="text-white/60 min-w-[50px]">
                                  Bat:
                                </span>
                                <span className="flex-1 font-medium">
                                  {player.battingStyle}
                                </span>
                              </div>
                            )}
                            {player.bowlingStyle && (
                              <div className="flex items-start gap-2">
                                <span className="text-white/60 min-w-[50px]">
                                  Bowl:
                                </span>
                                <span className="flex-1 font-medium">
                                  {player.bowlingStyle}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Players Count */}
              <div className="mt-8 pt-6 border-t-2 border-white/30 text-center">
                <p className="text-white/80 font-semibold">
                  Total Players:{" "}
                  {squadData.players.filter((p) => !p.isHeader).length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-xl font-semibold text-muted-foreground">
              Select a team to view squad
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO {...seoConfig} />
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isMatchDetails={true}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <>
              <div className="h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/30 animate-pulse mb-8"></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/30 shadow-lg">
                <Trophy className="text-primary flex-shrink-0" size={40} />
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-foreground break-words text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
                    {seriesData?.seriesName}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className="text-sm md:text-base">
                        {seriesData?.totalMatches || 0} Total Matches
                      </span>
                    </div>
                    {searchQuery && activeTab === "matches" && (
                      <span className="text-sm md:text-base">
                        • {filteredMatches.length} matches found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* HYBRID TABS: Pinned Mobile / Compact Desktop */}
<div className="mb-6 w-full">
  <div className="
    /* Mobile: 5-column grid that fills the width */
    grid grid-cols-5 
    /* Desktop: Natural flex row that fits content */
    sm:flex sm:w-fit sm:mx-auto 
    bg-secondary/30 p-1 rounded-xl border border-border
  ">
    {[
      { id: "default", label: "Info" },
      { id: "matches", label: "Matches" },
      { id: "points-table", label: "Points" },
      { id: "stats", label: "Stats" },
      { id: "squads", label: "Squads" },
    ].map((t) => (
      <button
        key={t.id}
        onClick={() => handleTabChange(t.id)}
        className={`
          flex items-center justify-center py-2.5 px-2 sm:px-6 rounded-lg transition-all duration-300
          ${
            activeTab === t.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }
        `}
      >
        <span className="text-[10px] xs:text-[11px] sm:text-sm font-black uppercase tracking-tighter sm:tracking-normal whitespace-nowrap">
          {t.label}
        </span>
      </button>
    ))}
  </div>
</div>
            </>
          )}

          <div className="w-full max-w-full overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

// Points Table Component
const PointsTableTab = ({ seriesId }) => {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    const fetchPointsTable = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}/points-table`,
        );
        const data = await response.json();
        if (data.status === "success") {
          setPointsData(data);
        } else {
          setError("Points table not available for this series");
        }
      } catch (err) {
        setError("Failed to load points table");
      } finally {
        setLoading(false);
      }
    };
    fetchPointsTable();
  }, [seriesId]);

  const createSlug = (text) => {
    return text
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const toggleExpand = (id) => {
    setExpandedTeam(expandedTeam === id ? null : id);
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium animate-pulse">
        Loading points table...
      </div>
    );
  if (error)
    return (
      <div className="py-20 text-center font-bold text-red-500">{error}</div>
    );

  return (
    <div className="space-y-6 pb-20 w-full max-w-full overflow-x-hidden">
      {pointsData.tables.map((table, tableIdx) => (
        <div key={tableIdx} className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 px-2">
            <Award className="text-primary" size={24} />
            {table.groupName}
          </h2>

          <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">
                  <th className="w-[8%] py-3 text-center">#</th>
                  <th className="w-[34%] py-3 text-left pl-2">Team</th>
                  <th className="w-[10%] py-3 text-center">M</th>
                  <th className="w-[10%] py-3 text-center">W</th>
                  <th className="w-[10%] py-3 text-center">L</th>
                  <th className="w-[12%] py-3 text-center">Pts</th>
                  <th className="w-[16%] py-3 text-center pr-2">NRR</th>
                </tr>
              </thead>
              <tbody>
                {table.teams.map((team, teamIdx) => {
                  const teamRowId = `${tableIdx}-${teamIdx}`;
                  const isExpanded = expandedTeam === teamRowId;

                  return (
                    <React.Fragment key={teamIdx}>
                      <tr
                        onClick={() => toggleExpand(teamRowId)}
                        className={`border-b border-border transition-all cursor-pointer select-none
                          ${
                            isExpanded
                              ? "bg-primary/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                              : "hover:bg-secondary/20"
                          }`}
                      >
                        <td className={`py-4 text-center text-[11px] md:text-sm font-medium ${isExpanded ? "text-primary" : "text-muted-foreground"}`}>
                          {team.position}
                        </td>
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-1.5 md:gap-3">
                            <img
                              src={team.imageUrl}
                              alt=""
                              className={`w-5 h-3.5 md:w-7 md:h-5 rounded-sm object-cover border transition-transform ${isExpanded ? "border-primary scale-110 shadow-sm" : "border-border"}`}
                            />
                            <span className={`text-[11px] md:text-base truncate transition-colors ${isExpanded ? "font-black text-primary" : "font-bold text-foreground"}`}>
                              {team.team}
                            </span>
                          </div>
                        </td>
                        <td className={`py-4 text-center text-[11px] md:text-sm ${isExpanded ? "font-bold" : ""}`}>
                          {team.matches}
                        </td>
                        <td className={`py-4 text-center text-[11px] md:text-sm text-green-600 font-bold ${isExpanded ? "scale-110 transition-transform" : ""}`}>
                          {team.won}
                        </td>
                        <td className={`py-4 text-center text-[11px] md:text-sm text-red-500 font-bold ${isExpanded ? "scale-110 transition-transform" : ""}`}>
                          {team.lost}
                        </td>
                        <td className={`py-4 text-center text-[11px] md:text-sm font-black ${isExpanded ? "text-primary" : "text-foreground"}`}>
                          {team.points}
                        </td>
                        <td className={`py-4 text-center text-[10px] md:text-sm font-medium pr-2 ${isExpanded ? "text-foreground" : "text-muted-foreground"}`}>
                          {team.nrr}
                        </td>
                      </tr>

                      {/* DROPDOWN AREA - MATCH CARDS UPDATED FOR MOBILE */}
                      {isExpanded && (
                        <tr className="bg-primary/[0.04]">
                          <td colSpan="7" className="p-2 md:p-6 border-b border-primary/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                              {team.matchList.map((match, mIdx) => {
                                const matchSlug = createSlug(`${team.team}-vs-${match.opponent}`);
                                const seriesSlug = createSlug(pointsData.seriesName);
                                const matchUrl = `/match/${match.matchId}/${matchSlug}/${seriesSlug}/live`;
                                const isCompleted = match.result && match.result.trim() !== "";

                                return (
                                  <a
                                    key={mIdx}
                                    href={matchUrl}
                                    onClick={(e) => e.stopPropagation()}
                                    className="group bg-card border border-border rounded-lg p-3 md:p-5 flex flex-col justify-between hover:border-primary hover:shadow-lg transition-all duration-300"
                                  >
                                    <div className="flex justify-between items-start mb-2 md:mb-3">
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-0.5 bg-muted rounded">
                                          <img
                                            src={match.opponentImageUrl}
                                            alt=""
                                            className="w-6 h-4 md:w-10 md:h-7 object-cover rounded shadow-sm"
                                          />
                                        </div>
                                        <div>
                                          <p className="text-[9px] md:text-xs font-black text-primary uppercase tracking-tighter md:tracking-widest">
                                            vs {match.opponentShortName}
                                          </p>
                                          <p className="text-[11px] md:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                            {match.matchName}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={`text-[8px] md:text-[11px] px-1.5 py-0.5 rounded font-black uppercase ${match.resultStatus === "Won" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                        {match.resultStatus}
                                      </span>
                                    </div>

                                    {isCompleted ? (
                                      <div className="mt-1 md:mt-2 pt-2 md:pt-3 border-t border-border/60 flex items-center justify-between">
                                        <p className="text-[10px] md:text-sm text-foreground font-bold italic leading-tight">
                                          {match.result}
                                        </p>
                                        <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                                          <ChevronRight size={12} className="md:w-4 md:h-4" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-1 flex items-center justify-between text-muted-foreground border-t border-border/40 pt-1">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar size={10} className="md:w-3.5 md:h-3.5" />
                                          <p className="text-[9px] md:text-xs font-medium">
                                            {match.date}
                                          </p>
                                        </div>
                                        <ChevronRight size={12} />
                                      </div>
                                    )}
                                  </a>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Component
const StatsTab = ({ seriesId }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatType, setActiveStatType] = useState("mostRuns");

  const statTypes = {
    batting: [
      { key: "mostRuns", label: "Most Runs" },
      { key: "highestScore", label: "Highest Score" },
      { key: "highestAvg", label: "Best Average" },
      { key: "highestSr", label: "Best Strike Rate" },
      { key: "mostHundreds", label: "Most 100s" },
      { key: "mostFifties", label: "Most 50s" },
      { key: "mostFours", label: "Most 4s" },
      { key: "mostSixes", label: "Most 6s" },
      { key: "mostNineties", label: "Most 90s" },
    ],
    bowling: [
      { key: "mostWickets", label: "Most Wickets" },
      { key: "lowestAvg", label: "Best Average" },
      { key: "bestBowlingInnings", label: "Best Figures" },
      { key: "mostFiveWickets", label: "Most 5W" },
      { key: "lowestEcon", label: "Best Economy" },
      { key: "lowestSr", label: "Best Strike Rate" },
    ],
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}/stats/${activeStatType}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          setStatsData(data.data);
        } else {
          setError("Stats not available");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [seriesId, activeStatType]);

  const renderStatsTable = () => {
    if (!statsData) return null;

    // The API returns data inside keys like 't20StatsList', 'odiStatsList', or 'testStatsList'
    // We find the first key that ends with 'StatsList'
    const listKey = Object.keys(statsData).find((key) =>
      key.endsWith("StatsList"),
    );
    const targetData = statsData[listKey];

    if (!targetData || !targetData.values || targetData.values.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl font-semibold text-muted-foreground">
            No data available for this stat
          </p>
        </div>
      );
    }

    const headers = targetData.headers || [];

    return (
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Mobile-optimized table with fixed position column and player name */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary/10 border-b border-border">
                {/* Position column - sticky on left */}
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-foreground bg-primary/10  z-20 min-w-[50px]">
                  #
                </th>
                {/* Player name - sticky on left after position */}
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-foreground bg-primary/10 sticky left-0 z-20 min-w-[140px] sm:min-w-[180px] shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                  {headers[0] || "Player"}
                </th>
                {/* Rest of headers - scrollable */}
                {headers.slice(1).map((header, idx) => (
                  <th
                    key={idx}
                    className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-bold text-foreground whitespace-nowrap bg-primary/10 min-w-[80px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {targetData.values.map((row, rowIdx) => {
                // Extract player ID (first element) and apply -123456 offset
                const playerId =
                  row.values.length > headers.length
                    ? parseInt(row.values[0]) - 123456
                    : null;

                // Get display values (skip ID if present)
                const displayValues =
                  row.values.length > headers.length
                    ? row.values.slice(1)
                    : row.values;

                return (
                  <tr
                    key={rowIdx}
                    className="border-b border-border hover:bg-secondary/20 transition-colors"
                  >
                    {/* Position column - sticky */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground bg-card z-10">
                      {rowIdx + 1}
                    </td>
                    {/* Player name - sticky with shadow */}
                    <td
                      className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-primary bg-card sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]"
                      data-player-id={playerId}
                    >
                      <div
                        className="truncate max-w-[120px] sm:max-w-[160px]"
                        title={displayValues[0]}
                      >
                        {displayValues[0]}
                      </div>
                    </td>
                    {/* Rest of data - scrollable */}
                    {displayValues.slice(1).map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-center text-foreground whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-primary" size={28} />
        <h2 className="text-2xl font-bold text-foreground">
          Series Statistics
        </h2>
      </div>

      {/* Batting Stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Batting Stats</h3>
        <div className="flex flex-wrap gap-2">
          {statTypes.batting.map((stat) => (
            <button
              key={stat.key}
              onClick={() => setActiveStatType(stat.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeStatType === stat.key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bowling Stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Bowling Stats</h3>
        <div className="flex flex-wrap gap-2">
          {statTypes.bowling.map((stat) => (
            <button
              key={stat.key}
              onClick={() => setActiveStatType(stat.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeStatType === stat.key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Table */}
      <div className="mt-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted/30 rounded-xl"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-6">⚠️</div>
            <p className="text-2xl font-bold text-foreground mb-3">{error}</p>
          </div>
        ) : (
          renderStatsTable()
        )}
      </div>
    </div>
  );
};

export default SeriesView;
