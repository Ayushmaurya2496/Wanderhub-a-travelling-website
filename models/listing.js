//schema
const mongoose = require("mongoose");

const a = new mongoose.Schema({
    title: {
        type: String,
    },
    description: String,
    category: String,
    image: {
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGFyaXMlMjBjYWZlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
        },
        filename: String,
    },
    author: String,
    price: {
        type: Number,  // Changed from String to Number
    },
    date: {
        type: Date,
        default: Date.now,
    },
    location: String,
    country: String,
});

module.exports = mongoose.model("Listing",a);
