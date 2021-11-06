const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, 
    catchAsync(reviews.submitReview));

router.delete('/:reviewId', isLoggedIn, 
    isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;