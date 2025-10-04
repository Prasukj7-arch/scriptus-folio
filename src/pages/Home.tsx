import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Plus } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-primary mb-8 shadow-xl">
              <BookOpen className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold font-serif mb-6" style={{
              background: 'linear-gradient(135deg, hsl(0 50% 35%), hsl(0 50% 45%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome to BookReview Platform
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Sign in to discover, review, and share your favorite books with the community
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-xl px-16 py-8 gradient-primary hover-lift shadow-2xl font-semibold">
                <User className="mr-4 h-6 w-6" />
                Sign In / Sign Up
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-primary mb-8 shadow-xl">
            <BookOpen className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif mb-8" style={{
            background: 'linear-gradient(135deg, hsl(0 50% 35%), hsl(0 50% 45%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Book Review Platform
          </h1>
          <p className="text-2xl sm:text-3xl text-muted-foreground mb-12 px-4 max-w-5xl mx-auto leading-relaxed">
            Discover amazing books, share your reviews, and connect with fellow book lovers
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/all-books">
              <Button size="lg" className="text-xl px-16 py-8 gradient-primary shadow-2xl font-semibold">
                <BookOpen className="mr-4 h-6 w-6" />
                Browse All Books
              </Button>
            </Link>
            <Link to="/my-books">
              <Button size="lg" variant="outline" className="text-xl px-16 py-8 border-primary/30 hover:border-primary/50 hover:bg-primary/5 font-semibold text-foreground hover:text-foreground dark:text-foreground dark:hover:text-foreground">
                <User className="mr-4 h-6 w-6" />
                My Books
              </Button>
            </Link>
            <Link to="/books/new">
              <Button size="lg" className="text-xl px-16 py-8 gradient-primary shadow-2xl font-semibold">
                <Plus className="mr-4 h-6 w-6" />
                Add New Book
              </Button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}