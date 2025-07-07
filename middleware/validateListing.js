const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const isLoggedIn = require('../middleware/isLoggedIn');
const { validateListing } = require('../middleware/validateListing'); 
const wrapAsync = require('../utils/wrapAsync');

router.post('/new', isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect('/listings');
}));

module.exports = router;