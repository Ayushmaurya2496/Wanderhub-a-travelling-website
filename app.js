// Step 1: Require necessary modules
const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');  // listing.js ka module yahan import ho raha hai
const path = require('path');
const ejsMate = require('ejs-mate');
const app = express();
app.engine('ejs',ejsMate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

// Step 2: Middleware to handle JSON requests
// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true })); // For URL-encoded data
 // For JSON data (optional, agar aapko JSON support chahiye)
app.use(express.json());  // iska use JSON body ko parse karne ke liye hota hai
const bodyParser = require('body-parser');
const listing = require('./models/listing');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// Step 3: MongoDB connection URL
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
// Step 4: Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(mongo_url);
        console.log("DB connection established");
    } catch (err) {
        console.log("Error connecting to DB", err);
    }
};
// Step 5: Connect to the database
connectDB();

// Step 6: API home  Route to Get All Listings
app.get('/listings', async (req, res) => {
    try {
        const alllistings = await Listing.find({});  
        res.render("listings/index.ejs",{alllistings}); 
        
        console.log("SHOWING  all LISTINGS");
    } catch (err) {
        res.status(500).json({ error: 'Error fetching listings' });
    }
});
//route to edit button pr click hone ke bad  ye error    Cannot GET /listings/listing/66ff583a7e0b9b7e3f3e16ab/edit
// Route to render the edit form
app.get('/listings/:id/edit', async (req, res) => {
    try {
        // Fetch the listing by ID
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        console.log("LISTING FOUND", listing);
        // Render the edit form with the listing data
        res.render('listings/edit', { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching listing');
    }
});


       
//update  route
// Route to handle form submission for updating a listing
app.put('/listings/:id', async (req, res) => {
    try {
        // Find the listing by ID and update it with new data
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedListing) {
            return res.status(404).send('Listing not found');
        }
        console.log("LISTING FOUND", +"updated value is", +req.body);
        // After updating, redirect to the updated listing's page
        res.redirect(`/listings/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating listing');
    }
});


//DELETE /listings
app.delete('/listings/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the listing ID from URL parameters
        console.log("DELTEDONE"+id);
        await Listing.findByIdAndDelete(id); // Find the listing by ID and delete it
        // Redirect to the listings page after successful deletion
        res.redirect('/listings');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting listing');
    }
});


// Route for render  form submission
app.get('/listings/new', async (req, res) => {
    try {
            console.log("GET request received at /test");
            res.render('listings/form');
    } catch (err) {
        res.status(500).json({ error: 'Error fetching listings' });
    }
});

//edit route
app.put('/listings/:id/edit', async (req, res) => {  
    console.log(req.body); //edit body 
    const editlisting = await Listing.findById(); 
    res.render('listings/edit', { editlisting});
    console.log("SHOWING EDIT FORM");
});

// Step 7: API Route to Create New Listing (POST)
app.post('/listings/new', async (req, res) => {
    console.log(req.body); // Form data ko print karta hai
    const newListing = new Listing({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
        country: req.body.country,
        location: req.body.location}); 
    try {
        await newListing.save();
    console.log(" CREATE NEW IN DATA");

       // Save the listing to DB
        res.redirect('/listings'); // Listings page par redirect kar deta hai after saving
    } catch (err) {
        res.status(500).send('Error while saving the listing');
    }
});


// Step 8: API Route to Get Specific Listing (GET) by ID
// Route to handle specific listing request by ID
app.get('/listings/:id', async (req, res) => {
    try {
        // Capture the listing ID from the URL
        const listingId = req.params.id;
        // Find the listing by its ID in the database
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        // Render a detailed view of the listing (e.g., listingDetail.ejs)
        res.render('listings/listingDetail', { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching listing');
    }
});

//contact details route
app.get("/contact", (req, res) => {
    res.render('listings/contact.ejs');
});
// about route
app.get("/about", (req, res) => {
    res.render('listings/about.ejs');
});

//hello world route
app.get("/", (req, res) => {
    res.render('listings/home');
});

// Step 9: Start the server on port 5000
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
