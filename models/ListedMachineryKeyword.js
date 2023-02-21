const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    MachineryKeyword 
    */
    MachineryKeyword: {
        type: String
    }
});

module.exports = mongoose.model('ListedMachineryKeywords', PostSchema);