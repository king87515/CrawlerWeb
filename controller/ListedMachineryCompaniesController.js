const express = require('express');
const router = express.Router();
const ListedMachineryCompany = require('../models/ListedMachineryCompany');


//ROUTES
router.get('/', async (req, res) => {
    try {
        const posts = await ListedMachineryCompany.find();
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const post = new ListedMachineryCompany({
        /*
        CompanyCode
        CompanyAbbreviation
        */
        CompanyCode: req.body.CompanyCode,
        CompanyAbbreviation: req.body.CompanyAbbreviation,
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
        const post = await ListedMachineryCompany.findById(req.params.postId);
        res.json(post);
    } catch (err) {
        res.json({ message: err });
    }
});

//DELETE POST
router.delete('/:postId', async (req, res) => {
    try {
        //console.log("delete: " + req.params.postId);
        const removePost = await ListedMachineryCompany.find({ _id: req.params.postId }).deleteOne();
        res.json(removePost);
    } catch (err) {
        res.json({ message: err });
    }
});

//Update a post
router.patch('/:postId', async (req, res) => {
    try {
        //console.log("update: " + req.params.postId);
        const updatePost = await ListedMachineryCompany.updateOne(
            { _id: req.params.postId },
            {
                $set: {
                    CompanyCode: req.body.CompanyCode,
                    CompanyAbbreviation: req.body.CompanyAbbreviation,
                }
            }
        );
        req.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
});


module.exports = router;