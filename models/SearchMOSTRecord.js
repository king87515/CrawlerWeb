const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Record_id
    Record_Context
    */
   // 科技部新聞資料
    Record_id: {
        type: String
    },
    Record_Context: {
        type: Array
    },
});

module.exports = mongoose.model('SearchMOSTRecords', PostSchema);