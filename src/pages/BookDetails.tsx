import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, User, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    if (id) {
      fetchBookDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error: any) {
      toast.error('Failed to load book details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(name)')
        .eq('book_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please sign in to add a review');
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
      const { error } = await supabase.from('reviews').insert({
        book_id: id,
        user_id: user.id,
        rating: newRating,
        review_text: newReview.trim(),
      });

      if (error) throw error;

      toast.success('Review added successfully!');
      setNewRating(0);
      setNewReview('');
      fetchReviews();
    } catch (error: any) {
      if (error.message.includes('duplicate')) {
        toast.error('You have already reviewed this book');
      } else {
        toast.error('Failed to add review');
      }
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
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          review_text: editText.trim(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review updated successfully!');
      setEditingReview(null);
      fetchReviews();
    } catch (error: any) {
      toast.error('Failed to update review');
      console.error(error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

      if (error) throw error;

      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (error: any) {
      toast.error('Failed to delete review');
      console.error(error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;

      toast.success('Book deleted successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to delete book');
      console.error(error);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = reviews.find(r => r.user_id === user?.id);

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-bold font-serif">{book.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{book.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{book.published_year}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
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
                  <p>Added by <span className="font-medium">{book.profiles?.name}</span></p>
                </div>

                {user?.id === book.added_by && (
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/books/${book.id}/edit`}>
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

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Reviews
              </h2>

              {user && !userReview && (
                <Card className="mb-6 shadow-card">
                  <CardHeader>
                    <h3 className="font-semibold">Write a Review</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {newReview.length}/1000 characters
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
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="shadow-card">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No reviews yet. Be the first to review this book!</p>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.profiles?.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            {editingReview === review.id ? (
                              <StarRating
                                rating={editRating}
                                onRatingChange={setEditRating}
                                size="sm"
                              />
                            ) : (
                              <StarRating rating={review.rating} readonly size="sm" />
                            )}
                          </div>
                          {user?.id === review.user_id && (
                            <div className="flex gap-2">
                              {editingReview === review.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateReview(review.id)}
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
                                      setEditingReview(review.id);
                                      setEditRating(review.rating);
                                      setEditText(review.review_text);
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
                                          onClick={() => handleDeleteReview(review.id)}
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
                            {review.review_text}
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
