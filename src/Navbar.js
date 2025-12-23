import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  Search, Activity, Clock, Bell, BarChart3, ListOrdered, 
  ChevronDown, Menu, X, ArrowLeft, User, Users
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

// NavLink component
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
NavLinkItem.displayName = 'NavLinkItem';

// Mobile Link
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
MobileLink.displayName = 'MobileLink';

// Search Input
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
SearchInput.displayName = 'SearchInput';

// --- NEW REDESIGNED PLAYER MEGA MENU ---
const PlayerMegaMenu = memo(({ isOpen, onClose, navigate }) => {
  const [hoveredPlayerIndex, setHoveredPlayerIndex] = useState(0);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  };

  const handlePlayerClick = (player) => {
    const slug = player.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/player/${slug}/${player.id}`);
    onClose();
  };

  if (!isOpen) return null;

  const activePlayer = FEATURED_PLAYERS[hoveredPlayerIndex];

  return (
    <div 
      ref={menuRef}
      // Wider container with absolute positioning to center it relative to parent
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] z-50 pt-2 animate-scale-in origin-top"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card Container with Backdrop Blur */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header Strip */}
        <div className="px-5 py-3 border-b border-border/50 bg-secondary/20 flex justify-between items-center">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Featured Stars
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
            Top 3
          </span>
        </div>

        <div className="flex h-[280px]">
          {/* LEFT COL: Player List */}
          <div className="w-5/12 border-r border-border/50 p-2 bg-secondary/10 flex flex-col">
            <div className="space-y-1 flex-1">
              {FEATURED_PLAYERS.map((player, index) => (
                <button
                  key={player.id}
                  onMouseEnter={() => setHoveredPlayerIndex(index)}
                  onClick={() => handlePlayerClick(player)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                    hoveredPlayerIndex === index 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${hoveredPlayerIndex === index ? 'text-white' : ''}`}>
                      {player.name}
                    </span>
                  </div>
                  {hoveredPlayerIndex === index && (
                    <ArrowLeft className="rotate-180" size={14} />
                  )}
                </button>
              ))}
            </div>

            {/* View All Link at Bottom */}
            <Link
              to="/players"
              onClick={onClose}
              className="flex items-center justify-center gap-2 mt-auto px-3 py-3 text-xs font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border/50"
            >
              <Users size={14} />
              View All Players
            </Link>
          </div>

          {/* RIGHT COL: Active Player Preview Card */}
          <div className="w-7/12 p-5 relative overflow-hidden flex flex-col items-center justify-center text-center">
             
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
             
             {/* Dynamic Content */}
             <div className="relative z-10 w-full animate-fade-in" key={activePlayer.id}>
                {/* Image Ring */}
                <div className="relative w-28 h-28 mx-auto mb-4 group cursor-pointer" onClick={() => handlePlayerClick(activePlayer)}>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-dashed animate-spin-slow" />
                  <div className="absolute inset-1 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <img
                    src={activePlayer.image}
                    alt={activePlayer.name}
                    className="w-full h-full object-cover rounded-full p-1.5 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/152x152/1e3a5f/0ea5e9?text=${activePlayer.name.charAt(0)}`;
                    }}
                  />
                </div>

                {/* Info */}
                <h4 className="text-xl font-display font-bold text-foreground mb-1">
                  {activePlayer.name}
                </h4>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {activePlayer.team}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-xs font-medium text-primary">
                    {activePlayer.role}
                  </span>
                </div>

                <button
                  onClick={() => handlePlayerClick(activePlayer)}
                  className="w-full py-2 text-xs font-bold uppercase tracking-wide bg-secondary hover:bg-primary hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <User size={14} />
                  View Profile
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});
PlayerMegaMenu.displayName = 'PlayerMegaMenu';

// Dropdown Menu Component
const DropdownMenu = memo(({ title, icon: Icon, items, isOpen, setIsOpen, isScrolled }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  
  const handleLinkClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`nav-link ${isOpen ? 'text-primary' : ''} ${isScrolled ? 'py-2' : 'py-2.5'}`}
      >
        <Icon size={16} />
        <span className="hidden lg:inline">{title}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-card border border-border rounded-xl shadow-2xl z-50 animate-scale-in overflow-hidden">
          <div className="p-3">
            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-3 last:mb-0">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {groupName}
                </h4>
                {groupItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLinkClick(item.to)}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-foreground rounded-lg transition-all duration-200 hover:text-primary hover:bg-secondary/70"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
DropdownMenu.displayName = 'DropdownMenu';

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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if can go back
  useEffect(() => {
    setCanGoBack(window.history.length > 2 && location.key !== 'default');
  }, [location]);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setRecordsOpen(false);
    setPlayersMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleBack = () => navigate(-1);
  const closeMenu = () => setIsMenuOpen(false);

  // Player menu handlers
  const handlePlayerMenuEnter = () => {
    if (playerMenuTimeoutRef.current) clearTimeout(playerMenuTimeoutRef.current);
    setPlayersMenuOpen(true);
  };

  const handlePlayerMenuLeave = () => {
    playerMenuTimeoutRef.current = setTimeout(() => setPlayersMenuOpen(false), 150);
  };

  // Menu items
  const recordsItems = [
    { label: 'Most Runs', to: '/stats/most-runs/odi', group: 'Batting' },
    { label: 'Highest Scores', to: '/stats/highest-scores/odi', group: 'Batting' },
    { label: 'Most 100s', to: '/stats/most-100s/odi', group: 'Batting' },
    { label: 'Most 50s', to: '/stats/most-50s/odi', group: 'Batting' },
    { label: 'Most Wickets', to: '/stats/most-wickets/odi', group: 'Bowling' },
    { label: 'Most 5-Wickets', to: '/stats/most-5-wickets/odi', group: 'Bowling' },
  ];

  return (
    <>
      <nav className={`navbar-base animate-navbar ${isScrolled ? 'navbar-scrolled' : 'border-b border-border/30'}`}>
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
            
            {/* Left: Back Button + Logo */}
            <div className="flex items-center gap-3">
              {canGoBack && (
                <button
                  onClick={handleBack}
                  className="btn-ghost flex items-center gap-2"
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className={`bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow-sm transition-all duration-300 ${isScrolled ? 'w-9 h-9' : 'w-10 h-10'}`}>
                    <img 
                                src="/twmini.png" 
                                alt="Track Wicket Logo" 
                                className="w-full h-full object-cover object-center rounded-full" 
                            />
                </div>
                <span className={`font-display font-bold gradient-text transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
                  Track Wicket
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavLinkItem to="/live" icon={Activity} isActive={isActive('/live') || isActive('/')} isScrolled={isScrolled}>
                Live
              </NavLinkItem>
              <NavLinkItem to="/recent" icon={Clock} isActive={isActive('/recent')} isScrolled={isScrolled}>
                Recent
              </NavLinkItem>
              <DropdownMenu 
                title="Records" 
                icon={ListOrdered}
                items={recordsItems} 
                isOpen={recordsOpen} 
                setIsOpen={setRecordsOpen}
                isScrolled={isScrolled}
              />
              
              {/* Players with Mega Menu */}
              <div 
                className="relative"
                onMouseEnter={handlePlayerMenuEnter}
                onMouseLeave={handlePlayerMenuLeave}
              >
                <Link
                  to="/players"
                  className={`nav-link ${isActive('/players') ? 'nav-link-active' : ''} ${isScrolled ? 'py-2' : 'py-2.5'}`}
                >
                  <User size={16} />
                  <span className="hidden lg:inline">Players</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${playersMenuOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                <PlayerMegaMenu 
                  isOpen={playersMenuOpen}
                  onClose={() => setPlayersMenuOpen(false)}
                  navigate={navigate}
                />
              </div>

              <NavLinkItem to="/notifications" icon={Bell} isActive={isActive('/notifications')} isScrolled={isScrolled}>
                Alerts
              </NavLinkItem>
            </div>

            {/* Right: Search + Theme + Mobile Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>
              
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-foreground hover:bg-secondary/50 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay animate-fade-in" onClick={closeMenu} />
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu animate-slide-in-right">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display font-bold text-lg gradient-text">Menu</span>
              <button
                onClick={closeMenu}
                className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <SearchInput isMobile searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <MobileLink to="/live" icon={Activity} isActive={isActive('/live') || isActive('/')} onClick={closeMenu}>
                Live Matches
              </MobileLink>
              <MobileLink to="/recent" icon={Clock} isActive={isActive('/recent')} onClick={closeMenu}>
                Recent Matches
              </MobileLink>
              <MobileLink to="/players" icon={User} isActive={isActive('/players')} onClick={closeMenu}>
                Players
              </MobileLink>
              <MobileLink to="/notifications" icon={Bell} isActive={isActive('/notifications')} onClick={closeMenu}>
                Notifications
              </MobileLink>

              {/* Records Section */}
              <div className="pt-4 mt-4 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-4">
                  Records
                </h4>
                {recordsItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={closeMenu}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary/30"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} Track Wicket
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default memo(Navbar);