const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },
    savedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }]
});

//  passport-local-mongoose plugin to handle authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);