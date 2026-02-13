import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  Search, Clock, UserSearch , ListOrdered, 
  ChevronDown, Menu, X, ArrowLeft, User, Users,
  Gem,
  RadioTower,
  CalendarDays
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

// Featured players for mega menu
const FEATURED_PLAYERS = [
  {
    id: -122043,
    name: 'Virat Kohli',
    team: 'India',
    role: 'Batsman',
    image: 'https://iili.io/f1ZZwjs.jpg',
  },
  {
    id: -122880,
    name: 'Rohit Sharma',
    team: 'India', 
    role: 'Batsman',
    image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202408/rohit-sharma-131403807-3x4.jpg?VersionId=bxMLup7CGBT1t.IBo8cv.1liVd7jwb34',
  },
  {
    id: -123191,
    name: 'Dhoni',
    team: 'India',
    role: 'Batsman',
    image: 'https://assets.thehansindia.com/h-upload/2020/03/09/952471-dhoni.webp',
  },
];

// --- SUB-COMPONENTS ---

const NavLinkItem = memo(({ to, icon: Icon, children, isActive, onClick, isScrolled }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`nav-link ${isActive ? 'nav-link-active' : ''} ${isScrolled ? 'py-2' : 'py-2.5'}`}
  >
    <Icon size={16} />
    <span className="hidden lg:inline">{children}</span>
  </Link>
));

const MobileLink = memo(({ to, icon: Icon, children, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 text-base font-semibold rounded-xl transition-all duration-300 
      ${isActive 
        ? 'bg-primary text-primary-foreground shadow-glow-sm' 
        : 'text-foreground hover:text-primary hover:bg-secondary/50'
      }`}
  >
    <Icon size={20} />
    {children}
  </Link>
));

const SearchInput = memo(({ isMobile = false, searchQuery, setSearchQuery }) => (
  <div className={`relative ${isMobile ? 'w-full' : 'w-56 xl:w-64'}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={isMobile ? 20 : 16} />
    <input
      type="text"
      placeholder="Search teams, matches..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-full bg-secondary/50 border border-border rounded-xl placeholder:text-muted-foreground 
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300
        ${isMobile ? 'h-12 px-4 py-3 pl-11 text-base' : 'h-10 px-3 py-2 pl-9 text-sm'}`}
    />
  </div>
));

const BottomNavItem = memo(({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 relative ${
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    {isActive && (
      <span className="absolute -top-1 w-10 h-1 bg-primary rounded-full animate-fade-in" />
    )}
  </Link>
));

// --- MEGA MENU & DROPDOWNS ---

const PlayerMegaMenu = memo(({ isOpen, onClose, navigate }) => {
  const [hoveredPlayerIndex, setHoveredPlayerIndex] = useState(0);
  const timeoutRef = useRef(null);

  if (!isOpen) return null;
  const activePlayer = FEATURED_PLAYERS[hoveredPlayerIndex];

  return (
    <div 
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] z-50 pt-2 animate-scale-in origin-top"
      onMouseEnter={() => timeoutRef.current && clearTimeout(timeoutRef.current)}
      onMouseLeave={() => timeoutRef.current = setTimeout(onClose, 150)}
    >
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-5 py-3 border-b border-border/50 bg-secondary/20 flex justify-between items-center">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured Stars</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">Top 3</span>
        </div>
        <div className="flex h-[280px]">
          <div className="w-5/12 border-r border-border/50 p-2 bg-secondary/10 flex flex-col">
            <div className="space-y-1 flex-1">
              {FEATURED_PLAYERS.map((player, index) => (
                <button
                  key={player.id}
                  onMouseEnter={() => setHoveredPlayerIndex(index)}
                  onClick={() => { navigate(`/player/${player.name.toLowerCase().replace(/\s+/g, '-')}/${player.id}`); onClose(); }}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                    hoveredPlayerIndex === index ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="text-sm font-semibold">{player.name}</span>
                  {hoveredPlayerIndex === index && <ArrowLeft className="rotate-180" size={14} />}
                </button>
              ))}
            </div>
            <Link to="/players" onClick={onClose} className="flex items-center justify-center gap-2 mt-auto px-3 py-3 text-xs font-bold text-muted-foreground hover:text-primary border-t border-border/50">
              <Users size={14} /> View All
            </Link>
          </div>
          <div className="w-7/12 p-5 relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="relative z-10 w-full animate-fade-in" key={activePlayer.id}>
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <img src={activePlayer.image} alt={activePlayer.name} className="w-full h-full object-cover rounded-full border-2 border-primary p-1" />
                </div>
                <h4 className="text-lg font-bold">{activePlayer.name}</h4>
                <p className="text-xs text-primary mb-4">{activePlayer.role} • {activePlayer.team}</p>
                <button onClick={() => { navigate(`/player/${activePlayer.name.toLowerCase().replace(/\s+/g, '-')}/${activePlayer.id}`); onClose(); }} className="w-full py-2 bg-secondary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">PROFILE</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const DropdownMenu = memo(({ title, icon: Icon, items, isOpen, setIsOpen, isScrolled }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 150); };

  const groupedItems = items.reduce((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={`nav-link ${isOpen ? 'text-primary' : ''} ${isScrolled ? 'py-2' : 'py-2.5'}`}>
        <Icon size={16} />
        <span className="hidden lg:inline">{title}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-card border border-border rounded-xl shadow-2xl z-50 animate-scale-in overflow-hidden p-3">
            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-3 last:mb-0">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 px-3">{groupName}</h4>
                {groupItems.map((item, idx) => (
                  <button key={idx} onClick={() => { navigate(item.to); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary/70 hover:text-primary">
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
});

// --- MAIN NAVBAR ---

const Navbar = ({ theme, toggleTheme, searchQuery = '', setSearchQuery = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [playersMenuOpen, setPlayersMenuOpen] = useState(false);
  const playerMenuTimeoutRef = useRef(null);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCanGoBack(window.history.length > 2 && location.key !== 'default');
    setIsMenuOpen(false);
  }, [location]);

  const recordsItems = [
    { label: 'Most Runs', to: '/stats/most-runs/odi', group: 'Batting' },
    { label: 'Highest Scores', to: '/stats/highest-scores/odi', group: 'Batting' },
    { label: 'Most 100s', to: '/stats/most-100s/odi', group: 'Batting' },
    { label: 'Most Wickets', to: '/stats/most-wickets/odi', group: 'Bowling' },
  ];

  return (
    <>
      {/* TOP NAVBAR (Always Visible) */}
      <nav className={`navbar-base animate-navbar fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled bg-background/80 backdrop-blur-md shadow-lg h-14' : 'bg-background h-16 border-b border-border/30'
      }`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/twmini.png" alt="Logo" className="w-8 h-8 rounded-full shadow-glow-sm" />
              <span className="font-display font-bold text-lg lg:text-xl gradient-text">Track Wicket</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinkItem to="/live" icon={RadioTower} isActive={isActive('/live') || isActive('/')} isScrolled={isScrolled}>Live</NavLinkItem>
            <NavLinkItem to="/recent" icon={Clock} isActive={isActive('/recent')} isScrolled={isScrolled}>Recent</NavLinkItem>
            <NavLinkItem to="/upcoming" icon={CalendarDays} isActive={isActive('/upcoming')} isScrolled={isScrolled}>Upcoming</NavLinkItem>
            <NavLinkItem to="/rankings" icon={ListOrdered} isActive={location.pathname.startsWith('/rankings')} isScrolled={isScrolled}>Rank</NavLinkItem>
            <DropdownMenu title="Records" icon={Gem} items={recordsItems} isOpen={recordsOpen} setIsOpen={setRecordsOpen} isScrolled={isScrolled} />
            
            <div className="relative" onMouseEnter={() => { clearTimeout(playerMenuTimeoutRef.current); setPlayersMenuOpen(true); }} onMouseLeave={() => playerMenuTimeoutRef.current = setTimeout(() => setPlayersMenuOpen(false), 150)}>
              <Link to="/players" className={`nav-link ${isActive('/players') ? 'nav-link-active' : ''} ${isScrolled ? 'py-2' : 'py-2.5'}`}>
                <UserSearch size={16} /><span className="hidden lg:inline">Players</span>
                <ChevronDown size={14} className={`ml-1 transition-transform ${playersMenuOpen ? 'rotate-180' : ''}`} />
              </Link>
              <PlayerMegaMenu isOpen={playersMenuOpen} onClose={() => setPlayersMenuOpen(false)} navigate={navigate} />
            </div>
            <NavLinkItem to="/account" icon={User} isActive={isActive('/account')} isScrolled={isScrolled}>
                Account
              </NavLinkItem>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 rounded-xl text-foreground hover:bg-secondary">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVBAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center h-16">
          <BottomNavItem to="/recent" icon={Clock} label="Recent" isActive={isActive('/recent')} />
          <BottomNavItem to="/live" icon={RadioTower} label="Live" isActive={isActive('/live') || isActive('/')} />
          <BottomNavItem to="/upcoming" icon={CalendarDays} label="Upcoming" isActive={isActive('/upcoming')} />
          <BottomNavItem to="/account" icon={User} label="Account" isActive={isActive('/account')} />
        </div>
      </div>

      {/* MOBILE SIDEBAR (More Menu) */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] animate-fade-in" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-card z-[80] shadow-2xl animate-slide-in-right p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl gradient-text">More</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-secondary rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <SearchInput isMobile searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="pt-4 space-y-2">
                <MobileLink to="/rankings" icon={ListOrdered} isActive={isActive('/rankings')} onClick={() => setIsMenuOpen(false)}>Rankings</MobileLink>
                <MobileLink to="/players" icon={UserSearch} isActive={isActive('/players')} onClick={() => setIsMenuOpen(false)}>Players</MobileLink>
                <MobileLink to="/account" icon={User} isActive={isActive('/account')} onClick={() => setIsMenuOpen(false)}>Account</MobileLink>
                <div className="border-t border-border my-4 pt-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-4">Records</h4>
                  {recordsItems.map((item, idx) => (
                    <Link key={idx} to={item.to} onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SPACERS */}
      <div className="h-7" /> {/* Top Spacer */}
      <div className="md:hidden h-16" /> {/* Bottom Spacer */}
    </>
  );
};

export default memo(Navbar);