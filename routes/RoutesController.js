var express = require('express');
var router = express();

// Import Routes
const keywordsRoute = require('../controller/KeywordsController');
const SearchMOEARecordsRoute = require('../controller/SearchMOEARecordsController');
const SearchMOEAICRecordsRoute = require('../controller/SearchMOEAICRecordsController');
const SearchMOSTRecordsRoute = require('../controller/SearchMOSTRecordsController');
const listedcompaniesRoute = require('../controller/ListedCompaniesController');
const listedgooglepagesRoute = require('../controller/ListedGooglePagesController');
const listedmachinerycompaniesRoute = require('../controller/ListedMachineryCompaniesController');
const listedmachinerykeywordsRoute = require('../controller/ListedMachineryKeywordsController');
const nonlistedcompaniesRoute = require('../controller/NonListedCompaniesController');
const googlekeywordsRoute = require('../controller/GoogleKeywordsController');
const usersRoute = require('../controller/UsersController');



// Middle Ware
router.use('/keywords', keywordsRoute);
// router.use('/searchmoearecords', SearchMOEARecordsRoute);
// router.use('/searchmoeaicrecords', SearchMOEAICRecordsRoute);
// router.use('/searchmostrecords', SearchMOSTRecordsRoute);
router.use('/listedcompanies', listedcompaniesRoute);
router.use('/listedgooglepages', listedgooglepagesRoute);
router.use('/listedmachinerycompanies', listedmachinerycompaniesRoute);
router.use('/listedmachinerykeywords', listedmachinerykeywordsRoute);
router.use('/nonlistedcompanies', nonlistedcompaniesRoute);
router.use('/googlekeywords', googlekeywordsRoute);
router.use('/users', usersRoute);

module.exports = router;