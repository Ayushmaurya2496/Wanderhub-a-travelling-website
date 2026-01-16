if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const port = process.env.PORT || 3000;



const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Joi = require("joi"); 
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');
const Listing = require('./models/listing'); 
const helmet = require("helmet");



const LocalStrategy = require('passport-local');

const User = require('./models/user.js');

const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');

const app = express();
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Optional: for clarity

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    },
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user|| null; 
    
    next();
});


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const localMongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
const primaryMongoUrl = process.env.MONGO_URL;

async function connectMongo() {
    const primaryLabel = primaryMongoUrl ? "MONGO_URL (remote/Atlas)" : "local MongoDB";
    const firstTryUrl = primaryMongoUrl || localMongoUrl;

    try {
        console.log(`Connecting to MongoDB using ${primaryLabel}`);
        await mongoose.connect(firstTryUrl);
        console.log("MongoDB connected successfully");
        return;
    } catch (err) {
        const shouldFallbackToLocal =
            Boolean(primaryMongoUrl) &&
            (err?.code === "ENOTFOUND" || err?.code === "ETIMEOUT" || err?.code === "ESERVFAIL");

        if (shouldFallbackToLocal) {
            console.error(
                "MongoDB Atlas connection failed due to DNS/network. Falling back to local MongoDB (127.0.0.1:27017)."
            );
            try {
                await mongoose.connect(localMongoUrl);
                console.log("MongoDB connected successfully (local)");
                return;
            } catch (fallbackErr) {
                console.error("Local MongoDB connection error:", fallbackErr);
                throw fallbackErr;
            }
        }

        if (err && err.code === "ENOTFOUND" && typeof err.hostname === "string") {
            console.error(
                "MongoDB DNS lookup failed (ENOTFOUND). This usually means your network/DNS cannot resolve the Atlas hostname or SRV records."
            );
            console.error(
                "Fix: check internet/VPN/proxy, try changing DNS (8.8.8.8 or 1.1.1.1), or use the non-SRV Atlas connection string (mongodb://...) from MongoDB Atlas."
            );
        }
        console.error("MongoDB connection error:", err);
        throw err;
    }
}

connectMongo().catch(() => {
    // Errors are already logged above.
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://res.cloudinary.com",
                    "https://images.unsplash.com",
                    "https://plus.unsplash.com"
                ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);


function extractUrlFromImageField(imageField) {
    try {
        const imageObject = JSON.parse(imageField);
        return imageObject.url;
    } catch (error) {
        console.error('Error parsing image field:', error);
        return '';
    }
}


app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/signup", userRouter);
app.use("/", userRouter);// 

app.get("/contact", (req, res) => {
    res.render('listings/contact.ejs');
});
app.get("/about", (req, res) => {
    res.render('listings/about.ejs');
});

app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;

        // case-insensitive partial match using RegExp
        const regex = new RegExp(query, 'i');

        const listings = await Listing.find({
            $or: [
                { location: regex },
                { title: regex },
                { country: regex }
            ]
        });

        res.render('listings/searchResults', { listings, query });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
// #top rated
app.get("/", async (req, res) => {
 try {
        const listings = await Listing.aggregate([
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'reviews',
                    foreignField: '_id',
                    as: 'reviewData'
                }
            },
            {
                $addFields: {
                    totalReviews: { $size: "$reviewData" }
                }
            },
            {
                $sort: {
                    rating: -1,
                    totalReviews: -1
                }
            },
            {
                $limit: 6
            }
        ]);
        res.render('listings/home', { topListings: listings }); // ✅ pass correctly
    } catch (err) {
        console.error("Error in getTopListings:", err);
        res.status(500).send("Something went wrong");
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Server running on http://localhost:${port}`);

});
