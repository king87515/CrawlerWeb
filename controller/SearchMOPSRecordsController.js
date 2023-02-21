const express = require('express');
const router = express.Router();
const SearchMOPSRecord = require('../models/SearchMOPSRecord');

//ROUTES
router.get('/', async (req, res) => {
    try {
        const posts = await SearchMOPSRecord.find();
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const post = new SearchMOPSRecord({
        /*
        Record_id
        Record_Context
        */
        Record_id: req.body.Record_id,
        Record_Context: req.body.Record_Context,
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
        const post = await SearchMOPSRecord.findById(req.params.postId);
        res.json(post);
    } catch (err) {
        res.json({ message: err });
    }
});

//DELETE POST
router.delete('/:postId', async (req, res) => {
    try {
        //console.log("delete: " + req.params.postId);
        const removePost = await SearchMOPSRecord.find({ _id: req.params.postId }).deleteOne();

        res.json(removePost);
    } catch (err) {
        res.json({ message: err });
    }
});

//Update a post
router.patch('/:postId', async (req, res) => {
    try {
        //console.log("update: " + req.params.postId);
        const updatePost = await SearchMOPSRecord.updateOne(
            { _id: req.params.postId },
            {
                $set: {
                    Record_id: req.body.Record_id,
                    Record_Context: req.body.Record_Context,
                }
            }
        );

        req.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
});


module.exports = router;