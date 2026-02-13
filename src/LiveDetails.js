import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Trophy,
  Clock,
  Award,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Activity,
  Table,
  Pin,
  PinOff,
  Bell, // NEW: Bell Icon
  X, // NEW: Close Icon
  Check, // NEW: Success Icon
} from "lucide-react";
import Navbar from "./Navbar";
import axios from "axios"; // NEW: Required for API call
import Loader from "./Loader";
import { HelmetProvider } from "react-helmet-async";
import SEO from './SEO';

// Add this function to generate dynamic SEO based on match data
const getMatchSEOConfig = (matchData) => {
  if (!matchData) {
    return {
      title: "Live Cricket Match Details - Track Wicket",
      description: "Watch live cricket match with real-time scores, ball-by-ball commentary, and detailed statistics on Track Wicket.",
      keywords: "live cricket, match details, scorecard, ball by ball, Track Wicket",
      canonical: window.location.href
    };
  }

  const team1 = matchData.team1?.name || "Team 1";
  const team2 = matchData.team2?.name || "Team 2";
  const format = matchData.matchFormat || "Cricket";
  const series = matchData.series?.name || "";
  
  const title = `${team1} vs ${team2} Live Score - ${format} Match`;
  const description = `${team1} vs ${team2} live cricket score and commentary. Follow ball-by-ball updates, scorecard, and match statistics for this ${format} match in ${series} on Track Wicket.`;
  const keywords = `${team1} vs ${team2}, ${team1} ${team2} live score, ${format} live, live cricket score, ${series}, ball by ball commentary, Track Wicket live, cricket scorecard`;

  return {
    title,
    description,
    keywords,
    canonical: window.location.href,
    breadcrumbs: [
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Live Matches",
        "item": "https://trackwicket.tech/live"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${team1} vs ${team2}`,
        "item": window.location.href
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${team1} vs ${team2} - ${format}`,
      "description": description,
      "sport": "Cricket",
      "competitor": [
        {
          "@type": "SportsTeam",
          "name": team1
        },
        {
          "@type": "SportsTeam",
          "name": team2
        }
      ],
      "eventStatus": matchData.status || "Live",
      "location": {
        "@type": "Place",
        "name": matchData.venue || "Cricket Stadium"
      }
    }
  };
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

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "") // Remove special characters like apostrophes
    .replace(/ +/g, "-"); // Replace spaces with dashes
};

// Smooth animated score component with transition
const AnimatedScore = memo(({ value, className = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsChanging(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsChanging(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        isChanging ? "scale-110 text-primary" : ""
      } ${className}`}
    >
      {displayValue}
    </span>
  );
});

AnimatedScore.displayName = "AnimatedScore";

const getBallColorClass = (ball) => {
  const cleanBall = ball.trim().toUpperCase();
  if (["W", "R", "RO"].includes(cleanBall))
    return "bg-gradient-to-br from-red-500 to-red-700 text-white font-bold shadow-lg animate-pulse-once";
  if (cleanBall === "6")
    return "bg-gradient-to-br from-green-500 to-green-700 text-white font-bold shadow-lg";
  if (cleanBall === "4")
    return "bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold shadow-lg";
  if (cleanBall.includes("WD") || cleanBall.includes("NB"))
    return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold shadow-lg";
  if (["1", "2", "3", "0", "."].includes(cleanBall) || /^\d+$/.test(cleanBall))
    return "bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-md";
  return "bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-md";
};

// Memoized ball display component
const BallDisplay = memo(({ balls }) => {
  if (!balls || balls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 justify-start">
      {balls.map((ball, index) => (
        <div
          key={`${ball}-${index}`}
          className={`h-9 w-9 flex items-center justify-center text-sm rounded-full transition-all duration-300 hover:scale-110 ${getBallColorClass(
            ball
          )}`}
        >
          {ball
            .trim()
            .replace("Wd", "WD")
            .replace("nb", "NB")
            .replace("R", "RO")}
        </div>
      ))}
    </div>
  );
});

BallDisplay.displayName = "BallDisplay";

const renderBallByBall = (recentOvsStats) => {
  if (!recentOvsStats) return null;
  const balls = recentOvsStats
    .split("|")
    .pop()
    .trim()
    .split(/\s+/)
    .filter((b) => b.length > 0);
  return <BallDisplay balls={balls} />;
};

const formatStartTime = (timestamp) => {
  if (!timestamp) return "TBA";
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "GMT",
    }) +
    " GMT"
  );
};

const formatDate = (timestamp) => {
  if (!timestamp) return "TBA";
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTossResult = (tossResults) => {
  if (!tossResults) return "Toss yet to happen";
  const decision = tossResults.decision?.toLowerCase().includes("bat")
    ? "bat first"
    : "bowl first";
  return `${tossResults.tossWinnerName} chose to ${decision}.`;
};

const processCommentaryToOvers = (commentaryList, miniscore) => {
  if (!commentaryList || commentaryList.length === 0) return [];

  const overs = [];
  let currentOver = null;
  let ballsInOver = [];

  for (const comm of commentaryList) {
    const overNum = comm.overNumber ? Math.floor(comm.overNumber) : null;

    if (!overNum && comm.event === "NONE" && !comm.ballNbr) continue;
    if (!comm.batTeamScore && !comm.overSeparator) continue;

    if (comm.event === "over-break" || (overNum && currentOver !== overNum)) {
      if (currentOver !== null && ballsInOver.length > 0) {
        overs.push({
          over: currentOver,
          summary: comm.overSeparator
            ? comm.overSeparator.o_summary
            : ballsInOver
                .map((b) => b.run)
                .reverse()
                .join(" "),
          balls: [...ballsInOver].reverse(),
          bowler:
            ballsInOver[0]?.bowler || comm.bowlerDetails?.playerName || "N/A",
          batsmanStriker:
            ballsInOver[0]?.striker ||
            comm.overSeparator?.batStrikerObj?.playerName ||
            "N/A",
          batsmanNonStriker:
            comm.overSeparator?.batNonStrikerObj?.playerName || "N/A",
          runs:
            comm.overSeparator?.runs ||
            ballsInOver.reduce(
              (sum, ball) =>
                sum + (parseInt(String(ball.run).match(/\d/)) || 0),
              0
            ),
          score: comm.overSeparator?.score || 0,
          wickets: comm.overSeparator?.wickets || 0,
        });
      }

      currentOver = overNum;
      ballsInOver = [];
    }

    if (
      comm.ballMetric &&
      comm.overNumber &&
      comm.bowlerDetails &&
      comm.batsmanDetails
    ) {
      let runValue = comm.legalRuns;
      if (comm.event && comm.event.includes("wicket")) runValue = "W";
      else if (comm.commText.toLowerCase().includes("wide")) runValue = "Wd";
      else if (comm.commText.toLowerCase().includes("no ball")) runValue = "NB";
      else if (comm.commText.toLowerCase().includes("six")) runValue = "6";
      else if (comm.commText.toLowerCase().includes("four")) runValue = "4";
      else if (comm.commText.toLowerCase().includes("leg byes"))
        runValue = "LB";

      ballsInOver.push({
        run: String(runValue || "0"),
        bowler: comm.bowlerDetails.playerName,
        striker: comm.batsmanDetails.playerName,
        commText: comm.commText,
      });
    }
  }

  if (ballsInOver.length > 0 && currentOver !== null) {
    if (overs.length === 0 || overs[0].over !== currentOver) {
      overs.unshift({
        over: currentOver,
        summary: ballsInOver
          .map((b) => b.run)
          .reverse()
          .join(" "),
        balls: [...ballsInOver].reverse(),
        bowler: ballsInOver[0]?.bowler || "N/A",
        batsmanStriker: ballsInOver[0]?.striker || "N/A",
        batsmanNonStriker: "N/A",
        runs: ballsInOver.reduce(
          (sum, ball) => sum + (parseInt(String(ball.run).match(/\d/)) || 0),
          0
        ),
        score: miniscore?.batTeam?.teamScore || 0,
        wickets: miniscore?.batTeam?.teamWkts || 0,
      });
    }
  }

  const uniqueOvers = [];
  const seenOvers = new Set();
  for (const over of overs) {
    if (!seenOvers.has(over.over)) {
      uniqueOvers.push(over);
      seenOvers.add(over.over);
    }
  }

  return uniqueOvers.sort((a, b) => b.over - a.over);
};

// Memoized Batsman Row Component
const BatsmanRow = memo(({ batsman, isStriker }) => (
  <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/20 transition-colors">
    <span className="text-foreground flex items-center gap-2">
      <span
        className={`text-base ${
          isStriker ? "font-extrabold text-primary" : "font-semibold"
        }`}
      >
        {batsman.batName}
      </span>
      {isStriker && <span className="text-xl animate-bounce"></span>}
    </span>
    <span className="text-foreground text-base font-semibold text-right whitespace-nowrap">
      <span className="text-2xl font-extrabold">
        <AnimatedScore value={batsman.batRuns} />
      </span>
      <span className="text-sm text-muted-foreground font-normal ml-1">
        ({batsman.batBalls})
      </span>
      <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
        | 4s: {batsman.batFours} | 6s: {batsman.batSixes} | SR:{" "}
        {parseFloat(batsman.batStrikeRate).toFixed(2)}
      </span>
    </span>
  </div>
));

const calculateCumulativeOver = (recentStats) => {
  if (!recentStats) return [];
  
  // Clean the string and split by spaces to get individual balls
  const balls = recentStats.split("|").pop().trim().split(/\s+/).filter(b => b.length > 0);
  
  let total = 0;
  return balls.map(ball => {
    const b = ball.toUpperCase();
    if (b.includes("W") && !b.includes("WD") && !b.includes("NB")) {
      // Wicket with no runs
    } else {
      const runs = parseInt(b.replace(/\D/g, "")) || 0;
      total += runs;
      if (b.includes("WD") || b.includes("NB")) total += 1; // Standard extra penalty
    }
    return total;
  });
};

BatsmanRow.displayName = "BatsmanRow";

// Optimized Live View Component with proper memoization
const LiveView = memo(
  ({ miniscore, currentInnings }) => {
    const currentOverDisplay = currentInnings?.overs || "-";

    /// Calculate cumulative totals for the current live over
  const cumulativeTotals = useMemo(() => 
    calculateCumulativeOver(miniscore?.recentOvsStats), 
  [miniscore?.recentOvsStats]);

  const overStats = useMemo(() => {
    if (!miniscore?.recentOvsStats) return { balls: [], total: 0 };
    
    // Extract balls from the recent stats string
    const balls = miniscore.recentOvsStats.split("|").pop().trim().split(/\s+/).filter(b => b.length > 0);
    
    // Calculate total runs for the current over
    const total = balls.reduce((acc, ball) => {
      const b = ball.toUpperCase();
      let runs = 0;
      if (!(b.includes("W") && !b.includes("WD") && !b.includes("NB"))) {
        runs = parseInt(b.replace(/\D/g, "")) || 0;
        if (b.includes("WD") || b.includes("NB")) runs += 1;
      }
      return acc + runs;
    }, 0);

    return { balls, total };
  }, [miniscore?.recentOvsStats]);

    return (
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp size={24} className="text-primary" />
            Live Batting ({currentInnings.batTeamName})
          </h2>

          {miniscore.recentOvsStats && (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50">
              <span className="text-2xl font-extrabold text-foreground whitespace-nowrap">
                {currentOverDisplay}
              </span>
              <div className="flex items-center gap-2">
            {/* Render Ball Circles */}
            <div className="flex gap-1.5">
              {overStats.balls.map((ball, index) => (
                <div
                  key={index}
                  className={`h-9 w-9 flex items-center justify-center text-sm rounded-full font-bold shadow-md ${getBallColorClass(ball)}`}
                >
                  {ball.replace("Wd", "WD").replace("nb", "NB").replace("R", "RO")}
                </div>
              ))}
            </div>

            {/* Total Divider and Score */}
            <span className="text-xl font-bold text-muted-foreground mx-1">=</span>
            <span className="text-2xl font-black text-primary animate-pulse-once">
              {overStats.total}
            </span>
          </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {miniscore.batsmanStriker && (
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-5 rounded-xl border border-border/50 order-1">
              <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
                Batsmen
              </h3>
              <div className="space-y-2">
                <BatsmanRow
                  batsman={{
                    batName: miniscore.batsmanStriker.name,
                    batRuns: miniscore.batsmanStriker.runs,
                    batBalls: miniscore.batsmanStriker.balls,
                    batFours: miniscore.batsmanStriker.fours,
                    batSixes: miniscore.batsmanStriker.sixes,
                    batStrikeRate: miniscore.batsmanStriker.strikeRate,
                  }}
                  isStriker={true}
                />

                {miniscore.batsmanNonStriker && (
                  <div className="border-t border-border pt-3">
                    <BatsmanRow
                      batsman={{
                        batName: miniscore.batsmanNonStriker.name,
                        batRuns: miniscore.batsmanNonStriker.runs,
                        batBalls: miniscore.batsmanNonStriker.balls,
                        batFours: miniscore.batsmanNonStriker.fours,
                        batSixes: miniscore.batsmanNonStriker.sixes,
                        batStrikeRate: miniscore.batsmanNonStriker.strikeRate,
                      }}
                      isStriker={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-5 rounded-xl flex justify-between items-center order-2 border border-primary/30">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">
                Score
              </p>
              <p className="text-4xl font-extrabold text-foreground">
                <AnimatedScore value={currentInnings.score} />/
                <AnimatedScore value={currentInnings.wickets} />
              </p>
            </div>
            <div className="flex flex-col text-right">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">
                Overs
              </p>
              <p className="text-4xl font-extrabold text-primary">
                <AnimatedScore value={currentInnings.overs} />
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {miniscore.bowlerStriker && (
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-5 rounded-xl border border-border/50 order-3">
              <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
                Current Bowler
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold text-lg">
                  {miniscore.bowlerStriker.name}
                </span>
                <span className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <AnimatedScore
                    value={`${miniscore.bowlerStriker.wickets}/${miniscore.bowlerStriker.runs}`}
                  />
                  <span className="text-sm text-muted-foreground font-normal">
                    ({miniscore.bowlerStriker.overs})
                  </span>
                  <span className="text-sm text-muted-foreground font-normal whitespace-nowrap">
                    ECO:{" "}
                    <AnimatedScore
                      value={Number(
                        miniscore.bowlerStriker.economy || 0
                      ).toFixed(2)}
                    />
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-accent/10 to-secondary/10 p-5 rounded-xl flex justify-between items-center order-4 border border-border/50">
            {miniscore.currentRunRate !== undefined &&
              miniscore.currentRunRate !== null && (
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">
                    Current RR
                  </p>
                  <p className="text-4xl font-extrabold text-primary">
                    <AnimatedScore
                      value={Number(miniscore.currentRunRate).toFixed(2)}
                    />
                  </p>
                </div>
              )}
            {miniscore.requiredRunRate !== undefined &&
              miniscore.requiredRunRate !== null &&
              miniscore.requiredRunRate > 0 && (
                <div className="flex flex-col text-right">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">
                    Required RR
                  </p>
                  <p className="text-4xl font-extrabold text-yellow-500">
                    <AnimatedScore
                      value={Number(miniscore.requiredRunRate).toFixed(2)}
                    />
                  </p>
                </div>
              )}
          </div>
        </div>

        {miniscore.lastWicket && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl">
            <p className="text-sm text-red-400 font-semibold">
              <strong>Last Wicket:</strong>{" "}
              <AnimatedScore value={miniscore.lastWicket} className="inline" />
            </p>
          </div>
        )}
        {miniscore.status && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/30">
            <p className="text-center font-bold text-lg text-foreground">
              {miniscore.status}
            </p>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.miniscore) ===
        JSON.stringify(nextProps.miniscore) &&
      JSON.stringify(prevProps.currentInnings) ===
        JSON.stringify(nextProps.currentInnings)
    );
  }
);

LiveView.displayName = "LiveView";

// Memoized Over History Section
const OversSection = memo(
  ({
    commentaryList,
    currentInnings,
    overHistory,
    isHistoryExpanded,
    setIsHistoryExpanded,
  }) => {
    if (overHistory.length === 0) return null;

    const displayedOvers = isHistoryExpanded
      ? overHistory
      : overHistory.slice(0, 2);
    const hasMore = overHistory.length > 2;

    const cleanCommText = (text) =>
      text
        .replace(/<[^>]*>?/gm, "")
        .replace(/B\d*\$/, "")
        .substring(0, 100)
        .trim();

    // Logic to calculate the cumulative total after each ball in the over
    const calculateOverProgress = (balls) => {
      let runningTotal = 0;
      return balls.map((ball) => {
        const ballRun = ball.run.toUpperCase();
        
        // standard cricket logic: Wickets = 0 runs, unless it's a wide/no-ball wicket
        if (ballRun.includes("W") && !ballRun.includes("WD") && !ballRun.includes("NB")) {
           // No runs added
        } else {
          // Extract numeric runs (1, 2, 3, 4, 6)
          const numericRuns = parseInt(ballRun.replace(/\D/g, "")) || 0;
          runningTotal += numericRuns;

          // Add +1 penalty run for Extras (Wide or No Ball)
          if (ballRun.includes("WD") || ballRun.includes("NB")) {
            runningTotal += 1;
          }
        }
        return runningTotal;
      });
    };

    return (
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center gap-3">
          <RefreshCw size={24} className="text-primary" />
          Innings Over History
        </h2>

        <div className="space-y-6">
          {displayedOvers.map((overData) => {
            // Get the running total array for this specific over
            const overProgress = calculateOverProgress(overData.balls);

            return (
              <div
                key={overData.over}
                className="bg-gradient-to-r from-secondary/30 to-secondary/10 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-border/50"
              >
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="min-w-[70px] bg-primary/10 p-2 rounded-lg border border-primary/30 text-center">
                    <span className="text-lg font-black text-primary block">
                      Ov {overData.over}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {currentInnings?.batTeamName} {overData.score}-{overData.wickets}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      {overData.runs} runs in over
                    </span>
                  </div>
                </div>

                {/* Ball by Ball with Progress Stats */}
                <div className="flex flex-wrap gap-4 items-center">
                  {overData.balls.map((ball, index) => (
                    <div key={index} className="flex items-center gap-2 bg-background/40 p-1 pr-3 rounded-full border border-border/50">
                      {/* Ball Circle */}
                      <div
                        className={`h-9 w-9 flex items-center justify-center text-xs rounded-full shadow-lg transition-transform hover:scale-110 ${getBallColorClass(ball.run)}`}
                        title={`${ball.striker}: ${cleanCommText(ball.commText)}`}
                      >
                        {ball.run
                          .replace("Wd", "WD")
                          .replace("nb", "NB")
                          .replace("R", "RO")
                          .replace("L1", "LB")}
                      </div>
                      
                      {/* Current Over Total Progress */}
                      <span className="text-sm font-black text-foreground">
                        {overProgress[index]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="hidden xl:flex flex-col text-right text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span>Bowler: <b className="text-foreground">{overData.bowler}</b></span>
                  <span>Striker: <b className="text-foreground">{overData.batsmanStriker}</b></span>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-secondary/50 text-foreground rounded-xl text-sm font-bold hover:bg-secondary transition-all border border-border shadow-sm"
          >
            {isHistoryExpanded ? (
              <><ChevronUp size={18} /> Show Less</>
            ) : (
              <><ChevronDown size={18} /> View All {overHistory.length} Overs</>
            )}
          </button>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isHistoryExpanded === nextProps.isHistoryExpanded &&
      JSON.stringify(prevProps.overHistory) === JSON.stringify(nextProps.overHistory)
    );
  }
);

OversSection.displayName = "OversSection";

const CompletedView = memo(({ matchHeader, allInnings }) => {
  const statusColor = matchHeader.status.toLowerCase().includes("won")
    ? "text-green-400"
    : "text-yellow-400";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl">
      <h2 className="text-3xl font-bold text-foreground mb-5 flex items-center gap-3">
        <Trophy size={28} className="text-primary" />
        Match Result
      </h2>

      <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl mb-6 border border-primary/30">
        <p className={`text-center font-bold text-2xl ${statusColor}`}>
          {matchHeader.status}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allInnings.map((inning, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-secondary/30 to-secondary/10 p-5 rounded-xl border border-border/50"
          >
            <h3 className="text-lg font-bold text-foreground mb-3">
              {inning.batTeamName} Innings
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-4xl font-extrabold text-foreground">
                {inning.score}/{inning.wickets}
              </p>
              <p className="text-base text-muted-foreground">
                Overs: {inning.overs}
              </p>
            </div>
          </div>
        ))}
      </div>

      {matchHeader.playersOfTheMatch &&
        matchHeader.playersOfTheMatch.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-lg p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/30">
            <Award className="text-yellow-500" size={24} />
            <span className="text-muted-foreground">Player of the Match:</span>
            <span className="font-bold text-foreground">
              {matchHeader.playersOfTheMatch[0].fullName ||
                matchHeader.playersOfTheMatch[0].name}
            </span>
          </div>
        )}
    </div>
  );
});

CompletedView.displayName = "CompletedView";

const UpcomingView = memo(({ matchHeader }) => (
  <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-2xl text-center">
    <h2 className="text-4xl font-bold text-primary mb-5 flex items-center justify-center gap-4">
      <Calendar size={36} />
      Match Scheduled
    </h2>
    <p className="text-xl text-muted-foreground mb-5">
      {matchHeader.team1.name} vs {matchHeader.team2.name}
    </p>
    <div className="p-5 bg-gradient-to-r from-secondary/30 to-secondary/10 inline-block rounded-xl border border-border/50">
      <p className="text-2xl font-bold text-foreground">
        Match starts at{" "}
        <span className="text-primary">
          {formatStartTime(matchHeader.matchStartTimestamp)}
        </span>
      </p>
    </div>
  </div>
));

UpcomingView.displayName = "UpcomingView";

// --- NEW: Notification Subscribe Modal ---
const NotificationModal = ({ isOpen, onClose, team1, team2, onSubscribe }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="text-primary" size={20} />
            Get Alerts
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Add these teams to your watchlist to receive live notifications for
          wickets and boundaries.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onSubscribe([team1])}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-primary/10 border border-border hover:border-primary/50 transition-all group"
          >
            <span className="font-bold text-foreground group-hover:text-primary">
              {team1}
            </span>
            <span className="text-xs font-semibold bg-secondary px-2 py-1 rounded text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
              Add
            </span>
          </button>

          <button
            onClick={() => onSubscribe([team2])}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-primary/10 border border-border hover:border-primary/50 transition-all group"
          >
            <span className="font-bold text-foreground group-hover:text-primary">
              {team2}
            </span>
            <span className="text-xs font-semibold bg-secondary px-2 py-1 rounded text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
              Add
            </span>
          </button>

          <button
            onClick={() => onSubscribe([team1, team2])}
            className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg transition-all"
          >
            Subscribe to Both
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveDetails = ({ theme, toggleTheme }) => {
  const { matchId, teamsSlug, seriesSlug } = useParams();
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overHistory, setOverHistory] = useState([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [isExtensionCheckComplete, setIsExtensionCheckComplete] =
    useState(false);

  // NEW STATES for Notification Modal
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState("");

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const prevDataHashRef = useRef(null);

  // Check if device is desktop and if extension is installed
  useEffect(() => {
    // 1. Desktop Check Logic
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    // 2. Extension Check Logic
    const checkExtension = () => {
      // Send a ping and set up the response listener

      const handleMessage = (event) => {
        if (event.data.type === "EXTENSION_RESPONSE") {
          setExtensionInstalled(true);
          setIsExtensionCheckComplete(true); // Signal completion on success
          window.removeEventListener("message", handleMessage); // Remove on success
          console.log("Extension Verified! State updated.");
        }
      };

      window.addEventListener("message", handleMessage);

      // Try to send a message to the extension
      window.postMessage({ type: "CHECK_EXTENSION" }, "*");

      // FALLBACK TIMEOUT: If no response in 500ms, assume not installed and signal completion
      const timeout = setTimeout(() => {
        setIsExtensionCheckComplete(true);
        window.removeEventListener("message", handleMessage);
      }, 500);

      // Return cleanup function to remove the listener and clear timeout
      return () => {
        window.removeEventListener("message", handleMessage);
        clearTimeout(timeout);
      };
    };

    // 3. Execute the Extension Check
    const cleanupMessageListener = checkExtension();

    // 4. Cleanup Function (Returned from useEffect)
    return () => {
      window.removeEventListener("resize", checkDesktop);
      // Cleanup the message listener using the function returned from checkExtension
      if (cleanupMessageListener) {
        cleanupMessageListener();
      }
    };
  }, []); // Empty dependency array means it runs once on mount

  // Create a hash of critical data to detect actual changes
  const createDataHash = useCallback((data) => {
    if (!data) return null;
    return JSON.stringify({
      score: data.miniscore?.batTeam?.teamScore,
      wickets: data.miniscore?.batTeam?.teamWkts,
      overs: data.miniscore?.overs,
      balls: data.miniscore?.recentOvsStats,
      striker: data.miniscore?.batsmanStriker?.batRuns,
      nonStriker: data.miniscore?.batsmanNonStriker?.batRuns,
      bowler: data.miniscore?.bowlerStriker?.bowlRuns,
      status: data.matchHeader?.status,
    });
  }, []);

  // Update page title dynamically
  useEffect(() => {
    if (matchData?.matchHeader && matchData?.miniscore) {
      const { matchHeader, miniscore } = matchData;
      const team1 =
        matchHeader.team1?.sName || matchHeader.team1?.name || "Team1";
      const team2 =
        matchHeader.team2?.sName || matchHeader.team2?.name || "Team2";

      if (matchHeader.state === "In Progress" && miniscore?.batTeam) {
        const battingTeam =
          miniscore.batTeam.teamSName || miniscore.batTeam.teamName;
        const score = `${miniscore.batTeam.teamScore || 0}/${
          miniscore.batTeam.teamWkts || 0
        }`;
        const overs = miniscore.currentRunRate
          ? ` (${miniscore.overs || 0})`
          : "";
        document.title = `LIVE: ${score}${overs} - ${team1} vs ${team2} - Track Wicket`;
      } else if (matchHeader.state === "Complete") {
        document.title = `${matchHeader.status} - ${team1} vs ${team2} - Track Wicket`;
      } else {
        document.title = `${team1} vs ${team2} - ${matchHeader.seriesName} - Track Wicket`;
      }
    } else {
      document.title = "Match Details - Track Wicket";
    }
  }, [matchData]);

  const fetchMatchDetails = useCallback(async () => {
    try {
      const detailsResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/match-details/${matchId}`
      );
      const detailsResult = await detailsResponse.json();

      if (detailsResult.status === "success" && isMountedRef.current) {
        const newData = detailsResult.data;
        const newHash = createDataHash(newData);

        if (prevDataHashRef.current !== newHash) {
          setMatchData(newData);
          prevDataHashRef.current = newHash;

          const parsedHistory = processCommentaryToOvers(
            newData.commentaryList,
            newData.miniscore
          );
          setOverHistory(parsedHistory);
        }
      } else if (!matchData) {
        setError(detailsResult.message || "Failed to load match details");
      }
    } catch (err) {
      console.error("Error fetching match details:", err);
      if (!matchData) {
        setError("Unable to load match details. Please try again.");
      }
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  }, [matchId, matchData, loading, createDataHash]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMatchDetails();

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [matchId]);

  // Smart polling based on match state
  useEffect(() => {
    if (!matchData?.matchHeader) return;

    const matchState = matchData.matchHeader.state;
    let pollingInterval;

    if (matchState === "In Progress" || matchState === "Stumps") {
      pollingInterval = 1000;
    } else if (matchState === "Complete") {
      pollingInterval = 30000;
    } else {
      pollingInterval = 60000;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(fetchMatchDetails, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [matchData?.matchHeader?.state, fetchMatchDetails]);

  // Handle pin button click
  const handlePinClick = () => {
    if (!extensionInstalled) {
      // Show alert only AFTER the check is complete AND the state is false
      window.alert(
        "Cricket Score Extension is not installed!\n\n" +
          "To use this feature:\n" +
          "1. Download the extension files\n" +
          "2. Go to chrome://extensions/\n" +
          '3. Enable "Developer mode"\n' +
          '4. Click "Load unpacked"\n' +
          "5. Select the extension folder\n\n" +
          "Then refresh this page and try again!"
      );
      return;
    }

    // Create the required data structure for the background script's pinMatch action
    const initialPinData = {
      matchId: matchHeader.matchId,
      team1: {
        name: matchHeader.team1?.sName || matchHeader.team1?.name,
        score: displayScore1
          ? `${displayScore1.score}/${displayScore1.wickets}`
          : "-",
      },
      team2: {
        name: matchHeader.team2?.sName || matchHeader.team2?.name,
        score: displayScore2
          ? `${displayScore2.score}/${displayScore2.wickets}`
          : "-",
      },
      currentBall: miniscore?.recentOvsStats?.split(" ").pop().trim() || "-",
      currentOver: miniscore?.overs || "-",
      currentOverStats: miniscore?.recentOvsStats || "-",
      status: matchHeader.state,
      striker: miniscore?.batsmanStriker
        ? {
            name: miniscore.batsmanStriker.name,
            runs: miniscore.batsmanStriker.runs,
            balls: miniscore.batsmanStriker.balls,
          }
        : null,
      nonStriker: miniscore?.batsmanNonStriker
        ? {
            name: miniscore.batsmanNonStriker.name,
            runs: miniscore.batsmanNonStriker.runs,
            balls: miniscore.batsmanNonStriker.balls,
          }
        : null,
      bowler: miniscore?.bowlerStriker
        ? {
            name: miniscore.bowlerStriker.name,
            wickets: miniscore.bowlerStriker.wickets,
            runs: miniscore.bowlerStriker.runs,
            overs: miniscore.bowlerStriker.overs,
          }
        : null,
    };

    if (isPinned) {
      // Unpin match
      window.postMessage({ type: "UNPIN_MATCH" }, "*");
      setIsPinned(false);
    } else {
      // Pin match - send data to extension
      window.postMessage(
        {
          type: "PIN_MATCH",
          data: initialPinData,
        },
        "*"
      );

      setIsPinned(true);
    }
  };

  // Memoize computed values
  const allInnings = useMemo(
    () => matchData?.miniscore?.matchScoreDetails?.inningsScoreList || [],
    [matchData]
  );

  const currentInnings = useMemo(
    () =>
      allInnings.find((i) => i.inningsId === matchData?.miniscore?.inningsId) ||
      allInnings[allInnings.length - 1],
    [allInnings, matchData]
  );

  const displayScore1 = useMemo(
    () => allInnings.find((i) => i.inningsId === 1) || null,
    [allInnings]
  );

  const displayScore2 = useMemo(
    () => allInnings.find((i) => i.inningsId === 2) || null,
    [allInnings]
  );

  // --- NEW: Handle Subscription Logic ---
  const handleOpenNotifModal = () => {
    setIsNotifModalOpen(true);
  };

  const handleSubscribe = async (teamsToAdd) => {
    try {
      // Call the new API endpoint
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/preferences/add`,
        {
          teams: teamsToAdd,
        },
        { withCredentials: true }
      );

      // Show success feedback
      setIsNotifModalOpen(false);
      setNotifSuccessMsg(`Subscribed to ${teamsToAdd.join(" & ")}`);

      // Clear message after 3 seconds
      setTimeout(() => setNotifSuccessMsg(""), 3000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Please login to subscribe to notifications.");
        // Optional: navigate('/notifications');
      } else {
        alert("Failed to subscribe. Please try again.");
        console.error(err);
      }
    }
  };

  if (loading || error || !matchData || !matchData.matchHeader) {
    if (loading)
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader />
        </div>
      );
    if (error || !matchData || !matchData.matchHeader)
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <p className="text-red-500 text-lg">
            Error loading data: {error || "No match data available"}
          </p>
        </div>
      );
  }

  const { matchHeader, miniscore, commentaryList } = matchData;
  const matchState = matchHeader.state;
  const scorecardPath = `/match/${matchId}/${teamsSlug}/${seriesSlug}/scorecard`;

  // Helper to extract clean team names
  const team1Name = matchHeader.team1?.name || "Team 1";
  const team2Name = matchHeader.team2?.name || "Team 2";

  let matchContentView;

  if (matchState === "Upcoming") {
    matchContentView = <UpcomingView matchHeader={matchHeader} />;
  } else if (
    matchState === "In Progress" ||
    matchState === "Stumps" ||
    matchState === "Innings Break" ||
    matchState === "Drinks Break" ||
    matchState === "Lunch Break"
  ) {
    matchContentView = (
      <>
        <LiveView miniscore={miniscore} currentInnings={currentInnings} />
        {commentaryList?.length > 0 && (
          <OversSection
            commentaryList={commentaryList}
            currentInnings={currentInnings}
            overHistory={overHistory || []}
            isHistoryExpanded={isHistoryExpanded}
            setIsHistoryExpanded={setIsHistoryExpanded}
          />
        )}
      </>
    );
  } else if (matchState === "Complete") {
    matchContentView = (
      <>
        <CompletedView matchHeader={matchHeader} allInnings={allInnings} />
        {commentaryList?.length > 0 && (
          <OversSection
            commentaryList={commentaryList}
            currentInnings={allInnings[0]}
            overHistory={overHistory || []}
            isHistoryExpanded={isHistoryExpanded}
            setIsHistoryExpanded={setIsHistoryExpanded}
          />
        )}
      </>
    );
  }
const seoConfig = getMatchSEOConfig(matchData);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO {...seoConfig} />
      <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>Track Wicket - {matchData?.team1?.name} vs {matchData?.team2?.name} Live Score</h1>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={""}
        setSearchQuery={() => {}}
        isMatchDetails={true}
      />

      {/* NEW: Notification Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        team1={team1Name}
        team2={team2Name}
        onSubscribe={handleSubscribe}
      />

      {/* NEW: Success Toast */}
      {notifSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-right">
          <Check size={20} />
          <span className="font-bold text-sm">{notifSuccessMsg}</span>
        </div>
      )}

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Trophy className="text-primary min-w-[28px] mt-1" size={28} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {matchHeader.matchDescription}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Wrap the Series Name in a Link */}
                    <Link
                      to={`/series/${matchHeader.seriesId - 123456}/${slugify(matchHeader.seriesName)}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {matchHeader.seriesName}
                    </Link>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getFormatBadgeColor(
                        matchHeader.matchFormat
                      )}`}
                    >
                      {matchHeader.matchFormat}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-5 w-full lg:w-auto">
                {displayScore1 && (
                  <div className="text-right p-3 flex-1 bg-secondary/20 rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {displayScore1.batTeamName}
                    </p>
                    <p className="text-3xl font-extrabold text-foreground whitespace-nowrap">
                      {displayScore1.score}/{displayScore1.wickets}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({displayScore1.overs})
                      </span>
                    </p>
                  </div>
                )}
                {displayScore2 && (
                  <div className="text-right p-3 flex-1 bg-primary/10 rounded-xl">
                    <p className="text-xs font-semibold text-primary mb-1">
                      {displayScore2.batTeamName}
                    </p>
                    <p className="text-3xl font-extrabold text-primary whitespace-nowrap">
                      {displayScore2.score}/{displayScore2.wickets}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({displayScore2.overs})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-5 border-t border-border/50">
              <div className="flex flex-wrap gap-6 text-sm">
                {matchHeader.tossResults && (
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Toss:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatTossResult(matchHeader.tossResults)}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">
                    Status:
                  </span>
                  <span className="font-semibold text-foreground">
                    {matchHeader.state}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {/* NEW: Bell Button for Notifications */}
                <button
                  onClick={handleOpenNotifModal}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 bg-secondary/50 text-foreground hover:bg-yellow-500/10 hover:text-yellow-500 border border-transparent hover:border-yellow-500/50"
                  title="Get Notifications for this match"
                >
                  <Bell size={20} />
                </button>

                {matchState !== "Upcoming" && (
                  <>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-primary text-primary-foreground shadow-lg">
                      <Activity size={18} /> Live
                    </button>
                    <Link
                      to={scorecardPath}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Table size={18} /> Scorecard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {matchContentView}

          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center gap-3">
              <Clock size={24} className="text-primary" />
              Match Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col py-2">
                <span className="text-muted-foreground text-sm font-semibold mb-1">
                  Start Time:
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(matchHeader.matchStartTimestamp)}
                </span>
              </div>
              <div className="flex flex-col py-2">
                <span className="text-muted-foreground text-sm font-semibold mb-1">
                  Venue:
                </span>
                <span className="font-semibold text-foreground">
                  {matchHeader.venue || "TBA"}
                </span>
              </div>
              <div className="flex flex-col py-2">
                <span className="text-muted-foreground text-sm font-semibold mb-1">
                  Match Type:
                </span>
                <span className="font-semibold text-foreground">
                  {matchHeader.matchType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveDetails;
