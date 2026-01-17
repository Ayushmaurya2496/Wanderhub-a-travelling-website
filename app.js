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

const isProduction = (process.env.NODE_ENV || '').trim() === 'production' || Boolean(process.env.RENDER);

// Fail fast if DB isn't connected (prevents 10s "buffering timed out" errors)
mongoose.set('bufferCommands', false);

const localMongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
const primaryMongoUrl = process.env.MONGO_URL;
const fallbackMongoUrl = process.env.MONGO_URL_FALLBACK;

function getSanitizedMongoHost(mongoUrl) {
    if (!mongoUrl || typeof mongoUrl !== 'string') return null;
    // Extract host portion without leaking credentials.
    // Works for both mongodb:// and mongodb+srv:// forms.
    const match = mongoUrl.match(/^mongodb\+srv:\/\/[^@/]+@([^/?#]+)|^mongodb:\/\/[^@/]+@([^/?#]+)/i);
    if (match && match[1]) return match[1];
    // If URI has no userinfo, still try to extract host.
    const matchNoAuth = mongoUrl.match(/^mongodb\+srv:\/\/([^/?#]+)|^mongodb:\/\/([^/?#]+)/i);
    return (matchNoAuth && matchNoAuth[1]) ? matchNoAuth[1] : null;
}

async function connectMongo() {
    if (isProduction && !primaryMongoUrl) {
        throw new Error("Missing MONGO_URL in production environment (set it in Render -> Environment)");
    }

    if (isProduction && primaryMongoUrl && /127\.0\.0\.1|localhost/i.test(primaryMongoUrl)) {
        throw new Error(
            "MONGO_URL points to localhost, which will not work on Render. Set it to your MongoDB Atlas connection string."
        );
    }

    const primaryLabel = primaryMongoUrl ? "MONGO_URL (remote/Atlas)" : "local MongoDB";
    const firstTryUrl = primaryMongoUrl || localMongoUrl;

    if (primaryMongoUrl) {
        const mongoHost = getSanitizedMongoHost(primaryMongoUrl);
        if (mongoHost) console.log(`MongoDB host: ${mongoHost}`);
    }
    if (fallbackMongoUrl) {
        const fallbackHost = getSanitizedMongoHost(fallbackMongoUrl);
        if (fallbackHost) console.log(`MongoDB fallback host: ${fallbackHost}`);
    }

    try {
        console.log(`Connecting to MongoDB using ${primaryLabel}`);
        await mongoose.connect(firstTryUrl, {
            serverSelectionTimeoutMS: 30000,
            family: 4,
        });
        console.log("MongoDB connected successfully");
        return;
    } catch (err) {
        // Print deeper MongoDB driver details (helps distinguish whitelist vs auth vs TLS vs DNS)
        if (err?.name === 'MongooseServerSelectionError' && err?.reason?.servers) {
            try {
                const servers = Array.from(err.reason.servers.entries());
                for (const [address, description] of servers) {
                    const driverErr = description?.error;
                    if (driverErr?.message) {
                        console.error(`MongoDB server ${address} error: ${driverErr.message}`);
                    }
                }
            } catch {
                // ignore diagnostics errors
            }
        }
        const shouldFallbackToLocal =
            !isProduction &&
            Boolean(primaryMongoUrl) &&
            (err?.code === "ENOTFOUND" || err?.code === "ETIMEOUT" || err?.code === "ESERVFAIL");

        const shouldTryNonSrvFallback =
            isProduction &&
            Boolean(primaryMongoUrl) &&
            /^mongodb\+srv:\/\//i.test(primaryMongoUrl) &&
            Boolean(fallbackMongoUrl) &&
            (err?.code === "ENOTFOUND" || err?.code === "ESERVFAIL");

        if (shouldTryNonSrvFallback) {
            console.error(
                "MongoDB SRV DNS lookup failed in production. Trying MONGO_URL_FALLBACK (non-SRV) ..."
            );
            try {
                await mongoose.connect(fallbackMongoUrl, {
                    serverSelectionTimeoutMS: 30000,
                    family: 4,
                });
                console.log("MongoDB connected successfully (fallback)");
                return;
            } catch (fallbackErr) {
                console.error("MongoDB fallback connection error:", fallbackErr);
                throw fallbackErr;
            }
        }

        if (shouldFallbackToLocal) {
            console.error(
                "MongoDB Atlas connection failed due to DNS/network. Falling back to local MongoDB (127.0.0.1:27017)."
            );
            try {
                await mongoose.connect(localMongoUrl, {
                    serverSelectionTimeoutMS: 30000,
                    family: 4,
                });
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
            console.error(
                "Also double-check your MONGO_URL hostname for typos (common: cluster0 vs clustero) and remove any extra spaces/newlines in Render Environment variables."
            );
        }
        console.error("MongoDB connection error:", err);
        throw err;
    }
}

async function start() {
    await connectMongo();

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`Server running on http://localhost:${port}`);
    });
}

start().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
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
