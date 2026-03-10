import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully");
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="AfriHustle Logo" className="h-8 w-auto" />
            <span className="text-primary">AfriHustle</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/hustles" className="text-foreground/80 hover:text-primary transition-colors">
              Find Hustles
            </Link>
            {user && (
              <Link to="/messages" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
            )}
            <Link to="/how-it-works" className="text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </Link>
            {user ? (
              <>
                {userRole === "student" && (
                  <Link to="/resume">
                    <Button variant="outline" size="sm">
                      Resume
                    </Button>
                  </Link>
                )}
                <Link to={userRole === "company" ? "/company-dashboard" : "/dashboard"}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link 
                to="/hustles" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Hustles
              </Link>
              {user && (
                <Link 
                  to="/messages" 
                  className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
              )}
              <Link 
                to="/how-it-works" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    {userRole === "student" && (
                      <Link to="/resume" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Resume
                        </Button>
                      </Link>
                    )}
                    <Link to={userRole === "company" ? "/company-dashboard" : "/dashboard"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;