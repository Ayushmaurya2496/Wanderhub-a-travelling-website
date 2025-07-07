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

router.route("/")
    .get(wrapAsync(listingController.index)) 
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editForm));

module.exports = router;
