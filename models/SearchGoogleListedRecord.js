const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_Listed_Context 上市櫃
     */
    Searching_Time: {
        type: Date
    },
    Record_CompanyName: {
        type: String
    },
    Record_Listed_Context: {
        type: Array
    }
});

module.exports = mongoose.model('SearchGoogleListedRecords', PostSchema);
