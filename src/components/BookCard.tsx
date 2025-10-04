import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { BookOpen, User, Calendar } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  description: string;
  averageRating?: number;
  reviewCount?: number;
  addedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  currentUserId?: string;
  source?: string;
}

export function BookCard({
  id,
  title,
  author,
  genre,
  publishedYear,
  description,
  averageRating = 0,
  reviewCount = 0,
  addedBy,
  currentUserId,
  source,
}: BookCardProps) {
  return (
    <Link to={`/books/${id}${source ? `?source=${source}` : ''}`}>
      <Card className="h-full hover:shadow-elegant transition-smooth cursor-pointer group relative hover-lift card-modern dark:card-modern-dark border border-border/40">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold font-serif line-clamp-2 group-hover:text-primary transition-smooth">
                {title}
              </h3>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {genre}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="line-clamp-1">{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{publishedYear}</span>
            </div>
          </div>
          {addedBy && (
            <div className="text-xs text-muted-foreground">
              Added by {addedBy.name} ({addedBy.email})
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">{description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
            <span className="text-sm text-muted-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
