import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { booksAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12; // Increased for dedicated page

export default function AllBooks() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchBooks();
      fetchGenres();
    }
  }, [user, currentPage, searchQuery, genreFilter, sortBy]);

  const fetchGenres = async () => {
    try {
      const response = await booksAPI.getGenres();
      if (response.data.success) {
        setGenres(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (genreFilter !== 'all') {
        params.genre = genreFilter;
      }

      if (sortBy !== 'newest') {
        params.sortBy = sortBy;
      }

      const response = await booksAPI.getBooks(params);
      
      if (response.data.success) {
        setBooks(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        throw new Error(response.data.message || 'Failed to fetch books');
      }
    } catch (error: any) {
      toast.error('Failed to load books');
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Redirect to auth if not logged in
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="gradient-primary p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif" style={{
                background: 'linear-gradient(135deg, hsl(0 50% 35%), hsl(0 50% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>All Books</h1>
              <p className="text-muted-foreground mt-2">Discover and explore books from our community</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 h-12 text-base bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:w-96">
              <Select
                value={genreFilter}
                onValueChange={(value) => {
                  setGenreFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="year-desc">Year (Newest)</SelectItem>
                  <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-6">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No books found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No books match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Link to="/books/new">
              <Button size="lg" className="gradient-primary hover-lift">
                <Plus className="mr-2 h-5 w-5" />
                Add New Book
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book._id || book.id}
                  id={book._id || book.id}
                  title={book.title}
                  author={book.author}
                  genre={book.genre}
                  publishedYear={book.publishedYear}
                  description={book.description}
                  averageRating={book.averageRating}
                  reviewCount={book.reviewCount}
                  addedBy={book.addedBy}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 hover-lift"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 hover-lift"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
