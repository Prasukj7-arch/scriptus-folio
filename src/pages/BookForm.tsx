import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  published_year: z.number().min(1000).max(new Date().getFullYear() + 1),
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
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data.added_by !== user?.id) {
        toast.error('You can only edit your own books');
        navigate('/');
        return;
      }

      setValue('title', data.title);
      setValue('author', data.author);
      setValue('description', data.description);
      setValue('genre', data.genre);
      setValue('published_year', data.published_year);
    } catch (error: any) {
      toast.error('Failed to load book');
      navigate('/');
    }
  };

  const onSubmit = async (data: BookFormData) => {
    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('books')
          .update(data)
          .eq('id', id);
        if (error) throw error;
        toast.success('Book updated successfully!');
      } else {
        const { error } = await supabase
          .from('books')
          .insert({ ...data, added_by: user!.id });
        if (error) throw error;
        toast.success('Book added successfully!');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(isEdit ? 'Failed to update book' : 'Failed to add book');
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
                <Input id="genre" placeholder="e.g., Fiction, Mystery, Science Fiction" {...register('genre')} />
                {errors.genre && <p className="text-sm text-destructive">{errors.genre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_year">Published Year *</Label>
                <Input
                  id="published_year"
                  type="number"
                  {...register('published_year', { valueAsNumber: true })}
                />
                {errors.published_year && <p className="text-sm text-destructive">{errors.published_year.message}</p>}
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
