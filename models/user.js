const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//  passport-local-mongoose plugin to handle authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);