# 📚 Book Review Platform

A full-stack MERN application where users can discover, review, and share books with the community.

## 🚀 Live Demo

- **Frontend**: [https://scriptus-folio-mks6s50ax-prasukjain200005-gmailcoms-projects.vercel.app](https://scriptus-folio-mks6s50ax-prasukjain200005-gmailcoms-projects.vercel.app)
- **Backend API**: [https://web-production-ac936.up.railway.app](https://web-production-ac936.up.railway.app)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Deployment**: Render (Frontend + Backend)

## ✨ Features

- 🔐 User Authentication (Sign up/Login)
- 📖 Book Management (Add, Edit, Delete books)
- ⭐ Review System (Rate and review books)
- 🔍 Search & Filter books
- 📊 Rating charts and statistics
- 🌙 Dark/Light mode toggle
- 📱 Responsive design

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
- Node.js (v18+)
- MongoDB Atlas account
- Git

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
   cd book-review-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Frontend Setup**
```bash
   npm install
   cp .env.local.example .env.local
   # Update .env.local with your backend URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
book-review-platform/
├── backend/                 # Node.js/Express API
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── server.js           # Express server
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   └── lib/                # Utilities
└── public/                 # Static assets
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books (paginated)
- `GET /api/books/my-books` - Get user's books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (auth required)
- `PUT /api/books/:id` - Update book (auth required)
- `DELETE /api/books/:id` - Delete book (auth required)

### Reviews
- `GET /api/reviews/book/:bookId` - Get book reviews
- `POST /api/reviews` - Create review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)

## 🎯 Assignment Requirements

✅ **MERN Stack**: MongoDB, Express, React, Node.js  
✅ **Authentication**: JWT + bcryptjs  
✅ **CRUD Operations**: Full book and review management  
✅ **Pagination**: 5 books per page  
✅ **Security**: Protected routes and input validation  
✅ **UI/UX**: Modern, responsive design  
✅ **Bonus Features**: Search, filter, charts, dark mode  

## 📝 License

This project is created for educational purposes.

---

**Happy Reading! 📖✨**