const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    KeywordCompany  // 上市 0 未上市 1
    KeywordCompanyName  // 上市 0 未上市 1
   */
    KeywordCompany: {
        type: Boolean
    },
    KeywordCompanyName: {
        type: Number
    }
});

module.exports = mongoose.model('KeywordRecords', PostSchema);