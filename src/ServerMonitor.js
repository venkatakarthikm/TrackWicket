import React, { useState, useEffect } from "react";

const TECHNICAL_LOGS = [
  "INITIALIZING V2 ENGINE...",
  "MIGRATING DataBase TO DISTRIBUTED CLUSTER...",
  "DEEP-FLUSHING REDIS CACHE LAYERS",
  "REFRESHING CDN EDGE NODES (LONDON, MUMBAI, NYC)",
  "RECALIBRATING SCORE-UPDATE DELAY: < 10ms",
  "INJECTING NEW API SERVICE: SERIES_ANALYTICS_V4",
  "ENCRYPTING BACK-END SOCKET TUNNELS",
  "PATCHING SECURITY VULNERABILITY CVE-2026-X8",
  "OPTIMIZING REACT-DOM RECONCILIATION ALGORITHM",
  "REBUILDING ELASTICSEARCH INDEXES..."
];

const ServerMonitor = ({ children }) => {
  const [isServerDown, setIsServerDown] = useState(false);
  const [logs, setLogs] = useState(["BOOTING UPGRADE HANDLER..."]);
  const healthUrl = `${process.env.REACT_APP_API_BASE_URL}/health`;

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(healthUrl);
        setIsServerDown(!response.ok);
      } catch (e) {
        setIsServerDown(true);
      }
    };
    const interval = setInterval(checkHealth, 5000);
    checkHealth();
    return () => clearInterval(interval);
  }, [healthUrl]);

  useEffect(() => {
    if (isServerDown) {
      const logInterval = setInterval(() => {
        const newLog = TECHNICAL_LOGS[Math.floor(Math.random() * TECHNICAL_LOGS.length)];
        setLogs(prev => [newLog, ...prev.slice(0, 5)]);
      }, 2500);
      return () => clearInterval(logInterval);
    }
  }, [isServerDown]);

  if (isServerDown) {
    return (
      <>
        {/* In-Page CSS Injection */}
        <style>{`
          @keyframes clockwise { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes counter-clockwise { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }

          .gearbox {
            background: #111;
            height: 150px;
            width: 200px;
            position: relative;
            border: none;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0px 0px 25px rgba(0,0,0,0.5), 0px 0px 0px 1px rgba(255, 255, 255, 0.1);
            transform: scale(1.2);
          }

          .gearbox .overlay {
            border-radius: 6px;
            content: "";
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 10;
            box-shadow: inset 0px 0px 20px black;
            background: transparent;
          }

          .gear {
            position: absolute;
            height: 60px; width: 60px;
            box-shadow: 0px -1px 0px 0px #888888, 0px 1px 0px 0px black;
            border-radius: 30px;
          }

          .gear.large { height: 120px; width: 120px; border-radius: 60px; }

          .gear.one { top: 12px; left: 10px; }
          .gear.two { top: 61px; left: 60px; }
          .gear.three { top: 110px; left: 10px; }
          .gear.four { top: 13px; left: 128px; }

          .gear:after {
            content: "";
            position: absolute;
            height: 36px; width: 36px;
            border-radius: 36px;
            background: #111;
            top: 50%; left: 50%;
            margin-left: -18px; margin-top: -18px;
            z-index: 3;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1), inset 0px 0px 10px rgba(0, 0, 0, 0.1);
          }

          .gear.large:after {
            height: 96px; width: 96px; border-radius: 48px;
            margin-left: -48px; margin-top: -48px;
          }

          .gear-inner {
            position: relative;
            height: 100%; width: 100%;
            background: #555;
            border-radius: 30px;
          }

          .gear.one .gear-inner { animation: counter-clockwise 3s infinite linear; }
          .gear.two .gear-inner { animation: clockwise 3s infinite linear; }
          .gear.three .gear-inner { animation: counter-clockwise 3s infinite linear; }
          .gear.four .gear-inner { animation: counter-clockwise 6s infinite linear; }

          .gear-inner .bar {
            background: #555;
            height: 16px; width: 76px;
            position: absolute;
            left: 50%; margin-left: -38px;
            top: 50%; margin-top: -8px;
            border-radius: 2px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
          }

          .large .gear-inner .bar { margin-left: -68px; width: 136px; }
          .gear-inner .bar:nth-child(2) { transform: rotate(60deg); }
          .gear-inner .bar:nth-child(3) { transform: rotate(120deg); }
          .gear-inner .bar:nth-child(4) { transform: rotate(90deg); }
          .gear-inner .bar:nth-child(5) { transform: rotate(30deg); }
          .gear-inner .bar:nth-child(6) { transform: rotate(150deg); }
        `}</style>

        <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center p-4 font-mono overflow-hidden">
          {/* Ambient Grid Background using Tailwind */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          <div className="mb-12 relative">
            <div className="gearbox">
              <div className="overlay"></div>
              <div className="gear one"><div className="gear-inner"><div className="bar"></div><div className="bar"></div><div className="bar"></div></div></div>
              <div className="gear two"><div className="gear-inner"><div className="bar"></div><div className="bar"></div><div className="bar"></div></div></div>
              <div className="gear three"><div className="gear-inner"><div className="bar"></div><div className="bar"></div><div className="bar"></div></div></div>
              <div className="gear four large">
                <div className="gear-inner">
                  <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                  <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-blue-500 font-bold tracking-widest text-[10px] animate-pulse">
              INFRASTRUCTURE_SYNC_ACTIVE
            </div>
          </div>

          <div className="text-center max-w-xl z-10 mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
              Track <span className="text-blue-600 underline">Wicket</span>
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed uppercase tracking-widest">
              Deployment of Enhanced Series Analytics in progress...
            </p>
          </div>

          <div className="w-full max-w-2xl bg-black/80 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl z-10">
            <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
              </div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Root@Server:~/Upgrade</div>
            </div>
            
            <div className="p-4 h-40 overflow-hidden flex flex-col-reverse gap-2">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] md:text-xs flex gap-3">
                  <span className="text-blue-500 font-bold whitespace-nowrap opacity-50">[{new Date().toLocaleTimeString()}]</span>
                  <span className={`${i === 0 ? 'text-green-400' : 'text-neutral-600'} truncate uppercase tracking-wider`}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-blue-600/5 p-4 border-t border-neutral-800 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[9px] text-neutral-600 uppercase">Node_Thread</div>
                <div className="text-xs text-blue-400 font-bold">#492_ACTIVE</div>
              </div>
              <div className="text-center border-x border-neutral-800">
                <div className="text-[9px] text-neutral-600 uppercase">Buffer_Cache</div>
                <div className="text-xs text-blue-400 font-bold">OPTIMIZING</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-neutral-600 uppercase">Status</div>
                <div className="text-xs text-orange-500 font-bold animate-pulse italic">LEVEL_UP</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return children;
};

export default ServerMonitor;