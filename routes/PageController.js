const express = require('express');
const router = express.Router();

const crawlerRoutes = require('../views_script/crawler/crawlerRoutes');
const email = require('../views_script/mail/email');
const email_body = require('../views_script/mail/email_body');
// ---------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------

// Webpage
router.get('/', async (req, res) => {
    res.render('index');
});

// Index Page
// Index Page
router.get('/:pageId', async (req, res) => {
    if ((req.params.pageId == 'history') ||
        (req.params.pageId == 'history.ejs') ||
        (req.params.pageId == 'settings') ||
        (req.params.pageId == 'settings.ejs')) {
        res.render(req.params.pageId, { host: "http://" + req.get('host') });
    } else {
        res.render('index');
    }
});

// ---------------------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------------------
// Search
router.post('/realtime_search', async (req, res) => {
    // console.log('\x1b[37m', req.body.InputKeyword);
    // console.log('\x1b[37m', req.body.InputWebpage);
    const { InputKeyword, InputWebpage } = req.body;

    try {
        var returnPost = await crawlerRoutes.realtime_search(InputKeyword, InputWebpage);
        // console.log(returnPost);
        res.json(returnPost);
    } catch (err) {
        res.json({ message: err });
    }
});

// Send Email
router.post('/sendemail', async (req, res) => {
    // console.log('\x1b[37m', req.body.EmailTo);
    // console.log('\x1b[37m', req.body.EmailTitle);
    // console.log('\x1b[37m', req.body.EmailBody);
    const { InputWebpage, EmailTo, EmailTitle, EmailBody } = req.body;


    try {
        var return_email_body = "";
        return_email_body = await email_body.info(parseInt(InputWebpage), EmailBody);
        // console.log(return_email_body);
        await email.sendMail(EmailTo, EmailTitle, return_email_body);
    } catch (err) {
        res.json({ message: err });
    }
});

// var returnPost = await email_body.allinfo("c", "", "", "", "");
// console.log(returnPost);
// res.json(returnPost);

module.exports = router;