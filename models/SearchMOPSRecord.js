const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_id
    Record_Context
    */
    // 公開資訊觀測站即時重大訊息
    Record_id: {
        type: String
    },
    Record_Context: {
        type: Array
    },
});

module.exports = mongoose.model('SearchMOPSRecords', PostSchema);