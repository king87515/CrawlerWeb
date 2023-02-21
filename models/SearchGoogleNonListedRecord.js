const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_NonListed_Context 未上市櫃
     */
    Searching_Time: {
        type: Date
    },
    Record_CompanyName: {
        type: String
    },
    Record_NonListed_Context: {
        type: Array
    }
});

module.exports = mongoose.model('SearchGoogleNonListedRecords', PostSchema);
