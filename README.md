# 📚 Book Review Platform

A full-stack MERN application where users can discover, review, and share books with the community.

## 🚀 Live Demo

- **Frontend**: [https://your-frontend-url.onrender.com](https://your-frontend-url.onrender.com)
- **Backend API**: [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com)

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

## 🚀 Deployment on Render

### Backend Deployment

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Choose "Web Service"
   - Set the following:
     - **Name**: `book-review-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Environment Variables**
   Add these in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   ```

### Frontend Deployment

1. **Create a new Static Site on Render**
   - Connect your GitHub repository
   - Choose "Static Site"
   - Set the following:
     - **Name**: `book-review-frontend`
     - **Root Directory**: `(leave empty)`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Environment Variables**
   Add this in Render dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

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