const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn, isAuthor, validateReview } = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');
const reviewController = require("../controllers/reviews");


router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

router.delete("/:reviewId",
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;
