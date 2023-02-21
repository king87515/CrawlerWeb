const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_id
    Record_Context
    */
    // 經濟部本部新聞
    Record_id: {
        type: String
    },
    Record_Context: {
        type: Array
    },
});

module.exports = mongoose.model('SearchMOEARecords', PostSchema);