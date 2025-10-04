import { useState, useEffect } from 'react';
import { booksAPI } from '@/services/api';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { Search, ChevronLeft, ChevronRight, Plus, BookOpen, User, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 5; // Changed to 5 as per requirements

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    if (user) {
      fetchGenres();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user, currentPage, searchQuery, genreFilter, activeTab, sortBy]);

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

      console.log('🔍 Fetching books with params:', params);
      const response = activeTab === 'all' 
        ? await booksAPI.getBooks(params)
        : await booksAPI.getMyBooks(params);
      console.log('📚 Books API response:', response.data);
      
      if (response.data.success) {
        setBooks(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        console.log('✅ Books set successfully:', response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch books');
      }
    } catch (error: any) {
      toast.error('Failed to load books');
      console.error('❌ Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = (bookId: string) => {
    window.location.href = `/books/${bookId}/edit`;
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.deleteBook(bookId);
        toast.success('Book deleted successfully');
        fetchBooks(); // Refresh the list
      } catch (error: any) {
        toast.error('Failed to delete book');
        console.error('Error deleting book:', error);
      }
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold font-serif mb-4">Welcome to BookReview Platform</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to discover, review, and share your favorite books with the community
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-3">
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
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-serif mb-6 gradient-text-animated">
            Book Review Platform
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 px-4 max-w-3xl mx-auto leading-relaxed">
            Discover amazing books, share your reviews, and connect with fellow book lovers in our vibrant community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/books/new">
              <Button size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-4 hover-lift gradient-primary shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Add New Book
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-4 hover-lift glass">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Books
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'all' | 'my');
          setCurrentPage(1);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Books
            </TabsTrigger>
            <TabsTrigger value="my" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="mb-6 sm:mb-8 flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  value={genreFilter}
                  onValueChange={(value) => {
                    setGenreFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by genre" />
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
                  <SelectTrigger className="w-full">
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

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No books found</p>
                <p className="text-muted-foreground mb-6">Be the first to add a book to the platform!</p>
                <Link to="/books/new">
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Add First Book
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-6">
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your books..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={genreFilter}
                onValueChange={(value) => {
                  setGenreFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by genre" />
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
                <SelectTrigger className="w-full sm:w-[200px]">
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

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No books in your collection yet</p>
            <p className="text-muted-foreground mb-6">Start building your book collection by adding your first book!</p>
                <Link to="/books/new">
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Book
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
