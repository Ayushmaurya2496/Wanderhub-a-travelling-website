const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
//here local mongose can add username,pass schema also automatically in userschema
// passport-Local-Mongoose simplifies user authentication in a Node.js app using Mongoose. Here's what it does in your user.js model:
// - Hashing and Storing Passwords – Automatically hashes passwords using bcrypt and stores them in the database securely.
// - Salting Passwords – Adds a unique salt to each password, making it harder to crack.
// - User Serialization & Session Management – Helps maintain user sessions, so once logged in, they don't have to keep re-entering c


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