import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <h1 className="text-[150px] md:text-[200px] font-display font-bold text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                404
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="btn-futuristic flex items-center gap-2"
            >
              <Home size={18} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 rounded-lg font-semibold border border-border text-foreground hover:bg-secondary/50 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
