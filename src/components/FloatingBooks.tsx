import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface FloatingBook {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  duration: number;
  color: string;
}

export function FloatingBooks() {
  const [books, setBooks] = useState<FloatingBook[]>([]);

  useEffect(() => {
    const colors = [
      'text-red-400/20',
      'text-blue-400/20',
      'text-green-400/20',
      'text-yellow-400/20',
      'text-purple-400/20',
      'text-pink-400/20',
      'text-indigo-400/20',
      'text-orange-400/20',
    ];

    const generateBooks = () => {
      const newBooks: FloatingBook[] = [];
      for (let i = 0; i < 12; i++) {
        newBooks.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.8,
          delay: Math.random() * 5,
          duration: 8 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setBooks(newBooks);
    };

    generateBooks();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {books.map((book) => (
        <div
          key={book.id}
          className={`absolute ${book.color} animate-float`}
          style={{
            left: `${book.x}%`,
            top: `${book.y}%`,
            transform: `rotate(${book.rotation}deg) scale(${book.scale})`,
            animationDelay: `${book.delay}s`,
            animationDuration: `${book.duration}s`,
          }}
        >
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
        </div>
      ))}
    </div>
  );
}
