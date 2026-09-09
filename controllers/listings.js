const Listing = require("../models/listing");
const User = require("../models/user");

const listingCategories = [
    "None",
    "Beaches",
    "Mountains",
    "Hill Stations",
    "Historical Places",
    "Heritage Sites",
    "Religious Places",
    "Museums",
    "Wildlife Sanctuaries",
    "National Parks",
    "Waterfalls",
    "Lakes",
    "Rivers",
    "Islands",
    "Deserts",
    "Adventure Activities",
    "Amusement Parks",
    "Cultural Attractions",
    "Shopping Places",
    "Food and Dining",
    "Eco-Tourism",
    "Family Destinations",
    "Romantic Getaways",
    "Photography Spots",
    "Camping Sites",
    "Wellness and Spa",
    "Offbeat Destinations"
];

module.exports.index = async (req, res) => {
    try {
        const requestedCategory = typeof req.query.category === "string"
            ? req.query.category.trim()
            : "";
        const selectedCategory = listingCategories.includes(requestedCategory)
            ? requestedCategory
            : "";
        const filter = selectedCategory ? { category: selectedCategory } : {};
        const alllistings = await Listing.find(filter).sort({ date: -1 });
        res.render("listings/index.ejs", {
            alllistings,
            listingCategories,
            selectedCategory
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching listings' });
    }
};
module.exports.renderNewForm = (req, res) => {
    res.render('listings/form');
};
module.exports.showListing=async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await Listing.findById(listingId)
        .populate({
            path:"reviews",
            populate:
            { path:"author",
                select: "username",
            }
            ,}
        ).populate("owner");
        if (!listing) return res.status(404).send('Listing not found');

        const approvedReviews = listing.reviews.filter((review) => review.status === "approved" || !review.status);
        const approvedReviewCount = approvedReviews.length;
        const averageRating = approvedReviewCount
            ? approvedReviews.reduce((total, review) => total + review.rating, 0) / approvedReviews.length
            : 0;
        const isSaved = Boolean(req.user && await User.exists({
            _id: req.user._id,
            savedListings: listing._id
        }));
        res.render('listings/listingDetail', { listing, averageRating, approvedReviewCount, isSaved });
    } catch (err) {
        res.status(500).send('Error fetching listing');
    }
};
module.exports.createListing=async (req, res, next) => {
    try {
        let url=req.file.path;
        let filename=req.file.filename;
        const newListing = new Listing(req.body);  
        newListing.image={url,filename};
    
        newListing.owner = req.user._id;          
        await newListing.save();                
        req.flash("success", "New Listing Created"); 
        res.redirect('/listings');            
    } catch (err) {
        res.status(500).send('Error creating new listing');
    }
}
module.exports.editForm=async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).send('Listing not found');
        res.render('listings/edit', { listing });
    } catch (err) {
        res.status(500).send('Error fetching listing');
    }
}
module.exports.updateListing=async (req, res) => {
    try {
        const { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating listing");
    }
}
module.exports.destroyListing=async (req, res) => {
    try {
        const deletedListing = await Listing.findByIdAndDelete(req.params.id);
        if (deletedListing) {
            await User.updateMany(
                { savedListings: deletedListing._id },
                { $pull: { savedListings: deletedListing._id } }
            );
        }
        req.flash("success","Deleted Listing");
        res.redirect('/listings');
        
    } catch (err) {
        res.status(500).send('Error deleting listing');
    }
}