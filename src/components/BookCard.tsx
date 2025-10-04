import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { BookOpen, User, Calendar, Edit, Trash2 } from 'lucide-react';

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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  onEdit,
  onDelete,
}: BookCardProps) {
  const isOwner = addedBy && currentUserId && addedBy._id === currentUserId;
  return (
    <Link to={`/books/${id}`}>
      <Card className="h-full hover:shadow-elegant transition-smooth cursor-pointer group relative">
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
              Added by {addedBy.name}
            </div>
          )}
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
        
        {isOwner && (onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
