const { reviewSchema, listingSchema } = require("./schemas");
const Listing = require("./models/listing");
const Review = require("./models/review");


const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (!req.session) req.session = {};  // ✅ Ensure session exists first
        req.session.redirectUrl = req.originalUrl;  // ✅ Store redirect URL safely
        console.log("Stored redirectUrl in session:", req.session.redirectUrl); 

        req.flash("error", "Please log in to continue.");
        return res.redirect("/login");
    }
    next();
};
module.exports.validateListing = (req, res, next) => {
    // For instance, check if required fields are present:
    const { title, price } = req.body;
    if (!title || !price) {
        req.flash("error", "Title and Price are required!");
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

// saving url for redirect ,saving in variable
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {  // ✅ Use optional chaining to prevent errors
        res.locals.redirectUrl = req.session.redirectUrl;
        // ✅ Remove after storing in locals
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

    // ✅ If passed, go to next()
    next();
};