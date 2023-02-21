const schedule = require('node-schedule');
const logger = require('./logger');
const html_to_pdf = require('html-pdf-node');
const path = require('path');

const crawler = require('./crawler');
const email = require('../mail/email');

const email_body = require('../mail/email_body');
// google蒐的上市櫃公司
const ListedCompany = require("../../models/ListedCompany");
// google蒐的未上市櫃公司
const NonListedCompany = require("../../models/NonListedCompany");
// google蒐的結果
const SearchGoogleRecord = require("../../models/SearchGoogleListedRecord");
const SearchGoogleListedRecord = require("../../models/SearchGoogleListedRecord");
const SearchGoogleNonListedRecord = require("../../models/SearchGoogleNonListedRecord");
const ListedGooglePage = require("../../models/ListedGooglePage");

const Record = require('./Record');

const Keyword = require('../../models/Keyword');

module.exports = {
    realtime_search: async function (InputKeyword, InputWebpage) {
        switch (parseInt(InputWebpage)) {
            case 0:
                var result = await module.exports.crawler_search(0, InputKeyword);
                return result;
            case 1:
                var result = await module.exports.crawler_search(1, InputKeyword);
                return result;
            case 2:
                var result = await module.exports.crawler_search(2, InputKeyword);
                return result;
            case 3:
                var result = await module.exports.crawler_search(3, InputKeyword);
                // return result;

                if (InputKeyword == "") return result;

                var keywordArr = InputKeyword.split(" ");
                var filter_result = [];

                for (var j = 0; j < result.length; j++) {
                    var find_filter = true;
                    for (var k = 0; k < keywordArr.length; k++) {
                        if ((result[j].text.indexOf(keywordArr[k]) == -1) && (result[j].detail.indexOf(keywordArr[k]) == -1)) {
                            find_filter = false;
                            break;
                        }
                    }
                    if (find_filter == true) filter_result.push(result[j]);
                }
                return filter_result;
            case 4:
                var result = await module.exports.crawler_search(4, InputKeyword);
                // return result;


                var listedgooglepage = await ListedGooglePage.find();
                var filter_result = [];

                for (var j = 0; j < result.length; j++) {
                    for (var k = 0; k < listedgooglepage.length; k++) {
                        if (result[j].href.indexOf(listedgooglepage[k].GooglePagesURL) != -1) {
                            filter_result.push(result[j]);
                            break;
                        }
                    }
                }
                return filter_result;
            default:
                console.log('\x1b[37m', `Sorry, we are out of ${InputWebpage}.`);
        }
    },
    crawler_search: async function (search, InputKeyword) {
        var funtion_search = [];
        funtion_search.push({ func: crawler.queryNews, arg: InputKeyword });
        funtion_search.push({ func: crawler.queryNews2, arg: InputKeyword });
        funtion_search.push({ func: crawler.queryNews3, arg: InputKeyword });
        funtion_search.push({ func: crawler.queryNews4, arg: InputKeyword });
        funtion_search.push({ func: crawler.queryNews5, arg: InputKeyword });
        var result = [];
        await Promise.race([crawler.setExecutedTime(), await funtion_search[search].func(funtion_search[search].arg)]).then(async function (val) {
            // console.log(val);
            if (val[1] == 1) { // chromeDriver版本問題
                let fileOption = [];
                fileOption = [
                    {
                        filename: 'chromeDriver版本更新.pdf', // <= Here: made sure file name match
                        path: path.join(__dirname, './file/chromeDriver版本更新.pdf'),
                        contentType: 'application/pdf'
                    },
                ];
                const keyword = await Keyword.find();
                console.log("keyword lengh:", keyword.length);
                for (var i = 0; i < keyword.length; i++) {
                    for (var j = 0; j < keyword[i].KeywordEmail.length; j++) {
                        console.log("email length:", keyword[i].KeywordEmail.length);
                        await email.sendMail(keyword[i].KeywordEmail[j], "[系統通知] ChromeDriver版本需要更新"
                        , "<h3>ChromeDriver版本需要更新</h3><p>1.請查閱chrome瀏覽器->設定->關於chrome，確認當前版本。</p>"
                        +"<p>2.於<a href='https://chromedriver.chromium.org/downloads'>https://chromedriver.chromium.org/downloads</a>選擇相對應的ChromeDriver版本，下載chromedriver_win32.zip</p>"
                        +"<p>3.解壓縮後將chrome.exe置於專案資料夾根目錄即可。</p>", fileOption);
                    }
                }
                return result;
            }
            if (val[0] === false) {
                console.log('\x1b[31m執行時間超時\033[0m');
                console.log('重新執行\033[0m');
                await Promise.race([crawler.setExecutedTime(), await funtion_search[search].func(funtion_search[search].arg)]).then(async function (val) {
                    // console.log(val);
                    if (val[0] === false) {
                        console.log('\x1b[31m執行時間超時\033[0m');
                    } else {
                        result = val[1];
                    }
                    logger.jobs_crawler.pop();
                });
            } else {
                result = val[1];
            }
            logger.jobs_crawler.pop();
        });

        return result;
    },
    schedule_crawler: async function (Keyword) {
        // var ListedCompanyArr = await ListedCompany.find();
        // var NonListedCompanyArr = await NonListedCompany.find();
        var SearchGoogleListedOutput = [];
        var SearchGoogleNonListedOutput = [];

        // 檢查排程是否存在
        module.exports.schedule_cancel(Keyword._id);
        try {
            if (Keyword.KeywordValid != undefined) {
                if (Keyword.KeywordValid.toString() === 'true') {
                    console.log('Keyword.KeywordValid');
                    // for (var i = 0; i < Keyword.KeywordEmail.length; i++) {
                    // Keyword.KeywordEmail[i];
                    var freq = Keyword.KeywordFrequency.split(':');
                    // googleJob = schedule.scheduleJob('0 ' + freq[1] + ' ' + (parseInt(freq[0])-2).toString() + ' * * *', async function () {
                    //     var googleInfo = [];
                    //     googleInfo.length = 2;
                    //     googleInfo[0] = (Keyword.KeywordSearchGOOGLE.toString() == 'true') ? await crawler.queryCompanyNews5(ListedCompanyArr) : false;
                    //     googleInfo[1] = (Keyword.KeywordSearchGOOGLE.toString() == 'true') ? await crawler.queryCompanyNews5(NonListedCompanyArr) : false;

                    //     //將GOOGLE爬到的內容轉成html
                    //     var Record_Listed_Context = '';
                    //     var Record_NonListed_Context = '';
                    //     var RecordArr = [];
                    //     Record_Listed_Context = await email_body.info(5,googleInfo[0]);
                    //     Record_NonListed_Context = await email_body.info(6,googleInfo[1]);
                    //     RecordArr.push(Record_Listed_Context);
                    //     RecordArr.push(Record_NonListed_Context);

                    //     //將GOOGLE->html 紀錄到資料庫
                    //     Record.record(Keyword._id, 5, RecordArr);
                    // }.bind(null,Keyword));

                    //    job = schedule.scheduleJob('0 41 14 * * *', async function () {
                    var times = ((Keyword.KeywordTimes == undefined) ? 1 : Keyword.KeywordTimes);
                    var timesperday = ((times == 48) || (times == 144)) ? 24 : times;
                    var timesperhour = ((times == 48) || (times == 144)) ? times / 24 : 1;
                    // console.log(Keyword._id);
                    var keywordalljobs = [];
                    for (var i = 0; i < timesperday; i++) {
                        for (var j = 0; j < timesperhour; j++) {
                            var freq_hour = (parseInt(freq[0]) + (24 / timesperday * i)) % 24;
                            var freq_min = (parseInt(freq[1]) + (60 / timesperhour * j)) % 60;
                            var run_schedule = true;
                            var today = new Date();
                            var day = today.getDay();

                            // console.log(freq_hour.toString() + ':' + freq_min.toString());
                            switch (day) {
                                case 0:
                                    if (Keyword.KeywordStartSunday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 1:
                                    if (Keyword.KeywordStartMonday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 2:
                                    if (Keyword.KeywordStartTuesday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 3:
                                    if (Keyword.KeywordStartWednesday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 4:
                                    if (Keyword.KeywordStartThursday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 5:
                                    if (Keyword.KeywordStartFriday.toString() !== 'true') run_schedule = false;
                                    break;
                                case 6:
                                    if (Keyword.KeywordStartSaturday.toString() !== 'true') run_schedule = false;
                                    break;
                                default:
                                    run_schedule = false;
                                    break;
                            }
                            // console.log('run_schedule', run_schedule);

                            var start_hour = parseInt(Keyword.KeywordTimeFrom.split(':')[0]);
                            var start_min = parseInt(Keyword.KeywordTimeFrom.split(':')[1]);
                            var to_hour = parseInt(Keyword.KeywordTimeTo.split(':')[0]);
                            var to_min = parseInt(Keyword.KeywordTimeTo.split(':')[1]);
                            // console.log('start', start_hour + ":" + start_min);
                            // console.log('to', to_hour + ":" + to_min);
                            if ((parseInt(freq_hour) < start_hour) || (parseInt(freq_hour) > to_hour)) {
                                run_schedule = false;
                                // console.log('1')
                            }
                            if ((parseInt(freq_hour) == start_hour) && (parseInt(freq_min) < start_min)) {
                                run_schedule = false;
                                // console.log('2')
                            }
                            if ((parseInt(freq_hour) == to_hour) && (parseInt(freq_min) > to_min)) {
                                run_schedule = false;
                                // console.log('3')
                            }

                            // console.log('run_schedule', run_schedule);
                            var date = (' ' + today.getFullYear());
                            date += ('/' + String(today.getMonth() + 1).padStart(2, '0'));
                            date += ('/' + String(today.getDate()).padStart(2, '0'));

                            if (run_schedule) {
                                job = schedule.scheduleJob('0 ' + freq_min.toString() + ' ' + freq_hour.toString() + ' * * *', async function () {

                                    var info = [];
                                    info.length = 5;

                                    var emailtitle_info = [];
                                    emailtitle_info.length = 5;

                                    // console.log(Keyword);
                                    // console.log(Keyword.KeywordSearchMOPS.toString() == 'true');
                                    if (Keyword.KeywordSearchMOEA.toString() == 'true') {
                                        emailtitle_info[0] = ("經濟部本部新聞（關鍵字：" + Keyword.KeywordMOEA + "）");
                                        var result = await module.exports.crawler_search(0, Keyword.KeywordMOEA);
                                        info[0] = result;
                                    } else {
                                        info[0] = false;
                                    }

                                    if (Keyword.KeywordSearchMOEAIC.toString() == 'true') {
                                        emailtitle_info[1] = ("投審會最新公告（關鍵字：" + Keyword.KeywordMOEAIC + "）");
                                        var result = await module.exports.crawler_search(1, Keyword.KeywordMOEAIC);
                                        info[1] = result;
                                    } else {
                                        info[1] = false;
                                    }

                                    if (Keyword.KeywordSearchMOST.toString() == 'true') {
                                        emailtitle_info[2] = ("科技部新聞資料（關鍵字：" + Keyword.KeywordMOST + "）");
                                        var result = await module.exports.crawler_search(2, Keyword.KeywordMOST);
                                        info[2] = result;
                                    } else {
                                        info[2] = false;
                                    }

                                    if (Keyword.KeywordSearchMOPS.toString() == 'true') {
                                        emailtitle_info[3] = ("公開資訊觀測站即時重大訊息");
                                        var result = await module.exports.crawler_search(3, "");
                                        info[3] = result;
                                    } else {
                                        info[3] = false;
                                    }

                                    emailtitle_info[4] = ("Google搜尋引擎查詢");
                                    info[4] = false;

                                    // info[0] = (Keyword.KeywordSearchMOEA.toString() == 'true') ? await crawler.queryNews(Keyword.KeywordMOEA) : false;
                                    // info[1] = (Keyword.KeywordSearchMOEAIC.toString() == 'true') ? await crawler.queryNews2(Keyword.KeywordMOEAIC) : false;
                                    // info[2] = (Keyword.KeywordSearchMOST.toString() == 'true') ? await crawler.queryNews3(Keyword.KeywordMOST) : false;
                                    // info[3] = (Keyword.KeywordSearchMOPS.toString() == 'true') ? await crawler.queryNews4('') : false;
                                    // info[4] = false; // google即時的部分
                                    // // info[5] = (Keyword.KeywordSearchGOOGLE.toString() == 'true') ? await crawler.queryCompanyNews5(ListedCompanyArr) : false;
                                    // // info[6] = (Keyword.KeywordSearchGOOGLE.toString() == 'true') ? await crawler.queryCompanyNews5(NonListedCompanyArr) : false;

                                    let fileOption = [];
                                    let googleHtmlListed = '';
                                    let googleHtmlNonListed = '';
                                    if (Keyword.KeywordSearchGOOGLE.toString() == 'true') {
                                        var listedcompany = await ListedCompany.find();
                                        var nonlistedcompany = await NonListedCompany.find();

                                        var listedgooglepage = await ListedGooglePage.find();

                                        SearchGoogleListedOutput = await SearchGoogleListedRecord.find();
                                        SearchGoogleNonListedOutput = await SearchGoogleNonListedRecord.find();
                                        //從資料庫拿取html結果 

                                        for (var i = 0; i < listedcompany.length; i++) {
                                            const findcomp = (element) => element.Record_CompanyName == listedcompany[i].CompanyAbbreviation;;
                                            var find = SearchGoogleListedOutput.findIndex(findcomp);
                                            if (find != -1) {
                                                var Record_Listed_Context = [];
                                                for (var j = 0; j < SearchGoogleListedOutput[find].Record_Listed_Context.length; j++) {
                                                    for (var k = 0; k < listedgooglepage.length; k++) {
                                                        if (SearchGoogleListedOutput[find].Record_Listed_Context[j].href.indexOf(listedgooglepage[k].GooglePagesURL) != -1) {
                                                            Record_Listed_Context.push(SearchGoogleListedOutput[find].Record_Listed_Context[j]);
                                                            break;
                                                        }
                                                    }
                                                }
                                                // googleHtmlListed += await email_body.companyInfo(SearchGoogleListedOutput[find].Record_CompanyName, Record_Listed_Context);
                                                if (Record_Listed_Context.length != 0) googleHtmlListed += await email_body.Info_Google(SearchGoogleListedOutput[find].Record_CompanyName, Record_Listed_Context);
                                                // googleHtmlListed += await email_body.companyInfo(listedgooglepage, SearchGoogleListedOutput[find].Record_CompanyName, SearchGoogleListedOutput[find].Record_Listed_Context);
                                            }
                                        }

                                        for (var i = 0; i < nonlistedcompany.length; i++) {
                                            const findcomp = (element) => element.Record_CompanyName == nonlistedcompany[i].CompanyAbbreviation;
                                            var find = SearchGoogleNonListedOutput.findIndex(findcomp);
                                            if (find != -1) {
                                                var Record_Listed_Context = [];
                                                for (var j = 0; j < SearchGoogleNonListedOutput[find].Record_NonListed_Context.length; j++) {
                                                    for (var k = 0; k < listedgooglepage.length; k++) {
                                                        if (SearchGoogleNonListedOutput[find].Record_NonListed_Context[j].href.indexOf(listedgooglepage[k].GooglePagesURL) != -1) {
                                                            Record_Listed_Context.push(SearchGoogleNonListedOutput[find].Record_NonListed_Context[j]);
                                                            break;
                                                        }
                                                    }
                                                }
                                                // googleHtmlNonListed += await email_body.companyInfo(SearchGoogleNonListedOutput[find].Record_CompanyName, Record_Listed_Context);
                                                if (Record_Listed_Context.length != 0) googleHtmlNonListed += await email_body.Info_Google(SearchGoogleNonListedOutput[find].Record_CompanyName, Record_Listed_Context);
                                            }
                                        }

                                        // for (var i = 0; i < SearchGoogleListedOutput.length; i++) {
                                        //     googleHtmlListed += await email_body.companyInfo(SearchGoogleListedOutput[i].Record_CompanyName, SearchGoogleListedOutput[i].Record_Listed_Context);
                                        // }
                                        // for (var i = 0; i < SearchGoogleNonListedOutput.length; i++) {
                                        //     googleHtmlListed += await email_body.companyInfo(SearchGoogleNonListedOutput[i].Record_CompanyName, SearchGoogleNonListedOutput[i].Record_Listed_Context);
                                        // }

                                        // //google-html to pdf
                                        // let options = { format: 'A4', path: '' };
                                        // // console.log("googleHtml:",googleHtml);
                                        // let file = [];
                                        // file.length = 2;
                                        // file[0] = { content: '<h1>Google 上市櫃</h1>' + googleHtmlListed };
                                        // file[1] = { content: '<h1>Google 未上市櫃</h1>' + googleHtmlNonListed };
                                        // // console.log("file:",file);

                                        // for (var i = 0; i < file.length; i++) {
                                        //     options.path = path.join(__dirname, './output/google' + i + '.pdf');
                                        //     await html_to_pdf.generatePdf(file[i], options).then(pdfBuffer => {
                                        //         console.log("PDF Buffer:-", pdfBuffer);
                                        //     });
                                        // }

                                        // fileOption = [
                                        //     {
                                        //         filename: 'google0.pdf', // <= Here: made sure file name match
                                        //         path: path.join(__dirname, './output/google0.pdf'), // <= Here
                                        //         contentType: 'application/pdf'
                                        //     },
                                        //     {
                                        //         filename: 'google1.pdf', // <= Here: made sure file name match
                                        //         path: path.join(__dirname, './output/google1.pdf'), // <= Here
                                        //         contentType: 'application/pdf'
                                        //     },
                                        // ];
                                    }


                                    //最新消息比對
                                    info[0] = (Keyword.KeywordSearchMOEA.toString() == 'true') ? await Record.compare(Keyword._id, 0, info[0]) : false;
                                    info[1] = (Keyword.KeywordSearchMOEAIC.toString() == 'true') ? await Record.compare(Keyword._id, 1, info[1]) : false;
                                    info[2] = (Keyword.KeywordSearchMOST.toString() == 'true') ? await Record.compare(Keyword._id, 2, info[2]) : false;
                                    info[3] = (Keyword.KeywordSearchMOPS.toString() == 'true') ? await Record.compare(Keyword._id, 3, info[3]) : false;
                                    // (Keyword.KeywordSearchMOEA.toString() == 'true') ? await Record.compare(Keyword._id, 0, info[0]) : false;
                                    // (Keyword.KeywordSearchMOEAIC.toString() == 'true') ? await Record.compare(Keyword._id, 1, info[1]) : false;
                                    // (Keyword.KeywordSearchMOST.toString() == 'true') ? await Record.compare(Keyword._id, 2, info[2]) : false;

                                    var email_info = await email_body.allinfo(emailtitle_info, info);
                                    email_info[1] += ('<h2>Google 上市櫃</h2>' + googleHtmlListed);
                                    email_info[1] += ('<h2>Google 未上市櫃</h2>' + googleHtmlNonListed);;
                                    for (var i = 0; i < Keyword.KeywordEmail.length; i++) {
                                        console.log("email length:", Keyword.KeywordEmail.length);
                                        await email.sendMail(Keyword.KeywordEmail[i], email_info[0] + date, email_info[1], fileOption);
                                    }

                                }.bind(null, Keyword));
                                // }
                                keywordalljobs.push([job, freq_hour.toString() + ':' + freq_min.toString()]);
                            }
                        }
                    }
                    logger.jobs.push([Keyword._id.toString(), keywordalljobs]);


                }
            }
            // console.log(logger.jobs);
        } catch (err) {
            console.log(err);
        }

        /* 
            for quick test
        */
        // console.log('Quick test:' + new Date());
        // info[0] = await crawler.queryNews(InputKeyword);
        // info[1] = await crawler.queryNews2(InputKeyword);
        // info[2] = await crawler.queryNews3(InputKeyword);
        // info[3] = await crawler.queryNews4(InputKeyword);
        // info[4] = await crawler.queryNews5(InputKeyword);
        // var email_body_info = await email_body.allinfo(info);
        // email.sendMail("xxx@gmail.com","ICRT Mail Test",email_body_info);


        // job1
        // try {
        //     job = schedule.scheduleJob('0 * * * * *', async function () { // if it needs to cancel the job => job.cancel();
        //         console.log('scheduleCronstyle1:' + new Date());
        //         info[0] = await crawler.queryNews(InputKeyword);
        //         info[1] = await crawler.queryNews2(InputKeyword);
        //         info[2] = await crawler.queryNews3(InputKeyword);
        //         info[3] = await crawler.queryNews4(InputKeyword);
        //         info[4] = await crawler.queryNews5(InputKeyword);
        //         var email_body_info = await email_body.allinfo(info);
        //         email.sendMail("xxx@gmail.com","ICRT Mail Test",email_body_info);
        //     });
        // } catch (err) {
        //     console.log(err);
        // }

        //Job2
        // try {
        //     schedule.scheduleJob('50 * * * * *', async function () {
        //         console.log('scheduleCronstyle2:' + new Date());
        //         info[0] = await crawler.queryNews(InputKeyword);
        //         // info[1] = await crawler.queryNews2(InputKeyword);
        //         // info[2] = await crawler.queryNews3(InputKeyword);
        //         // info[3] = await crawler.queryNews4(InputKeyword);
        //         // info[4] = await crawler.queryNews5(InputKeyword);
        //         // var email_body_info = await email_body.allinfo(info);
        //         // email.sendMail("xxx@gmail.com","ICRT Mail Test",email_body_info);
        //     });
        // } catch (err) {
        //     console.log(err);
        // }
    },
    schedule_cancel: function (Keyword_id) {
        // console.log(logger.jobs);
        // console.log('schedule_cancel', Keyword_id);
        for (var i = 0; i < logger.jobs.length; i++) {
            // console.log(logger.jobs[i][0]);
            // console.log(Keyword_id);
            // console.log(logger.jobs[i][0] == Keyword_id);
            if (logger.jobs[i][0] == Keyword_id) {
                for (var j = 0; j < logger.jobs[i][1].length; j++) {
                    logger.jobs[i][1][j][0].cancel();
                }
                logger.jobs.splice(i, 1);
                // console.log(logger.jobs);
                break;
            }
        }
        return;
        // console.log(logger.jobs);
        // console.log(logger.jobs);
    }
}