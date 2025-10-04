import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { booksAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  genre: z.string().min(1, 'Genre is required').max(50),
  publishedYear: z.number().min(1000).max(new Date().getFullYear() + 1),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isEdit) {
      fetchBook();
    }
  }, [user, isEdit]);

  const fetchBook = async () => {
    try {
      const response = await booksAPI.getBook(id!);
      
      if (response.data.success) {
        const book = response.data.data;
        if (book.addedBy._id !== user?.id) {
          toast.error('You can only edit your own books');
          navigate('/');
          return;
        }

        setValue('title', book.title);
        setValue('author', book.author);
        setValue('description', book.description);
        setValue('genre', book.genre);
        setValue('publishedYear', book.publishedYear);
      } else {
        throw new Error(response.data.message || 'Failed to fetch book');
      }
    } catch (error: any) {
      toast.error('Failed to load book');
      navigate('/');
    }
  };

  const onSubmit = async (data: BookFormData) => {
    setLoading(true);
    try {
      if (isEdit) {
        const response = await booksAPI.updateBook(id!, data);
        if (response.data.success) {
          toast.success('Book updated successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to update book');
        }
      } else {
        const response = await booksAPI.createBook(data);
        if (response.data.success) {
          toast.success('Book added successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to add book');
        }
      }
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || (isEdit ? 'Failed to update book' : 'Failed to add book');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <Navbar />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-elegant card-modern dark:card-modern-dark border-0">
            <CardHeader className="text-center pb-8">
              
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">Title *</Label>
                    <Input id="title" {...register('title')} className="h-12 text-base" />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author" className="text-base font-medium">Author *</Label>
                    <Input id="author" {...register('author')} className="h-12 text-base" />
                    {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="genre" className="text-base font-medium">Genre *</Label>
                    <Input 
                      id="genre" 
                      placeholder="e.g., Fiction, Mystery, Romance, Science Fiction" 
                      {...register('genre')} 
                      className="h-12 text-base"
                    />
                    {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishedYear" className="text-base font-medium">Published Year *</Label>
                    <Input
                      id="publishedYear"
                      type="number"
                      {...register('publishedYear', { valueAsNumber: true })}
                      className="h-12 text-base"
                    />
                    {errors.publishedYear && <p className="text-sm text-destructive">{errors.publishedYear.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    rows={8}
                    {...register('description')}
                    className="resize-none text-base"
                    placeholder="Write a compelling description of the book..."
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-primary hover:opacity-90 flex-1 h-14 text-lg"
                  >
                    {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="h-14 px-8 text-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
