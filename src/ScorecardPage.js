import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Clock, ChevronDown, ChevronUp, NotebookPen, Table, Activity } from 'lucide-react'; 
import Navbar from './Navbar';

const getFormatBadgeColor = (format) => {
    switch (format?.toUpperCase()) {
        case "T20": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
        case "ODI": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
        case "TEST": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
        default: return "bg-gradient-to-r from-gray-600 to-gray-700 text-white";
    }
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'TBA';
    return new Date(timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTossResult = (tossResults) => {
    if (!tossResults) return 'Toss yet to happen';
    const decision = tossResults.decision?.toLowerCase().includes('bat') ? 'bat first' : 'bowl first';
    return `${tossResults.tossWinnerName} chose to ${decision}.`;
};

const ScorecardView = memo(({ scorecardData, liveMiniscore }) => {
    const inningsList = scorecardData?.scoreCard || []; 
    const [activeInningsCard, setActiveInningsCard] = useState(inningsList[0]?.inningsId || 1);
    const [fowExpanded, setFowExpanded] = useState(false);
    const [partnershipExpanded, setPartnershipExpanded] = useState(false);

    if (inningsList.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-2xl text-center animate-fade-in">
                <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                    <Table size={32} />
                    Scorecard Not Available
                </h2>
                <p className="text-lg text-muted-foreground">
                    Detailed scorecard data for this match is currently unavailable.
                </p>
            </div>
        );
    }

    const displayInnings = inningsList.find(i => i.inningsId === activeInningsCard);
    
    const normalizeBattingData = (batsmenData) => {
        if (!batsmenData) return [];
        return Object.values(batsmenData).filter(b => b.batName);
    };

    const normalizeBowlingData = (bowlersData) => {
        if (!bowlersData) return [];
        return Object.values(bowlersData).filter(b => b.bowlName);
    };

    const normalizeWicketsData = (wicketsData) => {
        if (!wicketsData) return [];
        return Object.values(wicketsData).filter(w => w.wktNbr);
    };

    const normalizePartnershipsData = (partnershipsData) => {
        if (!partnershipsData) return [];
        return Object.values(partnershipsData).filter(p => p.totalRuns !== undefined);
    };

    const BattingTable = ({ batTeamDetails, scoreDetails, extrasData, wicketsData, partnershipsData }) => {
        const batsmen = normalizeBattingData(batTeamDetails?.batsmenData);
        const wickets = normalizeWicketsData(wicketsData);
        const partnerships = normalizePartnershipsData(partnershipsData);

        return (
            <div className="space-y-4">
                <div className="overflow-x-auto shadow-inner rounded-xl">
                    <table className="min-w-full divide-y divide-border/50">
                        <thead className="bg-gradient-to-r from-primary/10 to-accent/10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider min-w-[150px]">
                                    Batsman
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[180px]">
                                    Dismissal
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    R
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    B
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    4s
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    6s
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    SR
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 bg-card/80">
                            {batsmen.map((b) => (
                                <tr key={b.batId} className="hover:bg-primary/5 transition-colors duration-200">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground flex items-center gap-2">
                                        {b.batName}
                                        {b.isCaptain && <span className="text-xs font-normal text-muted-foreground">(c)</span>}
                                        {liveMiniscore?.batsmanStriker?.batName === b.batName && <span className="text-primary text-base animate-bounce">🏏</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground italic">
                                        {b.outDesc || 'not out'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
                                        {b.runs}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                        {b.balls}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                        {b.fours}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                        {b.sixes}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                                        {parseFloat(b.strikeRate).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="p-5 bg-gradient-to-r from-secondary/20 to-secondary/10 flex flex-col sm:flex-row justify-between gap-4 border-t border-border">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-bold text-foreground">
                                Extras: <span className="text-primary">{extrasData.total}</span> 
                                <span className="text-xs text-muted-foreground ml-2">
                                    (WD: {extrasData.wides}, NB: {extrasData.noBalls}, LB: {extrasData.legByes}, B: {extrasData.byes})
                                </span>
                            </p>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground whitespace-nowrap">
                            TOTAL: {scoreDetails.runs}/{scoreDetails.wickets} 
                            <span className="text-base text-muted-foreground ml-2">({scoreDetails.overs} Ov)</span>
                        </p>
                    </div>
                </div>

                {/* Fall of Wickets Dropdown */}
                {wickets.length > 0 && (
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                        <button
                            onClick={() => setFowExpanded(!fowExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 transition-all"
                        >
                            <span className="text-base font-bold text-foreground flex items-center gap-2">
                                <span className="text-red-500">❌</span> Fall of Wickets
                            </span>
                            {fowExpanded ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
                        </button>
                        
                        {fowExpanded && (
                            <div className="p-4 bg-secondary/10 space-y-2 animate-fade-in">
                                {wickets.map((wicket, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-extrabold text-red-500">{wicket.wktNbr}</span>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{wicket.batName || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {wicket.wktRuns}/{wicket.wktNbr} in {wicket.wktOver} overs
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground">{wicket.wktOver}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Partnerships Dropdown */}
                {partnerships.length > 0 && (
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                        <button
                            onClick={() => setPartnershipExpanded(!partnershipExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 transition-all"
                        >
                            <span className="text-base font-bold text-foreground flex items-center gap-2">
                                <span className="text-green-500">🤝</span> Partnerships
                            </span>
                            {partnershipExpanded ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
                        </button>
                        
                        {partnershipExpanded && (
                            <div className="p-4 bg-secondary/10 space-y-2 animate-fade-in">
                                {partnerships.map((partnership, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-foreground mb-1">
                                                {partnership.bat1Name || 'N/A'} & {partnership.bat2Name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {partnership.bat1Runs || 0}({partnership.bat1Balls || 0}) + {partnership.bat2Runs || 0}({partnership.bat2Balls || 0})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-primary">{partnership.totalRuns}</p>
                                            <p className="text-xs text-muted-foreground">{partnership.totalBalls} balls</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };
    
    const BowlingTable = ({ bowlTeamDetails, liveMiniscore }) => {
        const bowlers = normalizeBowlingData(bowlTeamDetails?.bowlersData);
        const bowlingTeamName = bowlTeamDetails?.bowlTeamName;

        return (
            <div className="overflow-x-auto shadow-inner rounded-xl mt-6">
                <h3 className="text-xl font-bold text-foreground p-4 bg-gradient-to-r from-accent/20 to-accent/10 border-b border-border">
                    {bowlingTeamName} Bowling
                </h3>
                <table className="min-w-full divide-y divide-border/50">
                    <thead className="bg-gradient-to-r from-primary/10 to-accent/10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider min-w-[120px]">
                                Bowler
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                O
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                M
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                R
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                W
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                ECO
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 bg-card/80">
                        {bowlers.map((b) => (
                            <tr key={b.bowlerId} className="hover:bg-primary/5 transition-colors duration-200">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground flex items-center gap-2">
                                    {b.bowlName}
                                    {liveMiniscore?.bowlerStriker?.bowlName === b.bowlName && <span className="text-primary text-sm font-normal"> (bowling)</span>}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                    {b.overs}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                    {b.maidens}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                    {b.runs}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-red-400">
                                    {b.wickets}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                                    {parseFloat(b.economy).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <NotebookPen size={28} className="text-primary" />
                Full Match Scorecard
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 w-full mb-6 p-1 bg-secondary/50 rounded-xl shadow-inner gap-2">
                {inningsList.map((inning) => (
                    <button
                        key={inning.inningsId}
                        onClick={() => setActiveInningsCard(inning.inningsId)}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                            activeInningsCard === inning.inningsId
                                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-105"
                                : "text-muted-foreground hover:bg-secondary/80"
                        }`}
                    >
                        {inning.batTeamDetails.batTeamShortName} (Inn. {inning.inningsId})
                    </button>
                ))}
            </div>

            {displayInnings && (
                <div className="space-y-6">
                    <div className="border border-border rounded-xl overflow-hidden">
                        <h3 className="text-xl font-bold text-foreground p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 flex justify-between items-center border-b border-border">
                            {displayInnings.batTeamDetails.batTeamName} Batting
                            <span className="text-base font-normal text-muted-foreground">
                                {displayInnings.scoreDetails.runs}/{displayInnings.scoreDetails.wickets} ({displayInnings.scoreDetails.overs} Ov)
                            </span>
                        </h3>
                        <BattingTable 
                            batTeamDetails={displayInnings.batTeamDetails} 
                            scoreDetails={displayInnings.scoreDetails}
                            extrasData={displayInnings.extrasData}
                            wicketsData={displayInnings.wicketsData}
                            partnershipsData={displayInnings.ppData?.pp}
                        />
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                        <BowlingTable 
                            bowlTeamDetails={displayInnings.bowlTeamDetails} 
                            liveMiniscore={liveMiniscore} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

const ScorecardPage = ({ theme, toggleTheme }) => { // Accepting theme props
    const { matchId, teamsSlug, seriesSlug } = useParams();
    const navigate = useNavigate();

    const [scorecardData, setScorecardData] = useState(null); 
    const [liveData, setLiveData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const intervalRef = useRef(null);
    const isMountedRef = useRef(true);
    const prevDataRef = useRef({ scorecard: null, live: null });
    
    // Update page title
    useEffect(() => {
        if (liveData?.matchHeader) {
            const { matchHeader } = liveData;
            const team1 = matchHeader.team1?.sName || matchHeader.team1?.name || 'Team1';
            const team2 = matchHeader.team2?.sName || matchHeader.team2?.name || 'Team2';
            document.title = `Scorecard: ${team1} vs ${team2} - Track Wicket`;
        } else {
            document.title = 'Match Scorecard - Track Wicket';
        }
    }, [liveData]);

    const fetchAllData = useCallback(async () => {
        try {
            const [detailsResponse, scorecardResponse] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_BASE_URL}/match-details/${matchId}`),
                fetch(`${process.env.REACT_APP_API_BASE_URL}/match-scorecard/${matchId}`)
            ]);

            const detailsResult = await detailsResponse.json();
            const scorecardResult = await scorecardResponse.json();
            
            if (detailsResult.status === 'success' && isMountedRef.current) {
                const newLiveData = detailsResult.data;
                if (JSON.stringify(prevDataRef.current.live) !== JSON.stringify(newLiveData)) {
                    setLiveData(newLiveData);
                    prevDataRef.current.live = newLiveData;
                }
            }
            
            if (scorecardResult.status === 'success' && scorecardResult.data && isMountedRef.current) {
                const newScorecardData = scorecardResult.data;
                if (JSON.stringify(prevDataRef.current.scorecard) !== JSON.stringify(newScorecardData)) {
                    setScorecardData(newScorecardData);
                    prevDataRef.current.scorecard = newScorecardData;
                }
            } else {
                setError(scorecardResult.message || 'Failed to load scorecard data.');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            if (!liveData && !scorecardData) {
                setError('Unable to load data. Please try again.');
            }
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    }, [matchId, liveData, scorecardData, loading]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchAllData(); 

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) { 
                clearInterval(intervalRef.current); 
            }
        };
    }, [matchId]);

    // Smart polling
    useEffect(() => {
        if (!liveData?.matchHeader) return;

        const matchState = liveData.matchHeader.state;
        let pollingInterval;

        if (matchState === 'In Progress' || matchState === 'Stumps') {
            pollingInterval = 1000; // 1 second for live matches
        } else if (matchState === 'Complete') {
            pollingInterval = 30000; // 30 seconds for completed
        } else {
            pollingInterval = 60000;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(fetchAllData, pollingInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [liveData?.matchHeader?.state, fetchAllData]);

    if (loading) {
         return (
             <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
                 <p className="text-foreground text-lg">Loading scorecard...</p>
             </div>
         );
    }

    if (error || !liveData || !liveData.matchHeader) {
         return (
             <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                 <p className="text-red-500 text-lg">Error loading data: {error || 'No match data available'}</p>
                 <button onClick={() => navigate('/live')} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg">
                     Back to Live Matches
                 </button>
             </div>
         );
    }

    const { matchHeader, miniscore } = liveData;
    const allInnings = miniscore?.matchScoreDetails?.inningsScoreList || [];
    const displayScore1 = allInnings.find(i => i.inningsId === 1) || null;
    const displayScore2 = allInnings.find(i => i.inningsId === 2) || null;
    const matchState = matchHeader.state;
    const livePath = `/match/${matchId}/${teamsSlug}/${seriesSlug}/live`;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery={''} setSearchQuery={() => {}} isMatchDetails={true} />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 animate-fade-in">
                    <button
                        onClick={() => navigate('/live')}
                        className="flex items-center gap-2 mb-6 px-5 py-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-200 font-semibold hover:gap-3 shadow-lg"
                    >
                        <ChevronLeft size={20} />
                        Back to Live Matches
                    </button>

                    <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-2xl">
                        
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
                            
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <Trophy className="text-primary min-w-[28px] mt-1" size={28} />
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                        {matchHeader.matchDescription}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            {matchHeader.seriesName}
                                        </p>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getFormatBadgeColor(matchHeader.matchFormat)}`}>
                                            {matchHeader.matchFormat}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-row gap-5 w-full lg:w-auto">
                                {displayScore1 && (
                                    <div className="text-right p-3 flex-1 bg-secondary/20 rounded-xl">
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">{displayScore1.batTeamName}</p>
                                        <p className="text-3xl font-extrabold text-foreground whitespace-nowrap">
                                            {displayScore1.score}/{displayScore1.wickets}
                                            <span className="text-sm text-muted-foreground ml-1">({displayScore1.overs})</span>
                                        </p>
                                    </div>
                                )}
                                {displayScore2 && (
                                    <div className="text-right p-3 border-l-2 border-primary flex-1 bg-primary/10 rounded-xl">
                                        <p className="text-xs font-semibold text-primary mb-1">{displayScore2.batTeamName}</p>
                                        <p className="text-3xl font-extrabold text-primary whitespace-nowrap">
                                            {displayScore2.score}/{displayScore2.wickets}
                                            <span className="text-sm text-muted-foreground ml-1">({displayScore2.overs})</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-4 pt-5 border-t border-border/50">
                            <div className="flex flex-wrap gap-6 text-sm">
                                {matchHeader.tossResults && (
                                    <div className="flex gap-2">
                                        <span className="text-xs text-muted-foreground font-semibold">Toss:</span>
                                        <span className="font-semibold text-foreground">
                                            {formatTossResult(matchHeader.tossResults)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <span className="text-xs text-muted-foreground font-semibold">Status:</span>
                                    <span className="font-semibold text-foreground">
                                        {matchHeader.state}
                                    </span>
                                </div>
                            </div>
                            
                            {matchState !== 'Upcoming' && (
                                <div className="flex gap-3">
                                    <Link
                                        to={livePath}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    >
                                        <Activity size={18} /> Live
                                    </Link>
                                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-primary text-primary-foreground shadow-lg">
                                        <Table size={18} /> Scorecard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <ScorecardView 
                        scorecardData={scorecardData} 
                        liveMiniscore={miniscore}
                    />
                    
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center gap-3">
                            <Clock size={24} className="text-primary" />
                            Match Information
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex flex-col py-2">
                                <span className="text-muted-foreground text-sm font-semibold mb-1">Start Time:</span>
                                <span className="font-semibold text-foreground">{formatDate(matchHeader.matchStartTimestamp)}</span>
                            </div>
                            <div className="flex flex-col py-2">
                                <span className="text-muted-foreground text-sm font-semibold mb-1">Venue:</span>
                                <span className="font-semibold text-foreground">{matchHeader.venue || 'TBA'}</span>
                            </div>
                            <div className="flex flex-col py-2">
                                <span className="text-muted-foreground text-sm font-semibold mb-1">Match Type:</span>
                                <span className="font-semibold text-foreground">{matchHeader.matchType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ScorecardPage;