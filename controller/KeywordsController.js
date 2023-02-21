const express = require('express');
const router = express.Router();
const Keyword = require('../models/Keyword');
const SearchMOEAICRecord = require('../models/SearchMOEAICRecord');
const SearchMOEARecord = require('../models/SearchMOEARecord');
const SearchMOPSRecord = require('../models/SearchMOPSRecord');
const SearchMOSTRecord = require('../models/SearchMOSTRecord');

const crawlerRoutes = require('../views_script/crawler/crawlerRoutes');
//ROUTES
router.get('/', async (req, res) => {
    try {
        const posts = await Keyword.find();
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const post = new Keyword({
        /*
        Keyword
        KeywordEmail
        KeywordStartSunday
        KeywordStartMonday
        KeywordStartTuesday
        KeywordStartWednesday
        KeywordStartThursday
        KeywordStartFriday
        KeywordStartSaturday
        KeywordTimeFrom : 開始~
        KeywordTimeTo : 至~
        KeywordTimes
        KeywordFrequency
        KeywordQueryRecord
        KeywordSearchWeb

        KeywordSearchMOEA
        KeywordSearchMOEAIC
        KeywordSearchMOST
        KeywordSearchMOPS
        KeywordSearchGOOGLE

        KeywordMOEA
        KeywordMOEAIC
        KeywordMOST
        KeywordGOOGLE

        KeywordValid
        */
        KeywordEmail: req.body.KeywordEmail,
        KeywordStartSunday: req.body.KeywordStartSunday,
        KeywordStartMonday: req.body.KeywordStartMonday,
        KeywordStartTuesday: req.body.KeywordStartTuesday,
        KeywordStartWednesday: req.body.KeywordStartWednesday,
        KeywordStartThursday: req.body.KeywordStartThursday,
        KeywordStartFriday: req.body.KeywordStartFriday,
        KeywordStartSaturday: req.body.KeywordStartSaturday,
        KeywordTimeFrom: req.body.KeywordTimeFrom,
        KeywordTimeTo: req.body.KeywordTimeTo,
        KeywordTimes: req.body.KeywordTimes,
        KeywordFrequency: req.body.KeywordFrequency,
        KeywordQueryRecord: req.body.KeywordQueryRecord,

        KeywordSearchMOEA: req.body.KeywordSearchMOEA,
        KeywordSearchMOEAIC: req.body.KeywordSearchMOEAIC,
        KeywordSearchMOST: req.body.KeywordSearchMOST,
        KeywordSearchMOPS: req.body.KeywordSearchMOPS,
        KeywordSearchGOOGLE: req.body.KeywordSearchGOOGLE,

        KeywordMOEA: req.body.KeywordMOEA,
        KeywordMOEAIC: req.body.KeywordMOEAIC,
        KeywordMOST: req.body.KeywordMOST,
        KeywordGOOGLE: req.body.KeywordGOOGLE,

        KeywordValid: req.body.KeywordValid,
    });

    try {
        //console.log("save: " + post);
        const savedPost = await post.save();

        var keyword = [];
        keyword._id = savedPost._id;
        keyword.KeywordEmail = savedPost.KeywordEmail;
        keyword.KeywordStartSunday = savedPost.KeywordStartSunday;
        keyword.KeywordStartMonday = savedPost.KeywordStartMonday;
        keyword.KeywordStartTuesday = savedPost.KeywordStartTuesday;
        keyword.KeywordStartWednesday = savedPost.KeywordStartWednesday;
        keyword.KeywordStartThursday = savedPost.KeywordStartThursday;
        keyword.KeywordStartFriday = savedPost.KeywordStartFriday;
        keyword.KeywordStartSaturday = savedPost.KeywordStartSaturday;
        keyword.KeywordTimeFrom = savedPost.KeywordTimeFrom;
        keyword.KeywordTimeTo = savedPost.KeywordTimeTo;
        keyword.KeywordTimes = savedPost.KeywordTimes;
        keyword.KeywordFrequency = savedPost.KeywordFrequency;
        keyword.KeywordQueryRecord = savedPost.KeywordQueryRecord;
        keyword.KeywordSearchMOEA = savedPost.KeywordSearchMOEA;
        keyword.KeywordSearchMOEAIC = savedPost.KeywordSearchMOEAIC;
        keyword.KeywordSearchMOST = savedPost.KeywordSearchMOST;
        keyword.KeywordSearchMOPS = savedPost.KeywordSearchMOPS;
        keyword.KeywordSearchGOOGLE = savedPost.KeywordSearchGOOGLE;
        keyword.KeywordMOEA = savedPost.KeywordMOEA;
        keyword.KeywordMOEAIC = savedPost.KeywordMOEAIC;
        keyword.KeywordMOST = savedPost.KeywordMOST;
        keyword.KeywordGOOGLE = savedPost.KeywordGOOGLE;
        keyword.KeywordValid = savedPost.KeywordValid;

        await crawlerRoutes.schedule_crawler(keyword);

        res.json(savedPost);
    } catch (err) {
        res.json({ message: err });
    }
});

//SPRCIFIC POST
router.get('/:postId', async (req, res) => {
    try {
        //console.log("get: " + req.params.postId);
        const post = await Keyword.findById(req.params.postId);
        res.json(post);
    } catch (err) {
        res.json({ message: err });
    }
});

//DELETE POST
router.delete('/:postId', async (req, res) => {
    try {
        //console.log("delete: " + req.params.postId);
        const removePost = await Keyword.find({ _id: req.params.postId }).deleteOne();

        await SearchMOEAICRecord.find({ Record_id: req.params.postId }).deleteOne();
        await SearchMOEARecord.find({ Record_id: req.params.postId }).deleteOne();
        await SearchMOPSRecord.find({ Record_id: req.params.postId }).deleteOne();
        await SearchMOSTRecord.find({ Record_id: req.params.postId }).deleteOne();

        crawlerRoutes.schedule_cancel(req.params.postId);

        res.json(removePost);
    } catch (err) {
        res.json({ message: err });
    }
});

//Update a post
router.patch('/:postId', async (req, res) => {
    try {
        //console.log("update: " + req.params.postId);
        const findPost = await Keyword.findOne({ _id: req.params.postId });
        // console.log(findPost);
        // console.log(findPost.KeywordMOEA != req.body.KeywordMOEA);
        // console.log(findPost.KeywordMOEAIC != req.body.KeywordMOEAIC);
        // console.log(findPost.KeywordMOST != req.body.KeywordMOST);
        if (findPost.KeywordMOEA != req.body.KeywordMOEA) await SearchMOEARecord.find({ Record_id: req.params.postId }).deleteOne();
        if (findPost.KeywordMOEAIC != req.body.KeywordMOEAIC) await SearchMOEAICRecord.find({ Record_id: req.params.postId }).deleteOne();
        if (findPost.KeywordMOST != req.body.KeywordMOST) await SearchMOSTRecord.find({ Record_id: req.params.postId }).deleteOne();

        const updatePost = await Keyword.updateOne(
            { _id: req.params.postId },
            {
                $set: {
                    KeywordEmail: req.body.KeywordEmail,
                    KeywordStartSunday: req.body.KeywordStartSunday,
                    KeywordStartMonday: req.body.KeywordStartMonday,
                    KeywordStartTuesday: req.body.KeywordStartTuesday,
                    KeywordStartWednesday: req.body.KeywordStartWednesday,
                    KeywordStartThursday: req.body.KeywordStartThursday,
                    KeywordStartFriday: req.body.KeywordStartFriday,
                    KeywordStartSaturday: req.body.KeywordStartSaturday,
                    KeywordTimeFrom: req.body.KeywordTimeFrom,
                    KeywordTimeTo: req.body.KeywordTimeTo,
                    KeywordTimes: req.body.KeywordTimes,
                    KeywordFrequency: req.body.KeywordFrequency,
                    KeywordQueryRecord: req.body.KeywordQueryRecord,

                    KeywordSearchMOEA: req.body.KeywordSearchMOEA,
                    KeywordSearchMOEAIC: req.body.KeywordSearchMOEAIC,
                    KeywordSearchMOST: req.body.KeywordSearchMOST,
                    KeywordSearchMOPS: req.body.KeywordSearchMOPS,
                    KeywordSearchGOOGLE: req.body.KeywordSearchGOOGLE,

                    KeywordMOEA: req.body.KeywordMOEA,
                    KeywordMOEAIC: req.body.KeywordMOEAIC,
                    KeywordMOST: req.body.KeywordMOST,
                    KeywordGOOGLE: req.body.KeywordGOOGLE,

                    KeywordValid: req.body.KeywordValid,
                }
            }
        );
        // console.log(updatePost);
        var keyword = [];
        keyword._id = req.params.postId;
        keyword.KeywordEmail = req.body.KeywordEmail;
        keyword.KeywordStartSunday = req.body.KeywordStartSunday;
        keyword.KeywordStartMonday = req.body.KeywordStartMonday;
        keyword.KeywordStartTuesday = req.body.KeywordStartTuesday;
        keyword.KeywordStartWednesday = req.body.KeywordStartWednesday;
        keyword.KeywordStartThursday = req.body.KeywordStartThursday;
        keyword.KeywordStartFriday = req.body.KeywordStartFriday;
        keyword.KeywordStartSaturday = req.body.KeywordStartSaturday;
        keyword.KeywordTimeFrom = req.body.KeywordTimeFrom;
        keyword.KeywordTimeTo = req.body.KeywordTimeTo;
        keyword.KeywordTimes = req.body.KeywordTimes;
        keyword.KeywordFrequency = req.body.KeywordFrequency;
        keyword.KeywordQueryRecord = req.body.KeywordQueryRecord;
        keyword.KeywordSearchMOEA = req.body.KeywordSearchMOEA;
        keyword.KeywordSearchMOEAIC = req.body.KeywordSearchMOEAIC;
        keyword.KeywordSearchMOST = req.body.KeywordSearchMOST;
        keyword.KeywordSearchMOPS = req.body.KeywordSearchMOPS;
        keyword.KeywordSearchGOOGLE = req.body.KeywordSearchGOOGLE;
        keyword.KeywordMOEA = req.body.KeywordMOEA;
        keyword.KeywordMOEAIC = req.body.KeywordMOEAIC;
        keyword.KeywordMOST = req.body.KeywordMOST;
        keyword.KeywordGOOGLE = req.body.KeywordGOOGLE;
        keyword.KeywordValid = req.body.KeywordValid;
        // console.log(keyword);
        // crawlerRoutes.schedule_cancel(keyword._id);
        await crawlerRoutes.schedule_crawler(keyword);

        req.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
});


module.exports = router;