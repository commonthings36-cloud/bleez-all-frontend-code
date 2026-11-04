import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Menu, X, Plane, User, LogOut, Map, Briefcase, Folder, Users, Play, Download, Ticket, Sun, Moon, DollarSign, Crown, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import CurrencySelector from './CurrencySelector';
import AlertsPanel from './AlertsPanel';
import TutorialButton from './TutorialButton';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b transition-colors",
      isLight 
        ? "bg-white/95 backdrop-blur-xl border-gray-200 shadow-sm" 
        : "glass border-white/5"
    )} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="container-main">
        <div className="flex items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0" data-testid="logo-link">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Plane className={cn("w-5 h-5", isLight ? "text-white" : "text-background")} />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              <span className={isLight ? "text-gray-900" : ""}>Bleez</span><span className="gold-text">.AI</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center gap-8">
              <Link 
                to="/plan" 
                className={cn(
                  "text-sm font-medium transition-colors whitespace-nowrap",
                  isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-plan"
              >
                Plan Trip
              </Link>
              <Link 
                to="/explore" 
                className={cn(
                  "text-sm font-medium transition-colors whitespace-nowrap",
                  isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-explore"
              >
                Explore
              </Link>
              <Link 
                to="/booking" 
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                  isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-booking"
              >
                <Ticket className="w-4 h-4" />
                Book Travel
              </Link>
              <Link 
                to="/community" 
                className={cn(
                  "text-sm font-medium transition-colors whitespace-nowrap",
                  isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-community"
              >
                Community
              </Link>
              {user && (
                <>
                  <Link 
                    to="/my-trips" 
                    className={cn(
                      "text-sm font-medium transition-colors whitespace-nowrap",
                      isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                    )}
                    data-testid="nav-my-trips"
                  >
                    My Trips
                  </Link>
                  <Link 
                    to="/albums" 
                    className={cn(
                      "text-sm font-medium transition-colors whitespace-nowrap",
                      isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                    )}
                    data-testid="nav-albums"
                  >
                    Albums
                  </Link>
                  <Link 
                    to="/expenses" 
                    className={cn(
                      "text-sm font-medium transition-colors whitespace-nowrap",
                      isLight ? "text-gray-600 hover:text-gray-900" : "text-muted-foreground hover:text-foreground"
                    )}
                    data-testid="nav-expenses"
                  >
                    Expenses
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Auth Buttons - Right aligned */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Currency Selector - Compact */}
                <CurrencySelector compact={true} showLabel={false} />
                
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={cn("w-9 h-9", isLight && "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}
                  title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
                  data-testid="theme-toggle"
                >
                  {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                
                {/* Tutorial Button */}
                <TutorialButton />
                
                {/* Alerts Panel */}
                <AlertsPanel />
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" data-testid="user-menu-trigger">
                      <Avatar className="w-8 h-8">
                        {user.picture ? (
                          <AvatarImage src={user.picture} />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass border-white/10">
                    <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-trips')} data-testid="menu-trips">
                      <Map className="w-4 h-4 mr-2" />
                      My Trips
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/albums')} data-testid="menu-albums">
                      <Folder className="w-4 h-4 mr-2" />
                      Albums
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/expenses')} data-testid="menu-expenses">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Expenses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-subscription')} data-testid="menu-subscription">
                      <Crown className="w-4 h-4 mr-2 text-amber-400" />
                      Subscription
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/download')} data-testid="menu-download">
                      <Download className="w-4 h-4 mr-2" />
                      Get App
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-authenticated users */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={cn("w-9 h-9", isLight && "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}
                  title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
                  data-testid="theme-toggle"
                >
                  {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                <Link to="/download">
                  <Button 
                    variant="ghost" 
                    className={cn("btn-ghost gap-2", isLight && "text-gray-600 hover:text-gray-900 hover:bg-gray-100")} 
                    data-testid="nav-download"
                  >
                    <Download className="w-4 h-4" />
                    Get App
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className={cn("btn-ghost", isLight && "text-gray-600 hover:text-gray-900 hover:bg-gray-100")} 
                    data-testid="nav-login"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-primary" data-testid="nav-register">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors",
                isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
              )}
              title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            >
              {isLight ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
            
            {/* Mobile Get App Icon */}
            <Link 
              to="/download" 
              className={cn(
                "p-2 rounded-full transition-colors",
                isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
              )}
              data-testid="mobile-download-icon"
              aria-label="Get App"
            >
              <Download className="w-5 h-5 text-primary" />
            </Link>
            
            <button 
              className={cn("p-2", isLight && "text-gray-700")} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>
    </nav>
    
    {/* Mobile Menu - Rendered outside nav for full-screen overlay */}
    {mobileMenuOpen && (
      <div 
        className="md:hidden fixed inset-0 overflow-y-auto"
        style={{ 
          zIndex: 9999,
          backgroundColor: isLight ? '#ffffff' : '#050810',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 80px)',
          WebkitOverflowScrolling: 'touch'
        }}
        data-testid="mobile-menu-overlay"
      >
        <div className="flex flex-col gap-2 p-4 min-h-full">
          {/* Primary CTAs at top */}
          <Link 
            to="/booking" 
            className="px-4 py-4 bg-primary/20 hover:bg-primary/30 rounded-xl flex items-center gap-3 border border-primary/30"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-booking"
          >
            <Ticket className="w-6 h-6 text-primary" />
            <span className="font-semibold text-primary text-lg">Book Travel</span>
          </Link>
          
          {/* Quick Actions */}
          <Link 
            to="/plan" 
            className={cn(
              "px-4 py-4 rounded-xl flex items-center gap-3",
              isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
            )}
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-plan"
          >
            <Plane className="w-5 h-5 text-primary" />
            <span className="text-base font-medium">Plan Trip</span>
          </Link>
          <Link 
            to="/explore" 
            className={cn(
              "px-4 py-4 rounded-xl flex items-center gap-3",
              isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
            )}
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-explore"
          >
            <Map className="w-5 h-5 text-primary" />
            <span className="text-base font-medium">Explore</span>
          </Link>
          <Link 
            to="/wishlist" 
            className={cn(
              "px-4 py-4 rounded-xl flex items-center gap-3",
              isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
            )}
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-wishlist"
          >
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-base font-medium">Wishlist</span>
          </Link>
          <Link 
            to="/community" 
            className={cn(
              "px-4 py-4 rounded-xl flex items-center gap-3",
              isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
            )}
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-community"
          >
            <Users className="w-5 h-5 text-primary" />
            <span className="text-base font-medium">Community</span>
          </Link>
          
          {user ? (
            <>
              {/* Divider */}
              <div className={cn("my-3 border-t", isLight ? "border-gray-200" : "border-white/10")} />
              
              {/* User Menu Items */}
              <Link 
                to="/profile" 
                className={cn(
                  "px-4 py-4 rounded-xl flex items-center gap-3",
                  isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-menu-profile"
              >
                <User className={cn("w-5 h-5", isLight ? "text-gray-500" : "text-muted-foreground")} />
                <span className="text-base font-medium">Profile</span>
              </Link>
              <Link 
                to="/my-trips" 
                className={cn(
                  "px-4 py-4 rounded-xl flex items-center gap-3",
                  isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-menu-trips"
              >
                <Map className={cn("w-5 h-5", isLight ? "text-gray-500" : "text-muted-foreground")} />
                <span className="text-base font-medium">My Trips</span>
              </Link>
              <Link 
                to="/albums" 
                className={cn(
                  "px-4 py-4 rounded-xl flex items-center gap-3",
                  isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-menu-albums"
              >
                <Folder className={cn("w-5 h-5", isLight ? "text-gray-500" : "text-muted-foreground")} />
                <span className="text-base font-medium">Albums</span>
              </Link>
              <Link 
                to="/expenses" 
                className={cn(
                  "px-4 py-4 rounded-xl flex items-center gap-3",
                  isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-menu-expenses"
              >
                <DollarSign className={cn("w-5 h-5", isLight ? "text-gray-500" : "text-muted-foreground")} />
                <span className="text-base font-medium">Expenses</span>
              </Link>
              <Link 
                to="/download" 
                className={cn(
                  "px-4 py-4 rounded-xl flex items-center gap-3",
                  isLight ? "hover:bg-gray-100 text-gray-800" : "hover:bg-white/5 text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-menu-download"
              >
                <Download className={cn("w-5 h-5", isLight ? "text-gray-500" : "text-muted-foreground")} />
                <span className="text-base font-medium">Get App</span>
              </Link>
              
              {/* Divider */}
              <div className={cn("my-3 border-t", isLight ? "border-gray-200" : "border-white/10")} />
              
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className={cn(
                  "px-4 py-4 text-left rounded-xl text-red-500 flex items-center gap-3",
                  isLight ? "hover:bg-red-50" : "hover:bg-red-500/10"
                )}
                data-testid="mobile-menu-logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-6 space-y-3 mt-auto">
              <Link to="/download" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className={cn("w-full h-12 gap-2 text-base", isLight && "border-gray-300 text-gray-700")}>
                  <Download className="w-5 h-5" />
                  Get App
                </Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className={cn("w-full h-12 text-base", isLight && "border-gray-300 text-gray-700")}>Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-12 btn-primary text-base">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

const FOOTER_COLUMNS = [
  { title: 'Travel', links: [['/plan', 'Plan a trip'], ['/explore', 'Explore'], ['/booking', 'Book travel'], ['/wishlist', 'Wishlist'], ['/community', 'Community']] },
  { title: 'Company', links: [['/about', 'About us'], ['/how-it-works', 'How it works'], ['/my-subscription', 'Plans & pricing'], ['/download', 'Get the app']] },
  { title: 'Support', links: [['/faq', 'FAQs'], ['/help', 'Help center'], ['/contact', 'Contact us'], ['/emergency', 'Emergency numbers']] },
  { title: 'Legal', links: [['/privacy', 'Privacy policy'], ['/terms', 'Terms & conditions']] },
];

export const Footer = () => {
  return (
    <footer className="mt-auto text-white bg-gradient-to-b from-[#2E1065] to-[#1a0a3d]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="container-main py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </span>
              <span className="text-xl font-bold tracking-tight">Bleez<span className="text-[#A78BFA]">.AI</span></span>
            </Link>
            <p className="text-white/70 text-sm max-w-xs leading-relaxed mb-5">
              Plan smarter and travel better. AI itineraries, flight and hotel search, and support on the road, in one place.
            </p>
            <Link to="/download" className="inline-flex items-center gap-2 rounded-full bg-white text-brand-700 px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors">
              <Download className="w-4 h-4" /> Get the app
            </Link>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-white/80 hover:text-white hover:underline underline-offset-4 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 justify-between text-sm text-white/55">
          <p>&copy; {new Date().getFullYear()} Bleez. All rights reserved.</p>
          <p>Bookings are completed with the airline, hotel or partner you choose.</p>
        </div>
      </div>
    </footer>
  );
};
