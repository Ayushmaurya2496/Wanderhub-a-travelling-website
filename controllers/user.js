const User = require("../models/user");
module.exports.signupform=(req, res) => {
    res.render("users/signup");
}
module.exports.signup=async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // ✅ Automatically log in after signup
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

    // ✅ Correct `redirectUrl` reference
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
}
module.exports.logout=(req, res, next) => {
    console.log("Before logout:", req.user);

    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "You are logged out!");  // ✅ Flash message set before redirect
        console.log("After logout:", req.user);

        res.redirect('/login');  // ✅ Redirect before session destroy

        setTimeout(() => {  // ✅ Delay session destroy to preserve flash message
            req.session.destroy(() => {
                console.log("Session Data:", req.session);
            });
          }, 500);  // Small delay for session handling
    });
}