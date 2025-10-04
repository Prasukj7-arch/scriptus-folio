import { useState, useEffect } from 'react';
import { booksAPI } from '@/services/api';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { Search, ChevronLeft, ChevronRight, Plus, BookOpen, User } from 'lucide-react';
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

  useEffect(() => {
    if (user) {
      fetchGenres();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user, currentPage, searchQuery, genreFilter, activeTab]);

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
            <h1 className="text-4xl font-bold font-serif mb-4">Welcome to Your Personal Book Library</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to manage your personal collection of books and reviews
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold font-serif mb-4 gradient-primary bg-clip-text text-transparent">
            Book Review Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover books, add your own, and share reviews with the community
          </p>
          <Link to="/books/new">
            <Button size="lg" className="text-lg px-8 py-3">
              <Plus className="mr-2 h-5 w-5" />
              Add New Book
            </Button>
          </Link>
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
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">Your library is empty</p>
                <p className="text-muted-foreground mb-6">Start building your personal book collection by adding your first book!</p>
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
