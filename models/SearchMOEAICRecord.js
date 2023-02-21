const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_id
    Record_Context
    */
    // 投審會最新公告
    Record_id: {
        type: String
    },
    Record_Context: {
        type: Array
    },
});

module.exports = mongoose.model('SearchMOEAICRecords', PostSchema);