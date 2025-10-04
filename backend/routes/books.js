import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with pagination and filtering (accessible to all users)
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('genre').optional().isString().withMessage('Genre must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const genre = req.query.genre || '';

    const skip = (page - 1) * limit;

    // Build query - show all books to all users
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    // Determine sort order
    let sortOrder = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'oldest':
          sortOrder = { createdAt: 1 };
          break;
        case 'year-desc':
          sortOrder = { publishedYear: -1 };
          break;
        case 'year-asc':
          sortOrder = { publishedYear: 1 };
          break;
        case 'title-asc':
          sortOrder = { title: 1 };
          break;
        case 'title-desc':
          sortOrder = { title: -1 };
          break;
        case 'rating-desc':
        case 'rating-asc':
          // For rating sorting, we'll sort after getting the data
          sortOrder = { createdAt: -1 };
          break;
        default:
          sortOrder = { createdAt: -1 };
      }
    }

    // Get books with pagination
    let books = await Book.find(query)
      .populate('addedBy', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    // Get average ratings and review counts for each book
    let booksWithRatings = await Promise.all(
      books.map(async (book) => {
        const reviews = await Review.find({ bookId: book._id });
        const ratings = reviews.map(review => review.rating);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        return {
          ...book.toObject(),
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: ratings.length
        };
      })
    );

    // Sort by rating if requested
    if (req.query.sortBy === 'rating-desc') {
      booksWithRatings.sort((a, b) => b.averageRating - a.averageRating);
    } else if (req.query.sortBy === 'rating-asc') {
      booksWithRatings.sort((a, b) => a.averageRating - b.averageRating);
    }

    res.json({
      success: true,
      data: booksWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books'
    });
  }
});

// @route   GET /api/books/genres
// @desc    Get unique genres from all books
// @access  Private
router.get('/genres', async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    res.json({
      success: true,
      data: genres.sort()
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching genres'
    });
  }
});

// @route   GET /api/books/my-books
// @desc    Get books created by current user
// @access  Private
router.get('/my-books', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('genre').optional().isString().withMessage('Genre must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const genre = req.query.genre || '';

    const skip = (page - 1) * limit;

    // Build query - only show books added by the current user
    let query = {
      addedBy: req.user.id
    };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    // Determine sort order
    let sortOrder = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'oldest':
          sortOrder = { createdAt: 1 };
          break;
        case 'year-desc':
          sortOrder = { publishedYear: -1 };
          break;
        case 'year-asc':
          sortOrder = { publishedYear: 1 };
          break;
        case 'title-asc':
          sortOrder = { title: 1 };
          break;
        case 'title-desc':
          sortOrder = { title: -1 };
          break;
        case 'rating-desc':
        case 'rating-asc':
          // For rating sorting, we'll sort after getting the data
          sortOrder = { createdAt: -1 };
          break;
        default:
          sortOrder = { createdAt: -1 };
      }
    }

    // Get books with pagination
    let books = await Book.find(query)
      .populate('addedBy', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    // Get average ratings and review counts for each book
    let booksWithRatings = await Promise.all(
      books.map(async (book) => {
        const reviews = await Review.find({ bookId: book._id });
        const ratings = reviews.map(review => review.rating);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        return {
          ...book.toObject(),
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: ratings.length
        };
      })
    );

    // Sort by rating if requested
    if (req.query.sortBy === 'rating-desc') {
      booksWithRatings.sort((a, b) => b.averageRating - a.averageRating);
    } else if (req.query.sortBy === 'rating-asc') {
      booksWithRatings.sort((a, b) => a.averageRating - b.averageRating);
    }

    res.json({
      success: true,
      data: booksWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching my books'
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID (accessible to all users)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get reviews for this book
    const reviews = await Review.find({ bookId: book._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const ratings = reviews.map(review => review.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        ...book.toObject(),
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
        reviews
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book'
    });
  }
});

// @route   POST /api/books
// @desc    Create new book
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('author').trim().isLength({ min: 1, max: 100 }).withMessage('Author is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('genre').trim().isLength({ min: 1, max: 50 }).withMessage('Genre is required and must be less than 50 characters'),
  body('publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Published year must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, author, description, genre, publishedYear } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      genre,
      publishedYear,
      addedBy: req.user._id
    });

    const populatedBook = await Book.findById(book._id).populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: populatedBook
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating book'
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (only by book creator)
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('author').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Author must be less than 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('genre').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Genre must be less than 50 characters'),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Published year must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the creator
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating book'
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (only by book creator)
router.delete('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the creator
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this book'
      });
    }

    // Delete all reviews for this book
    await Review.deleteMany({ bookId: book._id });

    // Delete the book
    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting book'
    });
  }
});

export default router;
