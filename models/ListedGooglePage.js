const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    GooglePagesName
    GooglePagesURL 
    */
    GooglePagesName: {
        type: String
    },
    GooglePagesURL: {
        type: String
    }
});

module.exports = mongoose.model('ListedGooglePages', PostSchema);