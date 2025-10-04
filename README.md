# Book Review Platform

A full-stack MERN application for book discovery and review sharing where users can discover books, share reviews, and connect with fellow book lovers.

## Features

- **User Authentication**: Sign up and login with JWT tokens
- **Book Management**: Add, edit, and delete your own books
- **Review System**: Rate and review any book with 1-5 stars (except your own)
- **Search & Filter**: Search by title/author and filter by genre across all books
- **Pagination**: Browse books with pagination (5 books per page)
- **Community Features**: View all books and reviews from the community
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- shadcn/ui components
- React Hook Form with Zod validation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd personal-book-library
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
PORT=5000
NODE_ENV=development
```

Replace the `MONGODB_URI` with your actual MongoDB connection string.

### 3. Frontend Setup

```bash
cd .. # Go back to root directory
npm install
```

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books (with pagination, search, filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book (protected)
- `PUT /api/books/:id` - Update book (protected, owner only)
- `DELETE /api/books/:id` - Delete book (protected, owner only)
- `GET /api/books/genres` - Get all genres

### Reviews
- `POST /api/reviews` - Create/update review (protected)
- `PUT /api/reviews/:id` - Update review (protected, owner only)
- `DELETE /api/reviews/:id` - Delete review (protected, owner only)
- `GET /api/reviews/user/:userId` - Get user's reviews

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed)
}
```

### Book
```javascript
{
  title: String,
  author: String,
  description: String,
  genre: String,
  publishedYear: Number,
  addedBy: ObjectId (ref: User)
}
```

### Review
```javascript
{
  bookId: ObjectId (ref: Book),
  userId: ObjectId (ref: User),
  rating: Number (1-5),
  reviewText: String
}
```

## Usage

1. **Sign Up/Login**: Create an account or login to access your personal library
2. **Add Books**: Click "Add Book" to add new books to your personal collection
3. **Browse Your Books**: View your personal book collection with search and filter options
4. **Review Your Books**: Click on any book to view details and add personal reviews
5. **Manage Your Collection**: Edit or delete your own books and reviews

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Frontend (.env.local)
- `VITE_API_URL`: Backend API URL

## Deployment

### Backend
Deploy to platforms like:
- Render
- Heroku
- AWS
- DigitalOcean

### Frontend
Deploy to platforms like:
- Vercel
- Netlify
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ by [Your Name]**