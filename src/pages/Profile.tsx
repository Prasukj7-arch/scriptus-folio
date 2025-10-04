import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { booksAPI, reviewsAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/StarRating';
import { User, BookOpen, Star, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ITEMS_PER_PAGE = 6;

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksPage, setBooksPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [booksTotalPages, setBooksTotalPages] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchMyBooks();
      fetchMyReviews();
    }
  }, [user, booksPage, reviewsPage]);

  const fetchMyBooks = async () => {
    try {
      const response = await booksAPI.getMyBooks({
        page: booksPage,
        limit: ITEMS_PER_PAGE
      });
      
      if (response.data.success) {
        setMyBooks(response.data.data);
        setBooksTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error('Failed to load your books');
      console.error('Error fetching my books:', error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await reviewsAPI.getUserReviews(user?.id || '');
      
      if (response.data.success) {
        const reviews = response.data.data;
        const startIndex = (reviewsPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedReviews = reviews.slice(startIndex, endIndex);
        
        setMyReviews(paginatedReviews);
        setReviewsTotalPages(Math.ceil(reviews.length / ITEMS_PER_PAGE));
      }
    } catch (error: any) {
      toast.error('Failed to load your reviews');
      console.error('Error fetching my reviews:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.deleteBook(bookId);
        toast.success('Book deleted successfully');
        fetchMyBooks();
      } catch (error: any) {
        toast.error('Failed to delete book');
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    window.location.href = `/books/${bookId}/edit`;
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.deleteReview(reviewId);
        toast.success('Review deleted successfully');
        fetchMyReviews();
      } catch (error: any) {
        toast.error('Failed to delete review');
        console.error('Error deleting review:', error);
      }
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold font-serif mb-4">Please Sign In</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You need to be signed in to view your profile
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-3">
                Sign In
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="gradient-primary p-4 rounded-full">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Books ({myBooks.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              My Reviews ({myReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            <h2 className="text-2xl font-bold font-serif">My Books</h2>

            {myBooks.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No books added yet</h3>
                  <p className="text-muted-foreground">
                    You haven't added any books to your collection yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      id={book._id}
                      title={book.title}
                      author={book.author}
                      genre={book.genre}
                      publishedYear={book.publishedYear}
                      description={book.description}
                      averageRating={book.averageRating}
                      reviewCount={book.reviewCount}
                      addedBy={book.addedBy}
                      currentUserId={user.id}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>

                {booksTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setBooksPage(p => Math.max(1, p - 1))}
                      disabled={booksPage === 1}
                    >
                      ←
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {booksPage} of {booksTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setBooksPage(p => Math.min(booksTotalPages, p + 1))}
                      disabled={booksPage === booksTotalPages}
                    >
                      →
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-bold font-serif">My Reviews</h2>

            {myReviews.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No reviews written yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Help other readers by sharing your thoughts on books you've read!
                  </p>
                  <Link to="/">
                    <Button size="lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Browse Books
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <Card key={review._id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/books/${review.bookId._id}`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {review.bookId.title}
                              </Link>
                              <Badge variant="secondary">
                                by {review.bookId.author}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} readonly size="sm" />
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.reviewText}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {reviewsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                      disabled={reviewsPage === 1}
                    >
                      ←
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {reviewsPage} of {reviewsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReviewsPage(p => Math.min(reviewsTotalPages, p + 1))}
                      disabled={reviewsPage === reviewsTotalPages}
                    >
                      →
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
