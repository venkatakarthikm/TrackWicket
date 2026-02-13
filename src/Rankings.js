import React, { useState, useEffect, memo } from "react";
import { Trophy, User, Users, Calendar, ChevronRight } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Loading from "./Loading";
import { Helmet } from 'react-helmet-async';
import SEO from './SEO';

// Add this function to generate SEO config based on ranking type
const getRankingSEOConfig = (gender, category, format) => {
  const genderText = gender === 'men' ? "Men's" : "Women's";
  const categoryText = category === 'batsmen' ? 'Batting' : 
                       category === 'bowlers' ? 'Bowling' : 
                       category === 'allrounders' ? 'All-Rounder' : 'Team';
  const formatText = format.toUpperCase();
  
  const title = `${genderText} ${categoryText} Rankings ${formatText} - ICC Cricket`;
  const description = `Latest ${genderText} ${categoryText} rankings for ${formatText} cricket. Track ICC official rankings, player ratings, and positions updated regularly on Track Wicket by Muchu Venkata Karthik.`;
  const keywords = `${genderText} ${categoryText} rankings, ${formatText} rankings, ICC cricket rankings, ${genderText} cricket, cricket player rankings, ${formatText} ${categoryText}, Track Wicket rankings, international cricket rankings`;
  
  return {
    title,
    description,
    keywords,
    canonical: `https://trackwicket.tech/rankings/${gender}/${category}/${format}`,
    breadcrumbs: [
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Rankings",
        "item": "https://trackwicket.tech/rankings"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${genderText} ${categoryText}`,
        "item": `https://trackwicket.tech/rankings/${gender}/${category}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": formatText,
        "item": `https://trackwicket.tech/rankings/${gender}/${category}/${format}`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      "name": `ICC ${genderText} ${categoryText} Rankings - ${formatText}`,
      "sport": "Cricket",
      "url": `https://trackwicket.tech/rankings/${gender}/${category}/${format}`,
      "description": description
    }
  };
};

// --- RANKING POSTER COMPONENT ---
const RankingPoster = ({ player, isFirst }) => {
  const isUp = player.change?.includes("+");
  const isDown = player.change?.includes("-");
  const navigate = useNavigate();

  const handlePlayerClick = () => {
    // Navigates using standard URI encoding (%20 for spaces)
    const searchName = encodeURIComponent(player.playerName);
    navigate(`/players?search=${searchName}`);
  };

  return (
    <div
      className={`group relative rounded-2xl transition-all duration-500 bg-card border border-border shadow-md 
      /* Crucial: overflow-visible allows the rank to pop out */
      overflow-visible ${
        isFirst
          ? "col-span-full md:col-span-2 lg:col-span-3 min-h-[260px] mb-8"
          : "min-h-[340px] mt-4"
      }`}
    >
      {/* Background Flag for Rank #1 */}
      {isFirst && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
          <img
            src={player.countryImage}
            alt="Flag Background"
            className="w-full h-full object-contain opacity-40 transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/60 to-card/80"></div>
        </div>
      )}

      {/* OUT-OF-BOUNDS RANK NUMBER */}
      <div
        className={`absolute font-black italic select-none transition-all duration-700 ease-out z-0 
          /* Darkens and Pops out on Hover */
          opacity-10 group-hover:opacity-30 group-hover:scale-125 
          text-foreground pointer-events-none
          ${
            isFirst
              ? "text-[16rem] -left-16 -bottom-12 group-hover:-translate-x-4"
              : "text-[10rem] -left-10 -bottom-8 group-hover:-translate-y-4"
          }
        `}
      >
        {player.rank === "=" ? "" : player.rank}
      </div>

      <div
        className={`flex relative z-10 h-full w-full ${
          isFirst ? "flex-row items-center" : "flex-col"
        }`}
      >
        {/* Player Image */}
        <div
          className={`relative flex-shrink-0 transition-transform duration-500 group-hover:-translate-y-6 group-hover:scale-105 ${
            isFirst ? "w-1/2 md:w-1/3 h-56 md:h-64" : "w-full h-56"
          }`}
        >
          <img
            src={player.playerImage}
            alt={player.playerName}
            className="w-full h-full object-contain object-bottom"
            onError={(e) => {
              e.target.src =
                "https://images.icc-cricket.com/icc-web/image/upload/t_player-headshot-portrait/prd/assets/players/generic/colored/default.png";
            }}
          />
        </div>

        {/* Player Details */}
        <div
          className={`flex-1 p-6 flex flex-col justify-center ${
            isFirst ? "pl-4" : "items-center text-center"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <img
              src={player.countryImage}
              className="w-6 h-4 rounded-sm object-cover shadow-sm"
              alt={player.countryName}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              {player.countryName}
            </span>
          </div>

          <h3
            onClick={handlePlayerClick}
            className={`leading-tight mb-6 uppercase font-black tracking-tighter cursor-pointer transition-all 
              hover:text-primary hover:drop-shadow-[0_0_10px_rgba(var(--primary),0.5)] active:scale-95
              ${isFirst ? "text-3xl md:text-5xl" : "text-2xl"}
            `}
          >
            {player.playerName}
          </h3>

          <div
            className={`flex items-center gap-6 ${
              isFirst ? "justify-start" : "justify-center"
            }`}
          >
            <div>
              <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">
                Points
              </p>
              <p className={`${isFirst ? "text-3xl" : "text-xl"} font-black`}>
                {player.points}
              </p>
            </div>

            <div className="h-8 w-px bg-border opacity-50"></div>

            <div>
              <p className="text-[9px] uppercase font-black text-muted-foreground mb-1">
                Status
              </p>
              <p
                className={`font-black whitespace-nowrap ${
                  isUp
                    ? "text-green-500"
                    : isDown
                    ? "text-red-500"
                    : "text-muted-foreground"
                } ${isFirst ? "text-2xl" : "text-lg"}`}
              >
                {player.change}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PLAYER RANKINGS CONTENT COMPONENT ---
const PlayerRankingsContent = ({ gender, role, formatFromUrl }) => {
  const [format, setFormat] = useState(formatFromUrl || "odi");
  const location = useLocation();


  // Dynamic SEO Logic
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);
  const genderName = gender.charAt(0).toUpperCase() + gender.slice(1);
  const formatName = format.toUpperCase();
  const dynamicTitle = `ICC ${genderName} ${formatName} ${roleName} Rankings | Track Wicket`;
  const dynamicDesc = `Latest ICC ${genderName} cricket rankings for ${roleName} in ${formatName} format. View top-ranked players, current points, and rating changes on Track Wicket.`;
  const currentUrl = `https://trackwicket.tech${location.pathname}`;

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 3) % 7));
    return d.toISOString().split("T")[0];
  });
  const [rankings, setRankings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(7);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formats = gender === "women" ? ["odi", "t20"] : ["odi", "test", "t20"];

  useEffect(() => {
    navigate(`/rankings/${gender}/${role}/${format}`, { replace: true });
  }, [gender, role, format, navigate]);

  useEffect(() => {
    const fetchRanks = async () => {
      setLoading(true);
      try {
        const dateSlug = date.replace(/-/g, "");
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/ranking/${gender}/${role}/${format}/${dateSlug}`
        );
        const data = await res.json();
        setRankings(data.rankings || []);
      } catch (e) {
        console.error(e);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRanks();
  }, [gender, role, format, date]);
const seoConfig = getRankingSEOConfig(gender, role, format);
  return (
    <div className="space-y-12 pb-20">
      <SEO {...seoConfig} />
      <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>Track Wicket - {seoConfig.title}</h1>
      <Helmet>
        {/* Standard SEO */}
        <title>{dynamicTitle}</title>
        <meta name="description" content={dynamicDesc} />
        <link rel="canonical" href={currentUrl} />
        <meta name="keywords" content={`icc rankings, ${gender} ${role}, ${format} rankings, top 10 batsmen, top 10 bowlers, cricket ratings`} />

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

        {/* Table Schema (Helps Google understand this is a data list) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Table",
            "about": `ICC ${genderName} ${roleName} Rankings for ${formatName}`
          })}
        </script>
      </Helmet>
      <div className="flex flex-col gap-4 bg-card border p-2 rounded-3xl lg:flex-row lg:justify-between items-center shadow-sm">
        <div className="flex bg-secondary/40 p-1 rounded-2xl w-full lg:w-auto">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFormat(f);
                setVisibleCount(7);
              }}
              className={`flex-1 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                format === f
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5">
          <Calendar size={16} className="text-primary" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-[11px] font-black outline-none cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          {/* Using the custom loader with the 'large' size and custom message */}
          <Loading message="TRACKWICKET" size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 px-4">
            {rankings.slice(0, visibleCount).map((p, i) => (
              <RankingPoster key={i} player={p} i={i} isFirst={i === 0} />
            ))}
          </div>

          {rankings.length > 7 && (
            <div className="text-center mt-12">
              <button
                onClick={() =>
                  setVisibleCount(visibleCount === 7 ? rankings.length : 7)
                }
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg"
              >
                {visibleCount === 7 ? "View Full Table" : "Show Top 7"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- MAIN RANKINGS PAGE ---
const Rankings = ({ theme, toggleTheme }) => {
  const { gender, role, format } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(gender || "men");
  const [activeSubTab, setActiveSubTab] = useState(role || "batsmen");

  const sidebarItems = [
    { id: "team-ranking", label: "Team Rankings", icon: Trophy },
    { id: "men", label: "Men Players", icon: User },
    { id: "women", label: "Women Players", icon: Users },
  ];

  const subTabs = ["batsmen", "bowler", "all-rounder"];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Helmet>
        <title>ICC Cricket Player & Team Rankings | Track Wicket</title>
        <meta name="description" content="Official ICC Cricket rankings for Test, ODI, and T20I. Check player standings for batsmen, bowlers, and all-rounders." />
      </Helmet>
      
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="flex flex-col md:flex-row flex-1">
        <aside className="w-full md:w-80 border-r bg-card/30 backdrop-blur-sm">
          <div className="p-6 sticky top-0">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const hasSubTabs = item.id === "men" || item.id === "women";

                return (
                  <div key={item.id} className="flex flex-col">
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (hasSubTabs) {
                          setActiveSubTab("batsmen");
                          navigate(
                            `/rankings/${item.id}/batsmen/${format || "odi"}`
                          );
                        }
                      }}
                      className={`w-full px-5 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <Icon size={20} />
                        <span className="font-bold text-sm tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {hasSubTabs && (
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-300 ${
                            isActive ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* SMOOTH SUB-TAB ANIMATION */}
                    <div
                      className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
                        hasSubTabs && isActive
                          ? "grid-rows-[1fr] opacity-100 mt-2"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-9 flex flex-col gap-1 pb-4 border-l-2 border-border/50 pl-4">
                          {subTabs.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => {
                                setActiveSubTab(sub);
                                navigate(
                                  `/rankings/${item.id}/${sub}/${
                                    format || "odi"
                                  }`
                                );
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                activeSubTab === sub
                                  ? "text-primary translate-x-1"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {sub.replace("-", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
          {activeTab === "team-ranking" ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <Trophy size={80} />
              <h2 className="text-2xl font-black uppercase italic mt-4">
                Coming Soon
              </h2>
            </div>
          ) : (
            <PlayerRankingsContent
              gender={activeTab}
              role={activeSubTab}
              formatFromUrl={format}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default memo(Rankings);
