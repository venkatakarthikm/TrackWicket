import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, Calendar, MapPin, Zap } from "lucide-react";
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
    const userMedia = window.matchMedia("(prefers-color-scheme: light)");
    if (userMedia.matches) {
      return "light";
    }
  }
  return "light";
};

// SCORE FORMATTER
const formatScore = (scoreObj) => {
  if (!scoreObj) return null;
  const inngs = Object.values(scoreObj)[0];
  if (!inngs) return null;
  return `${inngs.runs}/${inngs.wickets} (${inngs.overs})`;
};

const SeriesView = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [searchQuery, setSearchQuery] = useState("");

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
    const fetchSeriesDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/series/${seriesId}`
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

  const pageTitle = seriesData?.seriesName
  ? seriesData.seriesName.length > 60
    ? seriesData.seriesName.slice(0, 57) + "..."
    : seriesData.seriesName
  : "Series Matches";

// update Helmet title line only
<Helmet>
  <title>{pageTitle} - Track Wicket</title>
  <meta
    name="description"
    content={
      seriesData
        ? `View all matches from ${seriesData.seriesName}`
        : "Series matches"
    }
  />
</Helmet>

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
        match.status?.toLowerCase().includes(query)
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${getFormatBadgeColor(match.matchFormat)}`}
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
              className={`text-sm font-semibold text-center ${getMatchStatusColor(match.status)}`}
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>
          {seriesData
            ? `${seriesData.seriesName} - All Matches`
            : "Series Matches"}{" "}
          - Track Wicket
        </title>
        <meta
          name="description"
          content={
            seriesData
              ? `View all matches from ${seriesData.seriesName}`
              : "Series matches"
          }
        />
      </Helmet>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </>
          ) : error ? (
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
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/30 shadow-lg">
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
                    {searchQuery && (
                      <span className="text-sm md:text-base">
                        • {filteredMatches.length} matches found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32">
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match) => (
                    <MatchCard key={match.matchId} match={match} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeriesView;
