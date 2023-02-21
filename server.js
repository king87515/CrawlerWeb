const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
// const fs = require("fs");
const http = require("http");
// const https = require("https");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const ScheduleSetting = require('./views_script/crawler/ScheduleSetting');
const crawler = require('./views_script/crawler/crawlerGoogle');
// const proxy = require('proxy-list-random'); //目前沒使用 //npm uninstall proxy-list-random

// google蒐的上市櫃公司
const ListedCompany = require("./models/ListedCompany");
// google蒐的未上市櫃公司
const NonListedCompany = require("./models/NonListedCompany");
// google蒐的結果
const SearchGoogleRecord = require("./models/SearchGoogleListedRecord");

const Record = require('./views_script/crawler/Record');

const KeywordRecords = require('./models/KeywordRecord');

const Keyword = require('./models/Keyword');
const schedule = require('node-schedule');
const logger = require('./views_script/crawler/logger');
// const csv_parser = require('./views_script/csv_parser/csv_parser');


// // RESTART APP START
// const { exec } = require('child_process');
// const CronJob = require('cron').CronJob;
// // npm install pm2@latest -g
// const restartCommand = "pm2 start server.js";
// const listCommand = "pm2 list";
// const deleteCommand = "pm2 delete all";
// // RESTART APP END


require('dotenv/config');
//Initialization
const app = express();

process.on('uncaughtException', function (err) {
    console.log('\x1B[1;31m', '--------------------------------------------------------------', '\033[0m');
    console.log('\x1B[1;31m', '             IN UNCAUGHTEXCEPTION', '\033[0m');
    console.log('\x1B[1;31m', '--------------------------------------------------------------', '\033[0m');
    console.log('\x1B[1;37m', err, '\033[0m');
    console.log('\x1B[1;31m', '--------------------------------------------------------------', '\033[0m');
});

// var privateKey = fs.readFileSync(path.resolve(__dirname + '/.well-known/acme-challenge/private.key'));
// var certificate = fs.readFileSync(path.resolve(__dirname + '/.well-known/acme-challenge/certificate.crt'));
// var ca_bundle = fs.readFileSync(path.resolve(__dirname + '/.well-known/acme-challenge/ca_bundle.crt'));

// var credentials = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca_bundle
// };

//setting
app.set('port', process.env.PORT);
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/db', require('./routes/RoutesController'));
// static files
app.use('/assets', express.static(__dirname + '/assets'));

app.use('/js', express.static(__dirname + '/views_script'));
// app.use('/.well-known', express.static(__dirname + '/.well-known'));
// ejs routes
app.use('/', require('./routes/PageController'));


// const restartApp = function () {
//     exec(deleteCommand, (err, stdout, stderr) => {
//         // handle err if you like!
//         console.log('\x1b[33m', 'DELETE', '\033[0m');
//         console.log(`${stdout}`);
//     });

//     exec(restartCommand, (err, stdout, stderr) => {
//         if (!err && !stderr) {
//             console.log(new Date(), '\x1b[33m', `App restarted!!!`, '\033[0m');
//             listApps();
//         }
//         else if (err || stderr) {
//             console.log(new Date(), '\x1b[33m', `Error in executing ${restartCommand}`, '\033[0m', err || stderr);
//         }
//     });
// }

// function listApps() {
//     exec(listCommand, (err, stdout, stderr) => {
//         // handle err if you like!
//         console.log('\x1b[33m', 'PM LIST', '\033[0m');
//         console.log(`${stdout}`);
//     });
// }


// new CronJob('30 * 15 * * *', function () {
//     listApps();
//     console.log('\x1b[33m', 'RESTARTING', '\033[0m');
//     // restartApp();
// }, null, true);

// Connect to MongoDB
const db = process.env.DN_CONNECTION;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('\x1b[33m', '[MongoDB Connected] ' + db, '\033[0m');
    // crawlerRoutes.crawler(1,1); 

    // csv_parser.parser_setup();

    if (!crawler.checkDriver()) {//檢查Driver是否是設定，如果無法設定就結束程式
        return;
    }

    // 定時爬蟲設定
    ScheduleSetting.setup();
    ScheduleSetting.searchmopsrecord_setup();

    schedule.scheduleJob('0 0 0 * * *', async function () {
        ScheduleSetting.setup();
    });

    //google定時爬蟲

    // var googleInfo = [];
    // googleInfo.length = 2;
    // var qList = await crawler.queryCompanyNews5(ListedCompanyArr);
    // googleInfo[0] = qList[0];
    // var qNonList = await crawler.queryCompanyNews5(NonListedCompanyArr);
    // googleInfo[1] = qNonList[0];

    // //將GOOGLE爬到的內容轉成html
    // var Record_Listed_Context = '';
    // var Record_NonListed_Context = '';
    // var RecordArr = [];
    // Record_Listed_Context = await email_body.info(5, googleInfo[0]);
    // Record_NonListed_Context = await email_body.info(6, googleInfo[1]);
    // RecordArr.push(Record_Listed_Context);
    // RecordArr.push(Record_NonListed_Context);

    // //將GOOGLE->html 紀錄到資料庫
    // await Record.record('', 5, RecordArr);

    // console.log("GOOGLE CRAWLER COMPLETED! WAIT 10 minutes for driver!");
    // await qNonList[1].sleep(600000);
    // var start = new Date().getTime();

    // while (1) {

    //     await sleep();

    //     // var ListedCompanyArr = await ListedCompany.find();
    //     // var NonListedCompanyArr = await NonListedCompany.find();

    //     // await crawler.queryCompanyNews5(NonListedCompanyArr, 0);
    //     // await crawler.queryCompanyNews5(ListedCompanyArr, 1);
    // }

    // proxy().then(res => console.log(res)); //目前沒使用
}).catch(err => console.log(err));

function sleep() {

    return new Promise(async resolve => {

        // 取得上次未結束
        const start = await KeywordRecords.find();
        console.log('start', start[0]);
        // 上市開始
        var company = 1;
        // 第幾間公司
        var companynumber = 0;
        if (start.length != 0) {
            company = start[0].KeywordCompany;
            companynumber = start[0].KeywordCompanyName + 1;
        }

        // 開始
        var ListedCompanyArr = await ListedCompany.find();
        var NonListedCompanyArr = await NonListedCompany.find();
        console.log('company', company);
        if ((company == true) && (companynumber >= ListedCompanyArr.length)) {
            company = false;
            companynumber = 0;
        } else if ((company == false) && (companynumber >= NonListedCompanyArr.length)) {
            company = true;
            companynumber = 0;
        }

        console.log('company', company);
        var CompanyArr = (company == true) ? ListedCompanyArr : NonListedCompanyArr;
        var consoleStr = (company == true) ? '[上市櫃公司開始]' : '[未市櫃公司開始]';

        console.log('');
        console.log('\x1b[31m', consoleStr, '\033[0m');
        for (var i = companynumber; i < CompanyArr.length;) {
            console.log('');
            console.log("第i家公司:", i);

            i = await crawler.runGoogle(i, CompanyArr[i].CompanyAbbreviation, company);

            var currentTime = new Date();
            currentTime = (currentTime.getFullYear()
                + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
                + "/" + ('0' + currentTime.getDate()).slice(-2)
                + " " + ('0' + currentTime.getHours()).slice(-2)
                + ":" + ('0' + currentTime.getMinutes()).slice(-2)
                + ":" + ('0' + currentTime.getSeconds()).slice(-2));

            console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');

        }

        // console.log('');
        // console.log('\x1b[31m', '[上市櫃公司開始]', '\033[0m');
        // for (var i = companyname; i < ListedCompanyArr.length;) {
        //     console.log('');
        //     console.log("第i家公司:", i);

        //     await Promise.race([crawler.setExecutedTime(), crawler.queryCompanyNews5(ListedCompanyArr[i].CompanyAbbreviation, 1)]).then(async function (val) {
        //         // console.log(val);     
        //         if (val[0] == false) {
        //             console.log('\x1b[31m執行時間超時\033[0m');
        //             if (val[1] != null) {
        //                 await val[1].close();
        //                 console.log('logger.jobs_crawler', logger.jobs_crawler);
        //                 if (logger.jobs_crawler.length == 0) {
        //                     await val[1].quit();
        //                 }
        //             }
        //         }
        //         else {
        //             await val[1].sleep((Math.random() * 65000) + 60000);
        //             await val[1].close();
        //             console.log('logger.jobs_crawler', logger.jobs_crawler);
        //             if (logger.jobs_crawler.length == 0) {
        //                 await val[1].quit();
        //             }
        //             i++;

        //             await (await KeywordRecords.find())[0].deleteOne();
        //             const post = new KeywordRecords({
        //                 KeywordCompany: 0,
        //                 KeywordCompanyName: i,
        //             });
        //             const savedPost = await post.save();
        //         }

        //         var currentTime = new Date();
        //         currentTime = (currentTime.getFullYear()
        //             + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
        //             + "/" + ('0' + currentTime.getDate()).slice(-2)
        //             + " " + ('0' + currentTime.getHours()).slice(-2)
        //             + ":" + ('0' + currentTime.getMinutes()).slice(-2)
        //             + ":" + ('0' + currentTime.getSeconds()).slice(-2));

        //         console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');
        //     });
        // }
        // await (await KeywordRecords.find())[0].deleteOne();
        // const post = new KeywordRecords({
        //     KeywordCompany: 1,
        //     KeywordCompanyName: 0,
        // });
        // const savedPost = await post.save();

        // console.log('');
        // console.log('\x1b[31m', '[未市櫃公司開始]', '\033[0m');
        // for (var i = 0; i < NonListedCompanyArr.length;) {
        //     console.log('');
        //     console.log("第i家公司:", i);
        //     await Promise.race([crawler.setExecutedTime(), crawler.queryCompanyNews5(NonListedCompanyArr[i].CompanyAbbreviation, 0)]).then(async function (val) {
        //         // console.log(val);
        //         if (val[0] == false) {
        //             console.log('\x1b[31m執行時間超時\033[0m');
        //             if (val[1] != null) {
        //                 await val[1].close();
        //                 console.log('logger.jobs_crawler', logger.jobs_crawler);
        //                 if (logger.jobs_crawler.length == 0) {
        //                     await val[1].quit();
        //                 }
        //             }
        //         }
        //         else {
        //             await val[1].sleep((Math.random() * 65000) + 60000);
        //             await val[1].close();
        //             console.log('logger.jobs_crawler', logger.jobs_crawler);
        //             if (logger.jobs_crawler.length == 0) {
        //                 await val[1].quit();
        //             }
        //             i++;
        //         }

        //         var currentTime = new Date();
        //         currentTime = (currentTime.getFullYear()
        //             + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
        //             + "/" + ('0' + currentTime.getDate()).slice(-2)
        //             + " " + ('0' + currentTime.getHours()).slice(-2)
        //             + ":" + ('0' + currentTime.getMinutes()).slice(-2)
        //             + ":" + ('0' + currentTime.getSeconds()).slice(-2));

        //         console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');
        //     });
        // }
        // await (await KeywordRecords.find())[0].deleteOne();
        // const post = new KeywordRecords({
        //     KeywordCompany: 0,
        //     KeywordCompanyName: 0,
        // });
        // const savedPost = await post.save();

        resolve();
    });
}

app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app, function (req, res) {
    // http.createServer(function (req, res) {
    res.writeHead(200);
    // res.writeHead(200, { 'Location': 'http://' + req.headers['host'] + req.url });
    res.end();
}).listen(process.env.PORT, function () {
    console.log("------------------------------------------------");
    console.log("[SERVER] RUNNING WEB SEERVER IN " + app.get('port') + ' PORT at ' + new Date() + '...');
    console.log("------------------------------------------------");
});

const io = require('socket.io')(server);
io.on('connection', (socketServer) => {
  socketServer.on('npmStop', () => {
    process.exit(0);
  });
});




// https.createServer(credentials, app)
//     .listen(443, function () {
//         console.log('running web server in ' + app.get('port') + ' port...');
//     });
