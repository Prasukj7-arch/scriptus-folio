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
}: BookCardProps) {
  return (
    <Link to={`/books/${id}`}>
      <Card className="h-full hover:shadow-elegant transition-smooth cursor-pointer group">
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
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
