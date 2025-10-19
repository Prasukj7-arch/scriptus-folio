# 📚 Book Review Platform

A modern, full-stack MERN application where book lovers can discover, review, and share their favorite books with the community. Built with React, Node.js, and MongoDB, featuring a beautiful UI with dark/light mode, real-time search, and interactive rating charts.

## 🚀 Live Demo

- **Frontend**: [https://scriptus-folio.vercel.app/](https://scriptus-folio.vercel.app/)
- **Backend API**: [https://web-production-ac936.up.railway.app](https://web-production-ac936.up.railway.app)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, shadcn/ui
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Secure password hashing with bcryptjs
- Protected routes and API endpoints
- User profile management

### 📚 Book Management
- Add new books with title, author, description, genre, and published year
- Edit and delete books (creator-only permissions)
- View all books with pagination (5 books per page)
- Search books by title and author
- Filter books by genre and published year
- Sort books by newest, oldest, highest rated, and alphabetical

### ⭐ Review System
- Rate books from 1-5 stars
- Write detailed text reviews
- Multiple reviews per user per book
- Edit and delete your own reviews
- View all reviews with user information
- Average rating calculation and display

### 📊 Analytics & Visualization
- Interactive rating distribution charts (Bar & Pie charts)
- Review statistics and trends
- Book popularity metrics
- User engagement analytics

### 🎨 UI/UX Features
- Modern, responsive design with Tailwind CSS
- Dark/Light/System theme toggle
- Floating book animations
- Glassmorphism effects
- Mobile-first responsive design
- Loading states and error handling
- Toast notifications for user feedback

## 🚀 Deployment

### Backend on Railway
- **Platform**: Railway
- **URL**: https://web-production-ac936.up.railway.app
- **Environment Variables**: MONGODB_URI, JWT_SECRET, NODE_ENV

### Frontend on Vercel
- **Platform**: Vercel
- **URL**: https://scriptus-folio-mks6s50ax-prasukjain200005-gmailcoms-projects.vercel.app
- **Environment Variables**: VITE_API_URL

## 🔧 Local Development

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account (free tier available)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Prasukj7-arch/scriptus-folio.git
cd scriptus-folio
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run backend:install
```

3. **Environment Setup**

Create a `.env` file in the `backend` directory:
```bash
# Backend Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
```

Create a `.env.local` file in the root directory:
```bash
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development servers**

**Option 1: Start both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Start them separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

5. **Access the application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
scriptus-folio/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database configuration
│   ├── middleware/            # Authentication middleware
│   ├── models/                # Mongoose schemas (User, Book, Review)
│   ├── routes/                # API routes (auth, books, reviews)
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express server entry point
├── src/                       # React frontend
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── BookCard.tsx       # Book display component
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── Footer.tsx         # Footer component
│   │   └── StarRating.tsx     # Rating component
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ThemeContext.tsx   # Theme management
│   ├── pages/                 # Page components
│   │   ├── Home.tsx           # Landing page
│   │   ├── Auth.tsx           # Login/Signup page
│   │   ├── AllBooks.tsx       # All books listing
│   │   ├── MyBooks.tsx        # User's books
│   │   ├── BookDetails.tsx    # Book details & reviews
│   │   ├── BookForm.tsx       # Add/Edit book form
│   │   └── Profile.tsx        # User profile
│   ├── services/              # API services
│   │   └── api.ts             # Axios configuration
│   ├── lib/                   # Utilities
│   │   └── utils.ts           # Helper functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
│   ├── favicon.svg            # App icon
│   └── robots.txt             # SEO configuration
├── package.json               # Root dependencies & scripts
├── vercel.json                # Vercel deployment config
├── railway.json               # Railway deployment config
├── Dockerfile                 # Docker configuration
└── README.md                  # Project documentation
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Books
- `GET /api/books` - Get all books (public, paginated)
- `GET /api/books/my-books` - Get user's books (protected)
- `GET /api/books/:id` - Get book details (public)
- `GET /api/books/genres` - Get available genres (public)
- `POST /api/books` - Create book (protected)
- `PUT /api/books/:id` - Update book (protected, owner only)
- `DELETE /api/books/:id` - Delete book (protected, owner only)

### Reviews
- `GET /api/reviews/book/:bookId` - Get book reviews (public)
- `GET /api/reviews/user/:userId` - Get user's reviews (protected)
- `GET /api/reviews/can-review/:bookId` - Check if user can review (protected)
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id` - Update review (protected, author only)
- `DELETE /api/reviews/:id` - Delete review (protected, author only)

### Health Check
- `GET /api/health` - API health status

## 🎯 Assignment Requirements

### ✅ Core Requirements
- **MERN Stack**: MongoDB, Express, React, Node.js
- **Authentication**: JWT + bcryptjs for secure user management
- **CRUD Operations**: Complete book and review management system
- **Pagination**: 5 books per page as specified
- **Security**: Protected routes and comprehensive input validation
- **UI/UX**: Modern, responsive design with excellent user experience

### ✅ Advanced Features
- **Search & Filter**: Real-time search by title/author, filter by genre/year
- **Sorting**: Multiple sort options (newest, oldest, highest rated, alphabetical)
- **Rating System**: 1-5 star rating with detailed text reviews
- **Multiple Reviews**: Users can post multiple reviews per book
- **Analytics**: Interactive charts showing rating distributions
- **Theme Support**: Dark/Light/System theme toggle
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### ✅ Technical Excellence
- **TypeScript**: Full type safety throughout the application
- **Form Validation**: React Hook Form + Zod for robust validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized with React Query for data fetching
- **Accessibility**: WCAG compliant UI components
- **SEO**: Proper meta tags and structured data

## 🚀 Deployment Guide

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: Set to `production`
3. Deploy automatically on git push

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `VITE_API_URL`: Your Railway backend URL + `/api`
3. Deploy automatically on git push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is created for educational purposes and is open source.

## 👨‍💻 Author

**Prasuk Jain**
- GitHub: [@Prasukj7-arch](https://github.com/Prasukj7-arch)
- LinkedIn: [Prasuk Jain](https://www.linkedin.com/in/prasuk-jain-6704a4248/)

---

**Happy Reading! 📖✨**
