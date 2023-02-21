const express = require('express');
const router = express.Router();
const SearchGoogleListedRecord = require('../models/SearchGoogleListedRecord');

//ROUTES
router.get('/', async (req, res) => {
    try {
        const posts = await SearchGoogleListedRecord.find();
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const post = new SearchGoogleListedRecord({
        /*
        Record_Listed_Context 上市櫃
        */
        Searching_Time: Date.now(),
        Record_CompanyName: req.body.Record_CompanyName,
        Record_Listed_Context: req.body.Record_Listed_Context,
    });

    try {
        //console.log("save: " + post);
        const savedPost = await post.save();

        res.json(savedPost);
    } catch (err) {
        res.json({ message: err });
    }
});

//SPRCIFIC POST
router.get('/:postId', async (req, res) => {
    try {
        //console.log("get: " + req.params.postId);
        const post = await SearchGoogleListedRecord.findById(req.params.postId);
        res.json(post);
    } catch (err) {
        res.json({ message: err });
    }
});

//DELETE POST
router.delete('/:postId', async (req, res) => {
    try {
        //console.log("delete: " + req.params.postId);
        const removePost = await SearchGoogleListedRecord.find({ _id: req.params.postId }).deleteOne();

        res.json(removePost);
    } catch (err) {
        res.json({ message: err });
    }
});

//Update a post
router.patch('/:postId', async (req, res) => {
    try {
        //console.log("update: " + req.params.postId);
        const updatePost = await SearchGoogleListedRecord.updateOne(
            { _id: req.params.postId },
            {
                $set: {
                    Searching_Time: Date.now(),
                    Record_CompanyName: req.body.Record_CompanyName,
                    Record_Listed_Context: req.body.Record_Listed_Context,
                }
            }
        );

        req.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
});


module.exports = router;