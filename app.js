if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const port = process.env.PORT || 3000;



// Step 1: Require necessary modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Joi = require("joi"); // Validation library
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');


const LocalStrategy = require('passport-local');

// ✅ Importing User model (IMPORTANT FIX)
const User = require('./models/user.js');

// Optional Utility for wrapping async functions
const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};
// Import routes
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');

// Step 2: Express App Setup
const app = express();
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Optional: for clarity

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Step 3: Session Configuration
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Flash middleware to set local variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user|| null; // Optional: for navbar login state
    
    next();
});


// Step 4: Passport Configuration


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Step 5: MongoDB Connection
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
});
connectDB();

// Step 6: Utility Function (Optional for images)
function extractUrlFromImageField(imageField) {
    try {
        const imageObject = JSON.parse(imageField);
        return imageObject.url;
    } catch (error) {
        console.error('Error parsing image field:', error);
        return '';
    }
}

// Step 7: Test Route for creating dummy user
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// Step 8: Use Routes
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/signup", userRouter);
app.use("/", userRouter);// ✔️ Signup/login routes

// Step 9: Static Pages
app.get("/contact", (req, res) => {
    res.render('listings/contact.ejs');
});
app.get("/about", (req, res) => {
    res.render('listings/about.ejs');
});
app.get("/", (req, res) => {
    res.render('listings/home');
});



// Step 10: Start Server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
