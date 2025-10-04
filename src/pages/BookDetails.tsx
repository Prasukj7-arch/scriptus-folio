import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { ArrowLeft, Edit, Trash2, User, Calendar, MessageSquare, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 BookDetails useEffect - id:', id, 'user:', user);
    if (id) {
      fetchBookDetails();
      if (user) {
        checkCanReview();
      }
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
        // Set reviews from the book data if available
        if (bookData.reviews) {
          setReviews(bookData.reviews);
        } else {
          // If no reviews in book data, fetch them separately
          fetchReviews();
        }
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
      const response = await reviewsAPI.getBookReviews(id!);
      if (response.data.success) {
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

  const checkCanReview = async () => {
    try {
      console.log('🔍 Checking review eligibility for book:', id, 'user:', user?.id);
      const response = await reviewsAPI.canReview(id!);
      console.log('📝 Can review response:', response.data);
      if (response.data.success) {
        setCanReview(response.data.data.canReview);
        setReviewReason(response.data.data.reason || '');
        setExistingReviewId(response.data.data.existingReviewId || null);
      }
    } catch (error: any) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
      setReviewReason('Unable to check review eligibility');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please sign in to add a review');
      return;
    }

    if (!canReview) {
      toast.error(reviewReason);
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
      const response = await reviewsAPI.createReview({
        bookId: id!,
        rating: newRating,
        reviewText: newReview.trim(),
      });

      if (response.data.success) {
        toast.success('Review added successfully!');
        setNewRating(0);
        setNewReview('');
        fetchReviews(); // Refresh reviews
        checkCanReview(); // Update review eligibility
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

  const handleUpdateReview = async (reviewId: string) => {
    if (editRating === 0 || editText.trim().length < 10) {
      toast.error('Please provide a valid rating and review (at least 10 characters)');
      return;
    }

    try {
      const response = await reviewsAPI.updateReview(reviewId, {
        rating: editRating,
        reviewText: editText.trim(),
      });

      if (response.data.success) {
        toast.success('Review updated successfully!');
        setEditingReview(null);
        fetchReviews(); // Refresh reviews
      } else {
        throw new Error(response.data.message || 'Failed to update review');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update review';
      toast.error(message);
      console.error(error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await reviewsAPI.deleteReview(reviewId);

      if (response.data.success) {
        toast.success('Review deleted successfully!');
        fetchReviews(); // Refresh reviews
        checkCanReview(); // Update review eligibility
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
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0
  }));

  const pieChartData = ratingDistribution.map(item => ({
    name: item.rating,
    value: item.count,
    color: item.rating === '5 Stars' ? '#10b981' : 
           item.rating === '4 Stars' ? '#34d399' :
           item.rating === '3 Stars' ? '#fbbf24' :
           item.rating === '2 Stars' ? '#f59e0b' : '#ef4444'
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
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card hover-lift card-modern dark:card-modern-dark border-0">
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
                      {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
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
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-card hover-lift card-modern dark:card-modern-dark border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-card hover-lift card-modern dark:card-modern-dark border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Reviews
              </h2>

              {user && (
                <Card className="mb-6 shadow-card">
                  <CardHeader>
                    <h3 className="font-semibold">
                      {canReview ? 'Write a Review' : 'Review Status'}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {canReview ? (
                      <>
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
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-2">{reviewReason}</p>
                        {reviewReason.includes('already reviewed') && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              const userReview = reviews.find(r => r.userId._id === user.id);
                              if (userReview) {
                                setEditingReview(userReview._id);
                                setEditRating(userReview.rating);
                                setEditText(userReview.reviewText);
                              }
                            }}
                          >
                            Edit Your Review
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="shadow-card hover-lift card-modern dark:card-modern-dark border-0">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No reviews yet. Be the first to review this book!</p>
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
                            {editingReview === review._id ? (
                              <StarRating
                                rating={editRating}
                                onRatingChange={setEditRating}
                                size="sm"
                              />
                            ) : (
                              <StarRating rating={review.rating} readonly size="sm" />
                            )}
                          </div>
                          {user?.id === review.userId?._id && (
                            <div className="flex gap-2">
                              {editingReview === review._id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateReview(review._id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingReview(null)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingReview(review._id);
                                      setEditRating(review.rating);
                                      setEditText(review.reviewText);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingReview === review.id ? (
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            maxLength={1000}
                          />
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">
                            {review.reviewText}
                          </p>
                        )}
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
