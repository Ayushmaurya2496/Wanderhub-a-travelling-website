const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
        return res.status(404).send("Listing not found");
         }
     console.log(req.body.review);
     const newReview = new Review({
        comment: req.body.review.comment,
         rating: req.body.review.rating,
         author: req.user._id
           });
    listing.reviews.push(newReview);
    await newReview.save();
    req.flash("success","New review  added sucessfully");
    await listing.save();
    console.log("Saved successfully");
    res.redirect(`/listings/${listing._id}`);
}
module.exports.destroyReview=async (req, res) => {
    try {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success"," Listing review deleted");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).send("Internal Server Error");
    }
}