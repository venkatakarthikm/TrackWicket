import Navbar from "./Navbar";

const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* === LOGO SECTION === */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/twmini.png"
                  alt="Track Wicket Logo"
                  className="w-full h-full object-cover object-center rounded-full"
                />
              </div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Track Wicket
              </h3>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              Your ultimate destination for real-time cricket scores and
              comprehensive match updates.
            </p>
          </div>

          {/* === QUICK LINKS === */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a
                href="/live"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Live Matches
              </a>
              <a
                href="/recent"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Recent Results
              </a>
              <a
                href="/upcoming"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Upcoming Matches
              </a>
            </nav>
          </div>

          {/* === ABOUT SECTION === */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
              About
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Real-time cricket scores</p>
              <p>Comprehensive match details</p>
              <p>All major tournaments</p>
            </div>
          </div>
        </div>

        {/* === COPYRIGHT & LINKS === */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Track Wicket. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="/privacy"
                className="hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-primary transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
