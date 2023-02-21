const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    UserEmail: {
        type: String
    }
});

const User = mongoose.model('users', PostSchema);

module.exports = User;