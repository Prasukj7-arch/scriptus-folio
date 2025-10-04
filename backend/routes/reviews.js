import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Reviews API is working', timestamp: new Date().toISOString() });
});

// @route   POST /api/reviews
// @desc    Create or update review
// @access  Private
router.post('/', protect, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').trim().isLength({ min: 1, max: 500 }).withMessage('Review text is required and must be less than 500 characters')
], async (req, res) => {
  try {
    console.log('🚀 POST /api/reviews - Request received:', {
      body: req.body,
      user: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookId, rating, reviewText } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is trying to review their own book
    if (book.addedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot review your own book'
      });
    }

    // Allow multiple reviews from the same user on the same book
    console.log('🆕 Creating new review');
    const review = await Review.create({
      bookId,
      userId: req.user._id,
      rating,
      reviewText
    });
    console.log('✅ New review created with ID:', review._id);

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (only by review author)
router.put('/:id', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Review text must be less than 500 characters')
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

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the author
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (only by review author)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the author
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

// @route   GET /api/reviews/book/:bookId
// @desc    Get all reviews for a specific book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    console.log('🔍 Fetching reviews for book:', req.params.bookId);
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    console.log('📝 Found reviews:', reviews.length, 'reviews');
    console.log('📋 Review IDs:', reviews.map(r => r._id));

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book reviews'
    });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .populate('bookId', 'title author')
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
});

// @route   GET /api/reviews/can-review/:bookId
// @desc    Check if current user can review a specific book
// @access  Private
router.get('/can-review/:bookId', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the book owner
    const isOwner = book.addedBy.toString() === req.user._id.toString();
    
    if (isOwner) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'You cannot review your own book'
      });
    }

    // Allow multiple reviews from the same user on the same book

    res.json({
      success: true,
      canReview: true
    });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking review eligibility'
    });
  }
});

export default router;
