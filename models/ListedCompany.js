const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    CompanyCode
    CompanyAbbreviation 
    */
    CompanyCode: {
        type: String
    },
    CompanyAbbreviation: {
        type: String
    },
});

module.exports = mongoose.model('ListedCompanies', PostSchema);