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
  Award,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
  Table,
  Bell,
  X,
  Check,
} from "lucide-react";
import Navbar from "./Navbar";
import axios from "axios";
import Loader from "./Loader";
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

  const team1 = matchData.team1?.name || matchData.matchHeader?.team1?.name || "Team 1";
  const team2 = matchData.team2?.name || matchData.matchHeader?.team2?.name || "Team 2";
  const format = matchData.matchFormat || matchData.matchHeader?.matchFormat || "Cricket";
  const series = matchData.series?.name || matchData.matchHeader?.seriesName || "";
  const venue = matchData.venue || matchData.matchHeader?.venue || "Cricket Stadium";
  
  const isoStartDate = matchData.matchHeader?.matchStartTimestamp 
    ? new Date(matchData.matchHeader.matchStartTimestamp).toISOString() 
    : new Date().toISOString();

  const title = `${team1} vs ${team2} Live Score - ${format} Match`;
  const description = `${team1} vs ${team2} live cricket score and commentary. Follow ball-by-ball updates and match statistics for this ${format} match in ${series} on Track Wicket.`;

  return {
    title,
    description,
    keywords: `${team1} vs ${team2}, live score, ${format}, ${series}, Track Wicket`,
    canonical: window.location.href,
    breadcrumbs: [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://trackwicket.tech/" },
      { "@type": "ListItem", "position": 2, "name": "Live Matches", "item": "https://trackwicket.tech/live" },
      { "@type": "ListItem", "position": 3, "name": `${team1} vs ${team2}`, "item": window.location.href }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${team1} vs ${team2} - ${format}`,
      "description": description,
      "sport": "Cricket",
      "eventStatus": `https://schema.org/${matchData.matchHeader?.state === "Complete" ? "EventCompleted" : "EventScheduled"}`,
      "image": [
         matchData.matchHeader?.team1?.imageUrl || "https://trackwicket.tech/logo.png",
         matchData.matchHeader?.team2?.imageUrl || "https://trackwicket.tech/logo.png"
      ],
      "competitor": [
        { "@type": "SportsTeam", "name": team1 },
        { "@type": "SportsTeam", "name": team2 }
      ],
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "availability": "https://schema.org/InStock",
        "price": "0",
        "priceCurrency": "INR"
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
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
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
    return "bg-red-600 text-white font-bold shadow-lg";
  if (cleanBall === "6")
    return "bg-orange-500 text-white font-bold shadow-lg border-none";
  if (cleanBall === "4")
    return "bg-blue-600 text-white font-bold shadow-lg";
  if (cleanBall.includes("WD") || cleanBall.includes("NB"))
    return "bg-yellow-400 text-black font-bold shadow-sm";
  if (["1", "2", "3", "0", "."].includes(cleanBall) || /^\d+$/.test(cleanBall))
    return "bg-white text-black font-medium shadow-sm border border-gray-200";
  return "bg-white text-black font-medium shadow-sm border border-gray-200";
};

// Enhanced Ball Display with animations
const BallDisplay = memo(({ balls, lastBallIndex }) => {
  if (!balls || balls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 md:gap-1.5 justify-start">
      {balls.map((ball, index) => {
        const isLastBall = index === lastBallIndex;
        const ballUpper = ball.trim().toUpperCase();
        
        let animationClass = "";
        if (isLastBall) {
          if (ballUpper === "6") {
            animationClass = "animate-cricket-six";
          } else if (ballUpper === "4") {
            animationClass = "animate-cricket-four";
          } else if (["W", "R", "RO"].includes(ballUpper)) {
            animationClass = "animate-cricket-wicket";
          } else if (ballUpper.includes("WD") || ballUpper.includes("NB")) {
            animationClass = "animate-cricket-extra";
          }
        }

        return (
          <div
            key={`${ball}-${index}`}
            className={`h-7 w-7 md:h-9 md:w-9 flex items-center justify-center text-xs md:text-sm rounded-full transition-all duration-300 hover:scale-110 ${getBallColorClass(
              ball
            )} ${animationClass}`}
          >
            {ball
              .trim()
              .replace("Wd", "WD")
              .replace("nb", "NB")
              .replace("R", "RO")}
          </div>
        );
      })}
    </div>
  );
});

BallDisplay.displayName = "BallDisplay";

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

// Enhanced Batsman Row - Mobile 2 lines, Desktop matching image
const BatterRow = memo(({ batter, isStriker, isMobile }) => {
  if (isMobile) {
    // Mobile: 2 lines - (Name + Score/Balls) and (Stats)
    return (
      <div className="py-2 px-2 rounded-lg hover:bg-secondary/20 transition-colors">
        {/* Line 1: Name + Runs(Balls) */}
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-sm ${
              isStriker ? "font-extrabold text-primary" : "font-semibold text-foreground"
            }`}
          >
            {batter.batName}
            {isStriker && <span className="text-lg animate-pulse ml-1">🏏</span>}
          </span>
          <span className="text-sm font-semibold text-foreground">
            <span className="font-extrabold text-2xl">
              <AnimatedScore value={batter.batRuns} />
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({batter.batBalls})
            </span>
          </span>
        </div>

        {/* Line 2: Stats */}
        <div className="text-xs text-muted-foreground">
          <span>4s: <span className="font-semibold text-foreground">{batter.batFours}</span></span>
          <span className="mx-2">|</span>
          <span>6s: <span className="font-semibold text-foreground">{batter.batSixes}</span></span>
          <span className="mx-2">|</span>
          <span>SR: <span className="font-semibold text-foreground">{parseFloat(batter.batStrikeRate).toFixed(2)}</span></span>
        </div>
      </div>
    );
  }

  // Desktop: Exact layout from image - Name left, all stats right
  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/20 transition-colors">
      {/* Left side: Name only */}
      <span className="text-foreground flex items-center gap-2 flex-shrink-0">
        <span
          className={`text-base ${
            isStriker ? "font-extrabold text-primary" : "font-semibold"
          }`}
        >
          {batter.batName}
        </span>
      </span>

      {/* Right side: Score and all stats in one line */}
      <span className="text-right text-sm font-medium text-muted-foreground ml-4">
        <span className="font-extrabold text-foreground text-2xl">
          <AnimatedScore value={batter.batRuns} />
        </span>
        <span className="text-xs text-muted-foreground">
          {" "}({batter.batBalls})
        </span>
        <span className="text-xs text-muted-foreground mx-2">
          | 4s: <span className="font-semibold text-foreground">{batter.batFours}</span>
        </span>
        <span className="text-xs text-muted-foreground mx-2">
          | 6s: <span className="font-semibold text-foreground">{batter.batSixes}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          | SR: <span className="font-semibold text-foreground">{parseFloat(batter.batStrikeRate).toFixed(2)}</span>
        </span>
      </span>
    </div>
  );
});

BatterRow.displayName = "BatterRow";

const calculateCumulativeOver = (recentStats) => {
  if (!recentStats) return [];
  
  const balls = recentStats.split("|").pop().trim().split(/\s+/).filter(b => b.length > 0);
  
  let total = 0;
  return balls.map(ball => {
    const b = ball.toUpperCase();
    if (b.includes("W") && !b.includes("WD") && !b.includes("NB")) {
      // Wicket with no runs
    } else {
      const runs = parseInt(b.replace(/\D/g, "")) || 0;
      total += runs;
      if (b.includes("WD") || b.includes("NB")) total += 1;
    }
    return total;
  });
};

// Enhanced Mobile LiveView Component
const LiveView = memo(
  ({ miniscore, currentInnings, isMobile, displayScore1, displayScore2 }) => {
    const currentOverDisplay = currentInnings?.overs || "-";

    const cumulativeTotals = useMemo(() => 
      calculateCumulativeOver(miniscore?.recentOvsStats), 
    [miniscore?.recentOvsStats]);

    const overStats = useMemo(() => {
      if (!miniscore?.recentOvsStats) return { balls: [], total: 0 };
      
      const balls = miniscore.recentOvsStats.split("|").pop().trim().split(/\s+/).filter(b => b.length > 0);
      
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
      <div className={`${isMobile ? "bg-card border border-border rounded-xl p-3 mb-4 shadow-lg" : "bg-card border border-border rounded-lg p-3 mb-2 shadow-sm"}`}>
        {/* Team Name Batting */}
        <h2 className={`font-bold text-foreground flex items-center gap-3 mb-2 ${isMobile ? "text-base" : "text-lg"}`}>
          {currentInnings.batTeamName} Batting
        </h2>

        {/* Score Section with Current Over - Reorganized */}
        {(miniscore.batsmanStriker || miniscore.batTeam) && (
          <>
            {/* DESKTOP: Single row card with scores and over stats */}
            {!isMobile && (
              <div className={`mb-2 p-3 md:p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30`}>
                <div className="flex justify-between items-center gap-3">
                  {/* Left: Both Team Scores */}
                  <div className="flex gap-4 md:gap-6 items-center flex-1">
                    {/* Team 1 Score */}
                    {displayScore1 && (
                      <div className="flex flex-col">
                        <p className={`text-muted-foreground font-semibold text-xs`}>
                          {displayScore1.batTeamName}
                        </p>
                        <p className={`font-extrabold text-foreground text-2xl`}>
                          <AnimatedScore value={displayScore1.score} />/{displayScore1.wickets}
                        </p>
                        <p className={`text-muted-foreground text-xs`}>
                          ({displayScore1.overs})
                        </p>
                      </div>
                    )}

                    {/* Team 2 Score */}
                    {displayScore2 && (
                      <div className="flex flex-col">
                        <p className={`text-muted-foreground font-semibold text-xs`}>
                          {displayScore2.batTeamName}
                        </p>
                        <p className={`font-extrabold text-primary text-2xl`}>
                          <AnimatedScore value={displayScore2.score} />/{displayScore2.wickets}
                        </p>
                        <p className={`text-muted-foreground text-xs`}>
                          ({displayScore2.overs})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Current Over Stats */}
                  {miniscore.recentOvsStats && (
                    <div className="flex flex-col items-end gap-1">
                      <p className={`text-muted-foreground font-semibold text-xs`}>
                        Over {currentOverDisplay}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <BallDisplay balls={overStats.balls} lastBallIndex={overStats.balls.length - 1} />
                        <span className={`font-bold text-muted-foreground mx-1 text-base`}>=</span>
                        <span className={`font-black text-primary text-xl`}>
                          {overStats.total}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MOBILE: Scores on first row, over stats on second row */}
            {isMobile && (
              <>
                {/* Row 1: Team Scores */}
                <div className={`mb-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30`}>
                  <div className="flex gap-4 items-center justify-start">
                    {/* Team 1 Score */}
                    {displayScore1 && (
                      <div className="flex flex-col">
                        <p className={`text-muted-foreground font-semibold text-xs`}>
                          {displayScore1.batTeamName}
                        </p>
                        <p className={`font-extrabold text-foreground text-xl`}>
                          <AnimatedScore value={displayScore1.score} />/{displayScore1.wickets}
                        </p>
                        <p className={`text-muted-foreground text-xs`}>
                          ({displayScore1.overs})
                        </p>
                      </div>
                    )}

                    {/* Team 2 Score */}
                    {displayScore2 && (
                      <div className="flex flex-col">
                        <p className={`text-muted-foreground font-semibold text-xs`}>
                          {displayScore2.batTeamName}
                        </p>
                        <p className={`font-extrabold text-primary text-xl`}>
                          <AnimatedScore value={displayScore2.score} />/{displayScore2.wickets}
                        </p>
                        <p className={`text-muted-foreground text-xs`}>
                          ({displayScore2.overs})
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Current Over Stats (Separate row on mobile) */}
                {miniscore.recentOvsStats && (
                  <div className={`mb-4 p-3 rounded-lg bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50`}>
                    <p className={`text-muted-foreground text-xs font-semibold mb-2`}>Over {currentOverDisplay}</p>
                    <div className="flex flex-wrap gap-1 items-center">
                      <BallDisplay balls={overStats.balls} lastBallIndex={overStats.balls.length - 1} />
                      <span className={`font-bold text-muted-foreground mx-1 text-sm`}>=</span>
                      <span className={`font-black text-primary text-lg`}>
                        {overStats.total}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Batters Section */}
        {miniscore.batsmanStriker && (
          <div className={`${isMobile ? "mb-4 p-2 md:p-3 rounded-lg" : "mb-2 p-2 rounded-lg"} bg-gradient-to-br from-secondary/20 to-secondary/10 border border-border/50`}>
            <h3 className="text-xs md:text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
              Batters
            </h3>
            <div className={`${isMobile ? "space-y-1" : "space-y-2"}`}>
              <BatterRow
                batter={{
                  batName: miniscore.batsmanStriker.name,
                  batRuns: miniscore.batsmanStriker.runs,
                  batBalls: miniscore.batsmanStriker.balls,
                  batFours: miniscore.batsmanStriker.fours,
                  batSixes: miniscore.batsmanStriker.sixes,
                  batStrikeRate: miniscore.batsmanStriker.strikeRate,
                }}
                isStriker={true}
                isMobile={isMobile}
              />
              
              {miniscore.batsmanNonStriker && (
                <>
                  <div className={`border-t border-border ${isMobile ? "pt-1.5" : "pt-3"}`} />
                  <BatterRow
                    batter={{
                      batName: miniscore.batsmanNonStriker.name,
                      batRuns: miniscore.batsmanNonStriker.runs,
                      batBalls: miniscore.batsmanNonStriker.balls,
                      batFours: miniscore.batsmanNonStriker.fours,
                      batSixes: miniscore.batsmanNonStriker.sixes,
                      batStrikeRate: miniscore.batsmanNonStriker.strikeRate,
                    }}
                    isStriker={false}
                    isMobile={isMobile}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Current Bowler Section */}
        {miniscore.bowlerStriker && (
          <div className={`${isMobile ? "mb-3 p-1 rounded-lg" : "mb-2 p-1 rounded-lg"} bg-gradient-to-br from-secondary/20 to-secondary/10 border border-border/50`}>
            <h3 className="text-xs md:text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">
              Bowler
            </h3>
            <div className="flex justify-between items-center">
              <span className={`font-semibold text-foreground ${isMobile ? "text-sm" : "text-base"}`}>
                {miniscore.bowlerStriker.name}
              </span>
              
              {/* Stats layout - Name on left, stats on right with spacing */}
              <div className={`flex gap-6 md:gap-8 items-center ${isMobile ? "text-xs" : "text-sm"}`}>
                {/* O - Overs */}
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs mb-0.5">O</span>
                  <span className="font-semibold text-foreground">
                    {miniscore.bowlerStriker.overs}
                  </span>
                </div>
                
                {/* R - Runs */}
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs mb-0.5">R</span>
                  <span className="font-semibold text-foreground">
                    <AnimatedScore value={miniscore.bowlerStriker.runs} />
                  </span>
                </div>
                
                {/* W - Wickets */}
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs mb-0.5">W</span>
                  <span className="font-semibold text-foreground">
                    <AnimatedScore value={miniscore.bowlerStriker.wickets} />
                  </span>
                </div>
                
                {/* ECO - Economy */}
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs mb-0.5">ECO</span>
                  <span className="font-semibold text-foreground">
                    <AnimatedScore
                      value={Number(
                        miniscore.bowlerStriker.economy || 0
                      ).toFixed(2)}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Run Rate Section */}
        <div className={`${isMobile ? "mb-4 p-2 md:p-3 rounded-lg grid grid-cols-2 gap-2" : "mb-2 p-2 rounded-lg flex justify-between items-center"} bg-gradient-to-br from-accent/10 to-secondary/10 border border-border/50`}>
          {miniscore.currentRunRate !== undefined &&
            miniscore.currentRunRate !== null && (
              <div className="flex flex-col">
                <p className={`text-muted-foreground font-semibold ${isMobile ? "text-xs" : "text-sm"}`}>CRR</p>
                <p className={`font-extrabold text-primary ${isMobile ? "text-lg" : "text-3xl"}`}>
                  <AnimatedScore
                    value={Number(miniscore.currentRunRate).toFixed(2)}
                  />
                </p>
              </div>
            )}
          {miniscore.requiredRunRate !== undefined &&
            miniscore.requiredRunRate !== null &&
            miniscore.requiredRunRate > 0 && (
              <div className={`flex flex-col ${isMobile ? "" : "text-right"}`}>
                <p className={`text-muted-foreground font-semibold ${isMobile ? "text-xs" : "text-sm"}`}>RRR</p>
                <p className={`font-extrabold text-yellow-500 ${isMobile ? "text-lg" : "text-3xl"}`}>
                  <AnimatedScore
                    value={Number(miniscore.requiredRunRate).toFixed(2)}
                  />
                </p>
              </div>
            )}
        </div>

        {/* Last Wicket */}
        {miniscore.lastWicket && (
          <div className={`${isMobile ? "mb-3 p-2 rounded-lg text-xs" : "mb-2 p-2 rounded-lg text-xs"} bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30`}>
            <p className={`text-red-400 font-semibold`}>
              <strong>Last Wicket:</strong>{" "}
              <AnimatedScore value={miniscore.lastWicket} className="inline" />
            </p>
          </div>
        )}

        {/* Status */}
        {miniscore.status && (
          <div className={`${isMobile ? "p-2 rounded-lg text-sm" : "p-2 rounded-lg text-sm"} bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 text-center font-bold text-foreground`}>
            {miniscore.status}
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
        JSON.stringify(nextProps.currentInnings) &&
      prevProps.isMobile === nextProps.isMobile &&
      JSON.stringify(prevProps.displayScore1) === JSON.stringify(nextProps.displayScore1) &&
      JSON.stringify(prevProps.displayScore2) === JSON.stringify(nextProps.displayScore2)
    );
  }
);

LiveView.displayName = "LiveView";

// Enhanced Over History Section
const OversSection = memo(
  ({
    commentaryList,
    currentInnings,
    overHistory,
    isHistoryExpanded,
    setIsHistoryExpanded,
    isMobile,
  }) => {
    if (overHistory.length === 0) return null;

    const displayedOvers = isHistoryExpanded
      ? overHistory
      : overHistory.slice(0, isMobile ? 1 : 2);
    const hasMore = overHistory.length > (isMobile ? 1 : 2);

    const cleanCommText = (text) =>
      text
        .replace(/<[^>]*>?/gm, "")
        .replace(/B\d*\$/, "")
        .substring(0, 100)
        .trim();

    const calculateOverProgress = (balls) => {
      let runningTotal = 0;
      return balls.map((ball) => {
        const ballRun = ball.run.toUpperCase();
        
        if (ballRun.includes("W") && !ballRun.includes("WD") && !ballRun.includes("NB")) {
           // No runs added
        } else {
          const numericRuns = parseInt(ballRun.replace(/\D/g, "")) || 0;
          runningTotal += numericRuns;

          if (ballRun.includes("WD") || ballRun.includes("NB")) {
            runningTotal += 1;
          }
        }
        return runningTotal;
      });
    };

    return (
      <div className={`${isMobile ? "bg-card border border-border rounded-xl p-3 mb-4 shadow-lg" : "bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl"}`}>
        <h2 className={`font-bold text-foreground flex items-center gap-2 mb-4 ${isMobile ? "text-base" : "text-2xl"}`}>
          <RefreshCw size={isMobile ? 18 : 24} className="text-primary" />
          {isMobile ? "Overs" : "Innings Over History"}
        </h2>

        <div className={isMobile ? "space-y-2" : "space-y-6"}>
          {displayedOvers.map((overData) => {
            const overProgress = calculateOverProgress(overData.balls);

            return (
              <div
                key={overData.over}
                className={`${isMobile ? "bg-gradient-to-r from-secondary/30 to-secondary/10 p-2 rounded-lg" : "bg-gradient-to-r from-secondary/30 to-secondary/10 p-4 rounded-xl"} flex flex-col gap-2 border border-border/50`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`${isMobile ? "min-w-[50px] px-1.5 py-0.5 text-sm" : "min-w-[70px] p-2"} bg-primary/10 rounded-lg border border-primary/30 text-center`}>
                    <span className={`font-black text-primary block ${isMobile ? "text-xs" : "text-lg"}`}>
                      Ov {overData.over}
                    </span>
                  </div>
                  <div className="flex flex-col text-xs md:text-sm">
                    <span className="font-bold text-foreground">
                      {overData.score}-{overData.wickets}
                    </span>
                    <span className="text-muted-foreground italic">
                      {overData.runs} runs
                    </span>
                  </div>
                </div>

                {/* Ball by Ball - Responsive */}
                <div className="flex flex-wrap gap-1 md:gap-1.5 items-center">
                  {overData.balls.map((ball, index) => (
                    <div key={index} className={`flex items-center gap-0.5 ${isMobile ? "bg-background/40 p-0.5 pr-1" : "bg-background/40 p-1 pr-2.5"} rounded-full border border-border/50`}>
                      <div
                        className={`${isMobile ? "h-6 w-6 text-xs" : "h-9 w-9 text-xs"} flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 ${getBallColorClass(ball.run)}`}
                        title={`${ball.striker}: ${cleanCommText(ball.commText)}`}
                      >
                        {ball.run
                          .replace("Wd", "WD")
                          .replace("nb", "NB")
                          .replace("R", "RO")
                          .replace("L1", "LB")}
                      </div>
                      
                      <span className={`font-black text-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                        {overProgress[index]}
                      </span>
                    </div>
                  ))}
                </div>

                {!isMobile && (
                  <div className="hidden xl:flex flex-col text-right text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span>Bowler: <b className="text-foreground">{overData.bowler}</b></span>
                    <span>Striker: <b className="text-foreground">{overData.batsmanStriker}</b></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className={`w-full mt-3 md:mt-6 flex items-center justify-center gap-2 ${isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"} bg-secondary/50 text-foreground rounded-xl font-bold hover:bg-secondary transition-all border border-border shadow-sm`}
          >
            {isHistoryExpanded ? (
              <><ChevronUp size={isMobile ? 16 : 18} /> Show Less</>
            ) : (
              <><ChevronDown size={isMobile ? 16 : 18} /> View All {overHistory.length} Overs</>
            )}
          </button>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isHistoryExpanded === nextProps.isHistoryExpanded &&
      JSON.stringify(prevProps.overHistory) === JSON.stringify(nextProps.overHistory) &&
      prevProps.isMobile === nextProps.isMobile
    );
  }
);

OversSection.displayName = "OversSection";

const CompletedView = memo(({ matchHeader, allInnings, isMobile }) => {
  const statusColor = matchHeader.status.toLowerCase().includes("won")
    ? "text-green-400"
    : "text-yellow-400";

  return (
    <div className={`${isMobile ? "bg-card border border-border rounded-xl p-3 mb-4 shadow-lg" : "bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl"}`}>
      <h2 className={`font-bold text-foreground flex items-center gap-3 mb-4 ${isMobile ? "text-base" : "text-3xl"}`}>
        Match Result
      </h2>

      <div className={`${isMobile ? "p-2 rounded-lg mb-3 text-base" : "p-5 rounded-xl mb-6"} bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 text-center`}>
        <p className={`font-bold ${statusColor} ${isMobile ? "text-lg" : "text-2xl"}`}>
          {matchHeader.status}
        </p>
      </div>

      <div className={`${isMobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 md:grid-cols-2 gap-5"}`}>
        {allInnings.map((inning, index) => (
          <div
            key={index}
            className={`${isMobile ? "bg-gradient-to-br from-secondary/30 to-secondary/10 p-2 rounded-lg" : "bg-gradient-to-br from-secondary/30 to-secondary/10 p-5 rounded-xl"} border border-border/50`}
          >
            <h3 className={`font-bold text-foreground mb-2 ${isMobile ? "text-xs" : "text-lg"}`}>
              {inning.batTeamName}
            </h3>
            <div className="flex justify-between items-center">
              <p className={`font-extrabold text-foreground ${isMobile ? "text-2xl" : "text-4xl"}`}>
                {inning.score}/{inning.wickets}
              </p>
              <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-base"}`}>
                Overs: {inning.overs}
              </p>
            </div>
          </div>
        ))}
      </div>

      {matchHeader.playersOfTheMatch &&
        matchHeader.playersOfTheMatch.length > 0 && (
          <div className={`${isMobile ? "mt-3 px-2 py-1.5 rounded-lg text-xs" : "mt-6 p-4 rounded-xl text-lg"} flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30`}>
            <Award className="text-yellow-500" size={isMobile ? 16 : 24} />
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

const UpcomingView = memo(({ matchHeader, isMobile }) => (
  <div className={`${isMobile ? "bg-card border border-border rounded-xl p-4 mb-4 shadow-lg text-center" : "bg-card border border-border rounded-2xl p-8 mb-6 shadow-2xl text-center"}`}>
    <h2 className={`font-bold text-primary flex items-center justify-center gap-3 mb-3 ${isMobile ? "text-base gap-2" : "text-4xl gap-4"}`}>
      <Calendar size={isMobile ? 24 : 36} />
      {isMobile ? "Match Soon" : "Match Scheduled"}
    </h2>
    <p className={`text-muted-foreground mb-3 ${isMobile ? "text-xs" : "text-xl"}`}>
      {matchHeader.team1.name} vs {matchHeader.team2.name}
    </p>
    <div className={`${isMobile ? "py-2 px-3 inline-block text-sm rounded-lg" : "p-5 inline-block rounded-xl"} bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50`}>
      <p className={`font-bold text-foreground ${isMobile ? "text-xs" : "text-2xl"}`}>
        {isMobile ? "Starts: " : "Match starts at "}<span className="text-primary">
          {formatStartTime(matchHeader.matchStartTimestamp)}
        </span>
      </p>
    </div>
  </div>
));

UpcomingView.displayName = "UpcomingView";

// Enhanced Notification Modal
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overHistory, setOverHistory] = useState([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState("");

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const prevDataHashRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wake Lock for live matches
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && matchData?.matchHeader?.state === "In Progress") {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock was released');
          });
          console.log('Wake Lock is active');
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [matchData?.matchHeader?.state]);

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
  }, [matchId, fetchMatchDetails]);

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

  const handleOpenNotifModal = () => {
    setIsNotifModalOpen(true);
  };

  const handleSubscribe = async (teamsToAdd) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/preferences/add`,
        {
          teams: teamsToAdd,
        },
        { withCredentials: true }
      );

      setIsNotifModalOpen(false);
      setNotifSuccessMsg(`Subscribed to ${teamsToAdd.join(" & ")}`);

      setTimeout(() => setNotifSuccessMsg(""), 3000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Please login to subscribe to notifications.");
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

  const team1Name = matchHeader.team1?.name || "Team 1";
  const team2Name = matchHeader.team2?.name || "Team 2";

  let matchContentView;

  if (matchState === "Upcoming") {
    matchContentView = <UpcomingView matchHeader={matchHeader} isMobile={isMobile} />;
  } else if (
    matchState === "In Progress" ||
    matchState === "Stumps" ||
    matchState === "Innings Break" ||
    matchState === "Drinks Break" ||
    matchState === "Lunch Break"
  ) {
    matchContentView = (
      <>
        <LiveView miniscore={miniscore} currentInnings={currentInnings} isMobile={isMobile} displayScore1={displayScore1} displayScore2={displayScore2} />
        {commentaryList?.length > 0 && (
          <OversSection
            commentaryList={commentaryList}
            currentInnings={currentInnings}
            overHistory={overHistory || []}
            isHistoryExpanded={isHistoryExpanded}
            setIsHistoryExpanded={setIsHistoryExpanded}
            isMobile={isMobile}
          />
        )}
      </>
    );
  } else if (matchState === "Complete") {
    matchContentView = (
      <>
        <CompletedView matchHeader={matchHeader} allInnings={allInnings} isMobile={isMobile} />
        {commentaryList?.length > 0 && (
          <OversSection
            commentaryList={commentaryList}
            currentInnings={allInnings[0]}
            overHistory={overHistory || []}
            isHistoryExpanded={isHistoryExpanded}
            setIsHistoryExpanded={setIsHistoryExpanded}
            isMobile={isMobile}
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

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        team1={team1Name}
        team2={team2Name}
        onSubscribe={handleSubscribe}
      />

      {notifSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-right">
          <Check size={20} />
          <span className="font-bold text-sm">{notifSuccessMsg}</span>
        </div>
      )}

      <main className="flex-1">
        <div className={`${isMobile ? "px-3 py-4" : "container mx-auto px-4 py-8"}`}>
          <div className={`${isMobile ? "bg-card border border-border rounded-xl p-3 mb-4 shadow-lg" : "bg-card border border-border rounded-2xl p-5 mb-6 shadow-2xl"}`}>
            <div className={`${isMobile ? "flex flex-col gap-3 mb-3" : "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5"}`}>
              <div className={`flex items-start gap-3 flex-1 min-w-0 ${isMobile ? "" : ""}`}>
                <div className="flex-1 min-w-0">
                  <h1 className={`font-bold text-foreground mb-1 ${isMobile ? "text-base line-clamp-2" : "text-2xl sm:text-3xl"}`}>
                    {matchHeader.matchDescription}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/series/${matchHeader.seriesId - 123456}/${slugify(matchHeader.seriesName)}`}
                      className={`text-muted-foreground hover:text-primary transition-colors cursor-pointer ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {matchHeader.seriesName}
                    </Link>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${getFormatBadgeColor(
                        matchHeader.matchFormat
                      )}`}
                    >
                      {matchHeader.matchFormat}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`flex gap-2 w-full lg:w-auto ${isMobile ? "flex-col" : "flex-row"}`}>
                {displayScore1 && (
                  <div className={`${isMobile ? "text-center p-2 flex-1 bg-secondary/20 rounded-lg text-xs" : "text-right p-3 flex-1 bg-secondary/20 rounded-xl"}`}>
                    <p className={`font-semibold text-muted-foreground mb-0.5 ${isMobile ? "text-xs" : "text-xs"}`}>
                      {displayScore1.batTeamName}
                    </p>
                    <p className={`font-extrabold text-foreground whitespace-nowrap ${isMobile ? "text-lg" : "text-3xl"}`}>
                      {displayScore1.score}/{displayScore1.wickets}
                      <span className={`text-muted-foreground ml-0.5 ${isMobile ? "text-xs" : "text-sm"}`}>
                        ({displayScore1.overs})
                      </span>
                    </p>
                  </div>
                )}
                {displayScore2 && (
                  <div className={`${isMobile ? "text-center p-2 flex-1 bg-primary/10 rounded-lg text-xs" : "text-right p-3 flex-1 bg-primary/10 rounded-xl"}`}>
                    <p className={`font-semibold text-primary mb-0.5 ${isMobile ? "text-xs" : "text-xs"}`}>
                      {displayScore2.batTeamName}
                    </p>
                    <p className={`font-extrabold text-primary whitespace-nowrap ${isMobile ? "text-lg" : "text-3xl"}`}>
                      {displayScore2.score}/{displayScore2.wickets}
                      <span className={`text-muted-foreground ml-0.5 ${isMobile ? "text-xs" : "text-sm"}`}>
                        ({displayScore2.overs})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${isMobile ? "flex flex-col gap-2 pt-2 border-t border-border/50" : "flex flex-wrap justify-between items-center gap-4 pt-5 border-t border-border/50"}`}>
              <div className={`flex flex-wrap gap-3 text-sm ${isMobile ? "gap-2 text-xs" : ""}`}>
                {matchHeader.tossResults && (
                  <div className="flex gap-2">
                    <span className={`text-muted-foreground font-semibold ${isMobile ? "text-xs" : "text-xs"}`}>
                      Toss:
                    </span>
                    <span className={`font-semibold text-foreground ${isMobile ? "text-xs" : ""}`}>
                      {formatTossResult(matchHeader.tossResults)}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className={`text-muted-foreground font-semibold ${isMobile ? "text-xs" : "text-xs"}`}>
                    Status:
                  </span>
                  <span className={`font-semibold text-foreground ${isMobile ? "text-xs" : ""}`}>
                    {matchHeader.state}
                  </span>
                </div>
              </div>

              <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
                <button
                  onClick={handleOpenNotifModal}
                  className={`flex items-center justify-center gap-2 rounded-xl transition-all duration-300 bg-secondary/50 text-foreground hover:bg-yellow-500/10 hover:text-yellow-500 border border-transparent hover:border-yellow-500/50 ${isMobile ? "flex-1 px-3 py-2 text-sm" : "px-3 py-2.5"}`}
                  title="Get Notifications for this match"
                >
                  <Bell size={isMobile ? 16 : 20} />
                  {isMobile && <span className="text-xs">Notify</span>}
                </button>

                {matchState !== "Upcoming" && (
                  <>
                    <button className={`flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 bg-primary text-primary-foreground shadow-lg ${isMobile ? "flex-1 px-3 py-2" : "px-5 py-2.5"}`}>
                      <Activity size={isMobile ? 16 : 18} /> {isMobile ? "Live" : "Live"}
                    </button>
                    <Link
                      to={scorecardPath}
                      className={`flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 bg-secondary text-secondary-foreground hover:bg-secondary/80 ${isMobile ? "flex-1 px-3 py-2" : "px-5 py-2.5"}`}
                    >
                      <Table size={isMobile ? 16 : 18} /> {isMobile ? "Card" : "Scorecard"}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {matchContentView}

          {!isMobile && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center gap-3">
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
          )}
        </div>
      </main>
    </div>
  );
};

export default LiveDetails;