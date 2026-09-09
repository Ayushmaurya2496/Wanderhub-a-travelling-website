const User = require("../models/user");
const Listing = require("../models/listing");
module.exports.signupform=(req, res) => {
    res.render("users/signup");
}
module.exports.signup=async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}
module.exports.login=(req, res) => {
    req.flash("success", "Welcome back!");

   
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
}
module.exports.logout=(req, res, next) => {
    console.log("Before logout:", req.user);

    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "You are logged out!"); 
        console.log("After logout:", req.user);

        res.redirect('/login');  
        setTimeout(() => {  
            req.session.destroy(() => {
                console.log("Session Data:", req.session);
            });
          }, 500);  
    });
}

module.exports.savedListings = async (req, res) => {
    const user = await User.findById(req.user._id).populate("savedListings");
    const listings = user.savedListings.filter(Boolean);
    res.render("users/savedListings", { listings });
};

module.exports.profile = async (req, res) => {
    const [user, listings] = await Promise.all([
        User.findById(req.user._id).populate("savedListings"),
        Listing.find({ owner: req.user._id }).sort({ date: -1 })
    ]);

    if (!user) {
        req.flash("error", "User profile not found");
        return res.redirect("/listings");
    }

    res.render("users/profile", {
        profileUser: user,
        savedListings: user.savedListings.filter(Boolean),
        listings
    });
};

module.exports.showedProfile = async (req, res) => {
    const [user, listings] = await Promise.all([
        User.findById(req.user._id).populate("savedListings"),
        Listing.find({ owner: req.user._id }).sort({ date: -1 })
    ]);

    if (!user) {
        req.flash("error", "User profile not found");
        return res.redirect("/listings");
    }

    res.render("users/showedprofilepage", {
        profileUser: user,
        savedListings: user.savedListings.filter(Boolean),
        listings,
        isOwnProfile: true
    });
};

module.exports.showPublicProfile = async (req, res) => {
    const [user, listings] = await Promise.all([
        User.findById(req.params.userId).populate("savedListings"),
        Listing.find({ owner: req.params.userId }).sort({ date: -1 })
    ]);

    if (!user) {
        req.flash("error", "User profile not found");
        return res.redirect("/listings");
    }

    res.render("users/showedprofilepage", {
        profileUser: user,
        savedListings: user.savedListings.filter(Boolean),
        listings,
        isOwnProfile: Boolean(req.user && req.user._id.equals(user._id))
    });
};

module.exports.updateProfile = async (req, res) => {
    const { username, email, bio } = req.body;
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedBio = typeof bio === "string" ? bio.trim() : "";

    if (!trimmedUsername || !trimmedEmail) {
        req.flash("error", "Username and email are required");
        return res.redirect("/profile");
    }

    if (trimmedBio.length > 500) {
        req.flash("error", "Bio must be 500 characters or less");
        return res.redirect("/profile");
    }

    try {
        const user = await User.findById(req.user._id);
        user.username = trimmedUsername;
        user.email = trimmedEmail;
        user.bio = trimmedBio;
        await user.save();

        req.flash("success", "Profile updated successfully");
        res.redirect("/profile");
    } catch (err) {
        if (err.code === 11000) {
            req.flash("error", "That username or email is already in use");
            return res.redirect("/profile");
        }
        throw err;
    }
};

module.exports.saveListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { savedListings: listing._id }
    });
    req.flash("success", "Place saved to your wishlist");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.removeSavedListing = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedListings: req.params.id }
    });
    req.flash("success", "Place removed from your wishlist");
    res.redirect(`/listings/${req.params.id}`);
};