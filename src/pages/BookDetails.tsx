import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { booksAPI, reviewsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, User, Calendar, MessageSquare, BarChart3, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('🔍 BookDetails useEffect - id:', id, 'user:', user);
    if (id) {
      fetchBookDetails();
    }
  }, [id, user]);

  const fetchBookDetails = async () => {
    try {
      console.log('🔍 Fetching book details for ID:', id);
      const response = await booksAPI.getBook(id!);
      console.log('📚 Book API response:', response.data);
      
      if (response.data.success) {
        const bookData = response.data.data;
        setBook(bookData);
        // Always fetch reviews separately to ensure we get the latest data
        fetchReviews();
      } else {
        throw new Error(response.data.message || 'Failed to fetch book');
      }
    } catch (error: any) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
      setBook(null); // Explicitly set book to null on error
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      console.log('🔍 Fetching reviews for book:', id);
      const response = await reviewsAPI.getBookReviews(id!);
      console.log('📝 Reviews API response:', response.data);
      if (response.data.success) {
        console.log('✅ Reviews fetched:', response.data.data.length, 'reviews');
        console.log('📋 Reviews data:', JSON.stringify(response.data.data, null, 2));
        setReviews(response.data.data);
      } else {
        console.error('Failed to fetch reviews:', response.data.message);
        setReviews([]); // Set empty array on failure
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setReviews([]); // Set empty array on error
    }
  };


  const handleSubmitReview = async () => {
    console.log('🔍 Submit review clicked', { user: user?.id, book: book?.addedBy?._id, rating: newRating, review: newReview });
    
    if (!user) {
      toast.error('Please sign in to add a review');
      return;
    }

    // Check if user is trying to review their own book
    if (user.id === book?.addedBy?._id) {
      toast.error('You cannot review your own book');
      return;
    }

    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (newReview.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      console.log('🔍 Frontend calling createReview with:', { bookId: id!, rating: newRating, reviewText: newReview.trim() });
      const response = await reviewsAPI.createReview({
        bookId: id!,
        rating: newRating,
        reviewText: newReview.trim(),
      });
      console.log('📝 Frontend received response:', response.data);
      console.log('📝 Response data details:', {
        success: response.data.success,
        message: response.data.message,
        reviewId: response.data.data?._id,
        reviewText: response.data.data?.reviewText,
        rating: response.data.data?.rating
      });
      console.log('📝 Full response object:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        toast.success('Review added successfully!');
        setNewRating(0);
        setNewReview('');
        fetchReviews(); // Refresh reviews
      } else {
        throw new Error(response.data.message || 'Failed to add review');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to add review';
        toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await reviewsAPI.deleteReview(reviewId);

      if (response.data.success) {
        toast.success('Review deleted successfully!');
        fetchReviews(); // Refresh reviews
      } else {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete review';
      toast.error(message);
      console.error(error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const response = await booksAPI.deleteBook(id!);

      if (response.data.success) {
        toast.success('Book deleted successfully!');
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Failed to delete book');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete book';
      toast.error(message);
      console.error(error);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = reviews.find(r => r.userId === user?.id);

  // Calculate rating distribution for charts
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating}★`,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0
  }));

  const pieChartData = ratingDistribution
    .filter(item => item.count > 0) // Only show segments with data
    .map(item => ({
      name: item.rating,
      value: item.count,
      percentage: item.percentage,
      color: item.rating === '5★' ? '#10b981' : 
             item.rating === '4★' ? '#34d399' :
             item.rating === '3★' ? '#fbbf24' :
             item.rating === '2★' ? '#f59e0b' : '#ef4444'
    }));

  const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#34d399', '#10b981'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground">Book not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => {
            const source = searchParams.get('source');
            if (source === 'my-books') {
              navigate('/my-books');
            } else if (source === 'profile') {
              navigate('/profile');
            } else {
              navigate('/all-books');
            }
          }} 
          className="mb-6 bg-card/50 hover:bg-card/70 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50 hover:border-border transition-all duration-200 text-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>

        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            <Card className="shadow-card card-modern dark:card-modern-dark border-0">
              <CardHeader className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif">{book.title}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm sm:text-base">{book.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm sm:text-base">{book.publishedYear}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base sm:text-lg px-3 sm:px-4 py-2 w-fit">
                    {book.genre}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <StarRating rating={Math.round(averageRating)} readonly size="lg" />
                  <div>
                    <p className="text-2xl font-bold">
                      {averageRating > 0 ? `${averageRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})` : 'No ratings'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Added by <span className="font-medium">{book.addedBy?.name}</span></p>
                </div>

                {user?.id === book.addedBy?._id && (
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/books/${book._id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Book
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Book
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this book and all its reviews.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteBook}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Charts Section */}
            {reviews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Rating Distribution
                </h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="shadow-card card-modern dark:card-modern-dark border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={ratingDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="rating" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-card card-modern dark:card-modern-dark border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} ${value === 1 ? 'review' : 'reviews'}`, 
                              name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Write a Review Section */}
            {(() => {
              const userId = user?.id;
              const bookOwnerId = book?.addedBy?._id || book?.addedBy;
              const shouldShow = user && userId !== bookOwnerId;
              console.log('🔍 Review section check:', {
                userId,
                bookOwnerId,
                shouldShow,
                userType: typeof userId,
                bookOwnerType: typeof bookOwnerId
              });
              return shouldShow;
            })() && (
            <div>
              <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                  Write a Review
              </h2>

                <div>
                <Card className="mb-8 shadow-card card-modern dark:card-modern-dark border-0">
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Rating</label>
                      <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review</label>
                      <Textarea
                        placeholder="Share your thoughts about this book..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {newReview.length}/500 characters
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submitting || newRating === 0 || newReview.trim().length < 10}
                      className="gradient-primary hover:opacity-90"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}

            {/* All Reviews Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                All Reviews
              </h3>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="shadow-card card-modern dark:card-modern-dark border-0">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>
                        {user?.id === book?.addedBy?._id 
                          ? "No review added" 
                          : "No reviews yet. Be the first to review this book!"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review._id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.userId?.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                              <StarRating rating={review.rating} readonly size="sm" />
                          </div>
                          {user?.id === review.userId?._id && (
                            <div className="flex gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                      onClick={() => handleDeleteReview(review._id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {review.reviewText}
                          </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
