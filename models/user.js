const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// passportLocalMongoose adds a username and password in for us into the userSchma
// which is why we ourselves do not add in a username and password property into the schema manually
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);