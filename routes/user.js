const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user");

// ✅ Render signup form & Handle signup logic
router
  .route("/signup")
  .get(userController.signupform)
  .post(wrapAsync(userController.signup));

// ✅ Render login form & Handle login logic
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

// ✅ Logout route
router.get('/logout', userController.logout);

module.exports = router;
