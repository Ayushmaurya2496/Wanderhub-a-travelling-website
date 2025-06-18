const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const Review = require("./review.js");
const { string } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
    },
    description: String,
    category: String,
    image: {
        url:String,
        filename:String,
    },
    author: String,
    price: {
        type: Number,  
    },
    date: {
        type: Date,
        default: Date.now,
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        } // Comma was added here
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref: "User",
    },
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    await Review.deleteMany({ _id: { $in: listing.reviews } });
});

module.exports = mongoose.model("Listing", listingSchema);
