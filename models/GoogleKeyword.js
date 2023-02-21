const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    GoogleSeachKeyword 
    */
    GoogleSearchKeyword: {
        type: String
    }
});

module.exports = mongoose.model('GoogleKeywords', PostSchema);