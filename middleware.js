const { reviewSchema, listingSchema } = require("./schemas");
const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (!req.session) req.session = {};  
        req.session.redirectUrl = req.originalUrl;  
        console.log("Stored redirectUrl in session:", req.session.redirectUrl); 
        req.flash("error", "Please log in to continue.");
        return res.redirect("/login");
    }
    next();
};
module.exports.validateListing = (req, res, next) => {
    const { title, price } = req.body;
    const numericPrice = Number(price);
    if (!title || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        req.flash("error", "Title and a positive price are required!");
        return res.redirect("back");
    }
    next();
};


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) { 
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        return next();
    }

    req.flash("error", "You don't have permission to do that");
    res.redirect(`/listings/${id}`);
};
module.exports.isAuthor = async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect("back");
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect("back");
    }

    next();
};

module.exports.isReviewAuthorOrOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const [listing, review] = await Promise.all([
        Listing.findById(id),
        Review.findById(reviewId)
    ]);

    if (!listing || !review || !listing.reviews.some((listingReviewId) => listingReviewId.equals(review._id))) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (listing.owner.equals(req.user._id) || review.author.equals(req.user._id)) {
        req.listing = listing;
        req.review = review;
        return next();
    }

    req.flash("error", "You are not authorized to manage this review");
    return res.redirect(`/listings/${id}`);
};