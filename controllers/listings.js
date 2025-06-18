const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    try {
        const alllistings = await Listing.find({});
        res.render("listings/index.ejs", { alllistings });
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
        res.render('listings/listingDetail', { listing });
    } catch (err) {
        res.status(500).send('Error fetching listing');
    }
};
module.exports.createListing=async (req, res, next) => {
    try {
        let url=req.file.path;
        let filename=req.file.filename;
        const newListing = new Listing(req.body);  // Create a new listing with submitted data
        newListing.image={url,filename};
    
        newListing.owner = req.user._id;             // Set the listing's owner to the logged-in user
        await newListing.save();                     // Save the new listing to the database
        req.flash("success", "New Listing Created"); // Flash a success message
        res.redirect('/listings');                   // Redirect to the listings page
    } catch (err) {
        res.status(500).send('Error creating new listing'); // Handle any errors
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
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body, { new: true });
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating listing");
    }
}
module.exports.destroyListing=async (req, res) => {//delete listing
    try {
        await Listing.findByIdAndDelete(req.params.id);
        req.flash("success","Deleted Listing");
        res.redirect('/listings');
        
    } catch (err) {
        res.status(500).send('Error deleting listing');
    }
}