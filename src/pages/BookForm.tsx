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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">
              {isEdit ? 'Edit Book' : 'Add New Book'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input id="author" {...register('author')} />
                {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Input id="genre" placeholder="e.g., Fiction, Mystery, Romance, Science Fiction" {...register('genre')} />
                {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedYear">Published Year *</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  {...register('publishedYear', { valueAsNumber: true })}
                />
                {errors.publishedYear && <p className="text-sm text-destructive">{errors.publishedYear.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-primary hover:opacity-90 flex-1"
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
