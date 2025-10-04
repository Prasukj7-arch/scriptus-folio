import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, LogIn, LogOut, User, Menu, X, Library, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-card/30 backdrop-blur-md sticky top-0 z-50 glass dark:glass-dark">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-lg transition-smooth group-hover:scale-105">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-serif" style={{
              background: 'linear-gradient(135deg, hsl(0 50% 35%), hsl(0 50% 45%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              <span className="hidden sm:inline">BookReview Platform</span>
              <span className="sm:hidden">BRP</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/all-books">
                  <Button variant="ghost" className="hover-lift">
                    <Library className="h-4 w-4 mr-2" />
                    All Books
                  </Button>
                </Link>
                <Link to="/my-books">
                  <Button variant="ghost" className="hover-lift">
                    <BookMarked className="h-4 w-4 mr-2" />
                    My Books
                  </Button>
                </Link>
                <Button
                  onClick={() => navigate('/books/new')}
                  className="gradient-primary hover:opacity-90 transition-smooth"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="gradient-primary hover:opacity-90 transition-smooth"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Button
                    onClick={() => {
                      navigate('/all-books');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Library className="h-4 w-4 mr-2" />
                    All Books
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/my-books');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    My Books
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/books/new');
                      setIsMobileMenuOpen(false);
                    }}
                    className="gradient-primary hover:opacity-90 transition-smooth w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="gradient-primary hover:opacity-90 transition-smooth w-full justify-start"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
