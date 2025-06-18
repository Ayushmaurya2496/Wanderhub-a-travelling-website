const express = require('express');
const router = express.Router();
const Listing = require('../models/listing'); 
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require('../utils/wrapAsync');
const listingController = require("../controllers/listings");
const multer  = require('multer');
const {storage}=require("../cloudconfig");
const upload = multer({storage }) ;
// ✅ Create listing
router.route("/")
    .get(wrapAsync(listingController.index))  // all listings (index page)
    .post(
        isLoggedIn,
        upload.single('listing[image]'),//multer process data
        validateListing,
        wrapAsync(listingController.createListing)
    );

// ✅ New Listing Form
router.get('/new', isLoggedIn, listingController.renderNewForm);

// ✅ GET, PUT, DELETE specific listing
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// ✅ Edit Listing Form
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editForm));

module.exports = router;
