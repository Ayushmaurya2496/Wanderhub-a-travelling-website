const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require("../middleware");
const userController = require("../controllers/user");

router
  .route("/signup")
  .get(userController.signupform)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get((req, res) => {
    res.render("users/login");
  })
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login
  );

router.get('/logout', userController.logout);

router.get("/profile/showed/:userId", wrapAsync(userController.showPublicProfile));
router.get("/profile/showed", isLoggedIn, wrapAsync(userController.showedProfile));
router.get("/profile", isLoggedIn, wrapAsync(userController.profile));
router.put("/profile", isLoggedIn, wrapAsync(userController.updateProfile));
router.get("/saved", isLoggedIn, wrapAsync(userController.savedListings));
router.post("/saved/:id", isLoggedIn, wrapAsync(userController.saveListing));
router.delete("/saved/:id", isLoggedIn, wrapAsync(userController.removeSavedListing));

module.exports = router;
