const cheerio = require('cheerio');
const request = require('request');
const webdriver = require('selenium-webdriver'), //加入虛擬網頁套件
    By = webdriver.By, //你想要透過什麼方式來抓取元件，通常使用xpath、css
    until = webdriver.until; //直到抓到元件才進入下一步(可設定等待時間)
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();
var downloadFolder = '../../';
options.addArguments('--headless'); //瀏覽器不提供頁面觀看，linux下如果系統是純文字介面不加這條會啓動失敗
options.addArguments('--log-level=3'); //這個option可以讓你跟headless時網頁端的console.log說掰掰

//下面參數能提升爬蟲穩定性    
options.addArguments('--disable-dev-shm-usage'); //使用共享內存RAM
options.addArguments('--disable-gpu'); //規避部分chrome gpu bug

options.addArguments('user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36"'); //user agent
// options.addArguments("--incognito"); //無痕模式

const path = require('path'); //用於處理文件路徑的小工具
const fs = require("fs"); //讀取檔案用
const { strict } = require('assert');

const ListedMachineryCompany = require("../../models/ListedMachineryCompany");
const ListedMachineryKeyword = require("../../models/ListedMachineryKeyword");
const debug = require("./debug");

const logger = require('./logger');
const Record = require('./Record');


// 經濟部本部新聞
const url = "https://www.moea.gov.tw/MNS/populace/news/News.aspx?kind=1&menu_id=40";
// 投審會最新公告
const url2 = "https://www.moeaic.gov.tw/chinese/news_newAn.jsp";
// 科技部新聞資料
const url3 = "https://www.most.gov.tw/folksonomy/list/9aa56881-8df0-4eb6-a5a7-32a2f72826ff?l=ch";
// 公開資訊觀測站
const url4 = "https://mops.twse.com.tw/mops/web/t05sr01_1";
// google
const url5 = "https://www.google.com/";

// selenium
module.exports = {
    checkIsCompany: async function (company) {
        // console.log("company: ", company);
        var arr = await ListedMachineryCompany.find();
        // console.log("ListedMachineryCompany: ", arr);
        // Object.assign({}, arr);
        // console.log("ListedMachineryCompanyfilter: ", arr.filter(e=>{e.CompanyAbbreviation===company}));//.filter(e=>e.CompanyAbbreviation===company)
        arr = arr.filter(e => e.CompanyAbbreviation === company);
        // console.log("arr.length",arr.length);
        if (arr.length > 0) return true;
        else return false;
    },
    checkIsKeywords: async function (text) {
        // console.log("company: ", text);
        var arr = await ListedMachineryKeyword.find();
        // console.log("ListedMachineryKeyword", arr);
        for (var i = 0; i < arr.length; i++) {
            if (text.includes(arr[i].MachineryKeyword)) return true;;
        }

    },
    checkDriver: function () {
        try {
            chrome.getDefaultService();//確認是否有預設        
        } catch {
            console.warn('找不到預設driver!');
            const file_path = '../../chromedriver.exe';//'../chromedriver.exe'記得調整成自己的路徑
            console.log(path.join(__dirname, file_path));//請確認印出來日誌中的位置是否與你路徑相同
            if (fs.existsSync(path.join(__dirname, file_path))) {//確認路徑下chromedriver.exe是否存在            
                const service = new chrome.ServiceBuilder(path.join(__dirname, file_path)).build();//設定driver路徑
                chrome.setDefaultService(service);
                console.log('設定driver路徑');
            } else {
                console.error('無法設定driver路徑');
                return false;
            }
        }
        return true;
    },
    setExecutedTime: function () {
        return new Promise((resolve) => {
            setTimeout(() => { resolve(false); }, 60000);
        });
    },
    // 經濟部本部新聞
    queryNews: async function (InputKeyword) {
        logger.jobs_crawler.push('search');
        var titleAry = [];
        var driver;
        var driverDetail;
        try {
            driver = new webdriver.Builder()
                .forBrowser("chrome")
                .withCapabilities(options)
                .build();//建立這個browser的類型 

            await driver.get(url).then(async e => {
                await driver.wait(async function () {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 3000);
            });;//在這裡要用await確保打開完網頁後才能繼續動作

            // 根據id定位 資訊
            // *[@id="holderContent_txtQ_Title"]
            // *[@id="holderContent_btnQuery"]
            await driver.wait(until.elementLocated(By.xpath('//*[@id="holderContent_txtQ_Title"]')), 3000)
                .then(async keyword => {
                    //填寫關鍵字
                    ConsoleTime();

                    // keyword.sendKeys("投資臺灣事務所今");//將使用者輸入關鍵字填入
                    await keyword.sendKeys(InputKeyword);

                    // 抓到登入按鈕然後點擊
                    const queryBtn = await driver.wait(until.elementLocated(By.xpath('//*[@id="holderContent_btnQuery"]')), 3000);
                    await queryBtn.click();

                    await driver.wait(async function () {
                        const readyState = await driver.executeScript('return document.readyState');
                        return readyState === 'complete';
                    }, 3000);

                    // outputResultTest(); //use cheerio
                    await driver.wait(until.elementLocated(By.xpath('//*[@id="holderContent_grdNews_lnkTitle_0"]')), 3000)
                        .then(async e => {
                            //確保頁面定位好 避免excption
                            console.log("定位完成:", '\x1b[33m' + "經濟部本部新聞", '\033[0m');

                            await driver.findElements(By.xpath('//*[@id="holderContent_grdNews"]/tbody/tr')).then(async e => {
                                console.log("len:", e.length);
                                var len = e.length;
                                for (var i = 0; i < len - 2; i++) {
                                    titleAry.push({
                                        //*[@id="holderContent_grdNews_lblBeginDate_MM_0"]
                                        // date: [
                                        //     await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_MM_'+i+'"]')).getText(),
                                        //     await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_DD_'+i+'"]')).getText(),
                                        //     await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_YY_'+i+'"]')).getText(),
                                        // ],
                                        // text: await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lnkTitle_'+i+'"]')).getText(),
                                        // href: await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lnkTitle_'+i+'"]')).getAttribute("href"),
                                        symbol: null,
                                        name: null,
                                        date: (await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_YY_' + i + '"]')).getText()
                                            + "/"
                                            + ('0' + (await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_MM_' + i + '"]')).getText()).split("月")[0]).substr(-2)
                                            + "/"
                                            + ('0' + (await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lblBeginDate_DD_' + i + '"]')).getText())).substr(-2)),
                                        time: null,
                                        text: await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lnkTitle_' + i + '"]')).getText(),
                                        detail: null,
                                        href: await driver.findElement(By.xpath('//*[@id="holderContent_grdNews_lnkTitle_' + i + '"]')).getAttribute("href"),
                                        file: null,
                                    });
                                }

                                // 建立這個browser的類型

                                driverDetail = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();
                                for (var i = 0; i < titleAry.length; i++) {
                                    await driverDetail.get(titleAry[i].href).then(async e => {
                                        await driverDetail.wait(async function () {
                                            const readyState = await driverDetail.executeScript('return document.readyState');
                                            return readyState === 'complete';
                                        }, 3000);
                                    });
                                    //*[@id="divPageDetail_Content"]/div[1]/div/div
                                    titleAry[i].detail = await driverDetail.findElement(By.xpath('//*[@id="divPageDetail_Content"]/div[1]/div/div')).getText();
                                }

                            });
                        });
                    //use selenium
                });
            await driver.close();
            await driverDetail.close();
            ConsoleTime();
        } catch (err) {
            let isNeedUpdate = 0;
            if (err.toString().includes("SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version")) {
                console.log("This version of ChromeDriver needs to update.");
                isNeedUpdate = 1;
            }
            console.log(err);
            return [false,isNeedUpdate];
        }

       return [true,titleAry];
    },

    // 投審會最新公告
    queryNews2: async function (InputKeyword) {
        logger.jobs_crawler.push('search');
        var titleAry = [];
        var driver;
        var driverDetail;
        try {
            driver = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
            await driver.get(url2).then(async e => {
                await driver.wait(async function () {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 3000);
            });//在這裡要用await確保打開完網頁後才能繼續動作

            // 根據id定位 資訊
            //*[@id="keyword"]
            //*[@id="search"]
            await driver.wait(until.elementLocated(By.xpath('//*[@id="keyword"]')), 3000)
                .then(async keyword => {
                    //填寫關鍵字 
                    ConsoleTime();

                    // keyword.sendKeys("經濟部投資審議委員會第");//將使用者輸入關鍵字填入
                    await keyword.sendKeys(InputKeyword);

                    //抓到登入按鈕然後點擊
                    const queryBtn = await driver.wait(until.elementLocated(By.xpath('//*[@id="search"]')), 3000);
                    await queryBtn.click();

                    await driver.wait(async function () {
                        const readyState = await driver.executeScript('return document.readyState');
                        return readyState === 'complete';
                    }, 3000);

                    await driver.wait(until.elementLocated(By.xpath('//*[@id="newsList"]/tbody/tr[1]/td[2]')), 3000); //確保頁面定位好 避免excption
                    console.log("定位完成:", '\x1b[33m' + "投審會最新公告", '\033[0m');

                    await driver.findElements(By.xpath('//*[@id="newsList"]/tbody/tr'))
                        .then(async e => {
                            console.log("len:", e.length);
                            var len = e.length;
                            for (var i = 0; i < len; i++) {
                                titleAry.push({
                                    //full xpath
                                    // /html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr[1]/td[2]
                                    // /html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr[1]/td[1]/a
                                    // /html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr[2]/td[1]/a
                                    // date: await driver.findElement(By.xpath('/html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr['+(i+1)+']/td[2]')).getText(),
                                    // text: await driver.findElement(By.xpath('/html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr['+(i+1)+']/td[1]/a')).getText(),
                                    // href: await driver.findElement(By.xpath('/html/body/div[4]/div/div/div[2]/div[3]/div[2]/div/table/tbody/tr['+(i+1)+']/td[1]/a')).getAttribute("href"),

                                    //xpath
                                    //*[@id="newsList"]/tbody/tr[1]/td[2]
                                    //*[@id="newsList"]/tbody/tr[1]/td[1]/a
                                    symbol: null,
                                    name: null,
                                    date: (await driver.findElement(By.xpath('//*[@id="newsList"]/tbody/tr[' + (i + 1) + ']/td[2]')).getText()),
                                    time: null,
                                    text: (await driver.findElement(By.xpath('//*[@id="newsList"]/tbody/tr[' + (i + 1) + ']/td[1]/a')).getText()),
                                    detail: null,
                                    href: (await driver.findElement(By.xpath('//*[@id="newsList"]/tbody/tr[' + (i + 1) + ']/td[1]/a')).getAttribute("href")),
                                    file: null,
                                });
                            }

                            driverDetail = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型

                            for (var i = 0; i < titleAry.length; i++) {
                                await driverDetail.get(titleAry[i].href).then(async e => {
                                    await driverDetail.wait(async function () {
                                        const readyState = await driverDetail.executeScript('return document.readyState');
                                        return readyState === 'complete';
                                    }, 3000);
                                });
                                //*[@id="con"]
                                titleAry[i].detail = await driverDetail.findElement(By.xpath('//*[@id="con"]')).getText();
                                // var checkHasFile = document.evaluate('//*[@id="rows"]/tr[4]/td/div[1]/a', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                                // if(checkHasFile.snapshotLength == 1)
                                //     titleAry[i].file = await driverDetail.findElement(By.xpath('//*[@id="rows"]/tr[4]/td/div[1]/a')).getAttribute("href");
                                try {
                                    titleAry[i].file = await driverDetail.findElement(By.xpath('//*[@id="rows"]/tr[4]/td/div[1]/a')).getAttribute("href");
                                } catch (err) {
                                    console.log("no file exist");
                                }
                            }
                        });
                });
            await driver.close();
            await driverDetail.close();
            ConsoleTime();
        } catch (err) {
            let isNeedUpdate = 0;
            if (err.toString().includes("SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version")) {
                console.log("This version of ChromeDriver needs to update.");
                isNeedUpdate = 1;
            }
            console.log(err);
            return [false,isNeedUpdate];
        }

       return [true,titleAry];
    },

    // 科技部新聞資料
    queryNews3: async function (InputKeyword) {
        logger.jobs_crawler.push('search');

        var titleAry = [];
        var driver;
        var driverDetail;

        try {
            driver = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();//建立這個browser的類型
            await driver.get(url3).then(async e => {
                await driver.wait(async function () {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 3000);
            }); //在這裡要用await確保打開完網頁後才能繼續動作

            // 根據id定位 資訊
            // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[1]/div/div/form/input[4]
            // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[1]/div/div/form/input[5]
            await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[1]/div/div/form/input[4]')), 3000)
                .then(async keyword => {
                    // 填寫關鍵字 
                    ConsoleTime();

                    // keyword.sendKeys("次園區審議會核准投資案");//將使用者輸入關鍵字填入
                    await keyword.sendKeys(InputKeyword);

                    //抓到登入按鈕然後點擊
                    const queryBtn = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[1]/div/div/form/input[5]')), 3000);
                    await queryBtn.click();

                    await driver.wait(async function () {
                        const readyState = await driver.executeScript('return document.readyState');
                        return readyState === 'complete';
                    }, 3000);

                    await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[1]/div/div[2]')), 3000); //確保頁面定位好 避免excption
                    console.log("定位完成:", '\x1b[33m' + "科技部新聞資料", '\033[0m');

                    await driver.findElements(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a'))
                        .then(async e => {
                            console.log("len:", e.length);
                            var len = e.length;
                            for (var i = 0; i < len; i++) {
                                titleAry.push({
                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[1]/div/div[2]
                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[2]/div/div[2]

                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[1]/h3
                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[2]/h3

                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[1]
                                    // /html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[2]
                                    symbol: null,
                                    name: null,
                                    date: (await driver.findElement(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[' + (i + 1) + ']/div/div[2]')).getText()).replace(/-/gi, "/"),
                                    time: null,
                                    text: (await driver.findElement(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[' + (i + 1) + ']/h3')).getText()),
                                    detail: null,
                                    href: (await driver.findElement(By.xpath('/html/body/div[3]/div/div[4]/div/div[2]/div[2]/div[3]/a[' + (i + 1) + ']')).getAttribute("href")),
                                    file: null,
                                });
                            }

                            driverDetail = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
                            for (var i = 0; i < titleAry.length; i++) {
                                await driverDetail.get(titleAry[i].href).then(async e => {
                                    await driverDetail.wait(async function () {
                                        const readyState = await driverDetail.executeScript('return document.readyState');
                                        return readyState === 'complete';
                                    }, 3000);
                                });
                                //*[@id="scroll_div"]
                                titleAry[i].detail = await driverDetail.findElement(By.xpath('//*[@id="scroll_div"]')).getText();
                            }
                        });
                });
            await driver.close();
            await driverDetail.close();
            ConsoleTime();
        } catch (err) {
            let isNeedUpdate = 0;
            if (err.toString().includes("SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version")) {
                console.log("This version of ChromeDriver needs to update.");
                isNeedUpdate = 1;
            }
            console.log(err);
            return [false,isNeedUpdate];
        }

       return [true,titleAry];
    },

    //公開資訊觀測站
    queryNews4: async function (InputKeyword) {
        logger.jobs_crawler.push('search');

        var titleAry = [];
        var driver;
        var driverPost;
        var driverDetail;
        // await driver.getSession().then(e=>console.log("driver new:",e));
        try {
            driver = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
            await driver.get(url4).then(async e => {
                await driver.wait(async function () {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 3000);
            });//在這裡要用await確保打開完網頁後才能繼續動作

            driver.wait(async function () {
                const readyState = await driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 3000);

            ConsoleTime();

            await driver.wait(until.elementLocated(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[2]/td[5]')), 3000); //確保頁面定位好 避免excption
            console.log("定位完成:", '\x1b[33m' + "公開資訊觀測站即時重大訊息", '\033[0m');
            // await driver.getSession().then(e=>console.log("outputResult4 driver:",e));

            driverPost = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
            await driver.findElements(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr'))
                .then(async e => {
                    console.log("len:", e.length);
                    var len = e.length;
                    for (var i = 2; i < (len + 1); i++) {//len+1
                        if (await module.exports.checkIsCompany(await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[2]')).getText())) {
                            if (await module.exports.checkIsKeywords(await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[5]')).getText())) {
                                // console.log("index: ",i);
                                //*[@id="table01"]/form[2]/table/tbody/tr[1]
                                //*[@id="table01"]/form[2]/table/tbody/tr[140]
                                var postInfo = "";
                                await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[6]/input'))
                                    .getAttribute("onclick")
                                    .then(async e => {

                                        // var postAry = [];
                                        // postAry.push(e);
                                        /*
                                            // encodeURIComponent=1
                                            // &TYPEK=all
                                            // &step=1
                                            &skey=6589202102233
                                            // &hhc_co_name=
                                            // &firstin=true
                                            &COMPANY_ID=6589
                                            // &COMPANY_NAME=
                                            &SPOKE_DATE=20210223
                                            &SPOKE_TIME=112737
                                            &SEQ_NO=3
                                            ---
                                            encodeURIComponent=1&TYPEK=all&step=1&hhc_co_name=&firstin=true&COMPANY_NAME=
                                        */
                                        postInfo = e.replace(/document.fm.|.value|t05sr01_1.|'/gi, "");
                                        postInfo = postInfo.replace(/openWindow.*/, "");
                                        postInfo = postInfo.replace(/;/gi, "&");
                                        postInfo = postInfo.concat("encodeURIComponent=1&TYPEK=all&step=1&hhc_co_name=&firstin=true&COMPANY_NAME=");
                                        await driverPost.get(url4 + "?" + postInfo).then(async e => {
                                            await driverPost.wait(async function () {
                                                const readyState = await driverPost.executeScript('return document.readyState');
                                                return readyState === 'complete';
                                            }, 3000);
                                        });//在這裡要用await確保打開完網頁後才能繼續動作
                                        // console.log("====url:",url4+"?"+postInfo);
                                    });

                                titleAry.push({
                                    //公司代號 symbol
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[1]
                                    //*[@id="table01"]/form[2]/table/tbody/tr[3]/td[1]
                                    //公司簡稱 name
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[2]
                                    //發言日期 date
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[3]
                                    //發言時間 time
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[4]
                                    //主旨 text
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[5]
                                    //詳細資料 detail
                                    //*[@id="table01"]/form[2]/table/tbody/tr[2]/td[6]/input
                                    symbol: await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[1]')).getText(),
                                    name: await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[2]')).getText(),
                                    date: await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[3]')).getText(),
                                    time: await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[4]')).getText(),
                                    text: await driver.findElement(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[' + i + ']/td[5]')).getText(),
                                    detail: null,
                                    href: url4 + "?" + postInfo,
                                    file: null,
                                });
                            }
                        }
                    }
                    // console.log("post array:", postAry);

                    driverDetail = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
                    console.log("match array: ", titleAry.length);
                    for (var i = 0; i < titleAry.length;) { // titleAry.length
                        // console.log("ｉ:" + i + "=>" + url4 + "?" + postInfo);

                        await driverDetail.get(titleAry[i].href)
                            .then(async e => {
                                await driverDetail.wait(async function () {
                                    const readyState = await driverDetail.executeScript('return document.readyState');
                                    return readyState === 'complete';
                                }, 3000);
                            });
                        //*[@id="table01"]/table[2]/tbody/tr[5]/td/pre
                        titleAry[i].detail = await driverDetail.findElement(By.xpath('//*[@id="table01"]/table[2]/tbody/tr[5]/td/pre')).getText();
                        await driverDetail.sleep(1000).then(e => { i++; });
                    }

                    //詳細資料
                    // const queryBtn = await driver.wait(until.elementLocated(By.xpath('//*[@id="table01"]/form[2]/table/tbody/tr[2]/td[6]/input')));
                    // await queryBtn.click();
                    // driver.getCurrentUrl().then(function(v){console.log("=====URL=====",v);});
                    await driver.getSession();　//.then(e => console.log("driver close:", e)); 
                    await driverDetail.close();
                });
            await driver.close();
            await driverPost.close();
            ConsoleTime();
        } catch (err) {
            let isNeedUpdate = 0;
            if (err.toString().includes("SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version")) {
                console.log("This version of ChromeDriver needs to update.");
                isNeedUpdate = 1;
            }
            console.log(err);
            return [false,isNeedUpdate];
        }

       return [true,titleAry];
    },

    //google
    queryNews5: async function (InputKeyword) {
        logger.jobs_crawler.push('search');

        var titleAry = [];
        var driver;

        try {
            driver = new webdriver.Builder()
                .forBrowser("chrome")
                .withCapabilities(options)
                .build();// 建立這個browser的類型

            // 在這裡要用await確保打開完網頁後才能繼續動作
            await driver.get(url5).then(async e => {
                await driver.wait(async function () {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 4000);
            });

            // 根據id定位 資訊
            await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input')), 4000)
                .then(async keyword => {
                    // 填寫關鍵字
                    ConsoleTime();

                    // Convert an ISO date to the date format yyyy-mm-dd
                    var afterDate = new Date();
                    var beforeDate = new Date();
                    afterDate = afterDate.getFullYear() + '-' + (afterDate.getMonth() + 1) + '-' + (afterDate.getDate() - 1);
                    beforeDate = beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();

                    InputKeyword = InputKeyword.split(' ');
                    let Input = '';
                    for (let i = 0; i < InputKeyword.length; i++) {
                        if (i != (InputKeyword.length - 1))
                            Input += ('"' + InputKeyword[i] + '"+');
                        else Input += ('"' + InputKeyword[i] + '"');
                    }
                    console.log('allintext: ' + Input + ' after:' + afterDate + ' before:' + beforeDate);
                    //將使用者輸入關鍵字填入 //"\n":i.e. enter key點擊 
                    await keyword.sendKeys('allintext: ' + Input + ' after:' + afterDate + ' before:' + beforeDate + '\n')
                        .then(async e => {
                            await driver.wait(async function () {
                                const readyState = await driver.executeScript('return document.readyState');
                                return readyState === 'complete';
                            }, 3000);

                            // console.log("type:",typeof module.exports.outputResult5(driver));
                            // console.log("object:",module.exports.outputResult5(driver));

                            await driver.wait(until.elementLocated(By.xpath('//*[@id="rcnt"]')), 3000)
                                .then(async e => {
                                    console.log("定位完成", '\x1b[33m' + "Google搜尋引擎查詢", '\033[0m');

                                    await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]'))
                                        .then(async e => {
                                            console.log("divLen:", e.length);
                                            var divLen = e.length;
                                            if (divLen === 0) {
                                                // ckeck data again
                                                await driver.getCurrentUrl().then(async e => {
                                                    await driver.get(e).then(async e => {
                                                        await driver.wait(async function () {
                                                            const readyState = await driver.executeScript('return document.readyState');
                                                            return readyState === 'complete';
                                                        }, 3000);
                                                    });
                                                    await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]'))
                                                        .then(async e => {
                                                            console.log("divLen2:", e.length);
                                                            divLen = e.length;
                                                        });
                                                });
                                            }

                                            for (var dl = 0; dl < divLen; dl++) {
                                                console.log("dl:", dl);
                                                await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div'))
                                                    .then(async e => {
                                                        console.log("len:", e.length);
                                                        var len = e.length;
                                                        for (var i = 0; i < len; i++) {
                                                            await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span'))
                                                                .then(async e => {
                                                                    console.log(i + "=>spanLen: " + e.length);
                                                                    // await driver.getCurrentUrl().then(e=>{ console.log("URL:",e);});
                                                                    var spanLen = e.length;

                                                                    /* debug */
                                                                    if (spanLen === 0) {
                                                                        await driver.getCurrentUrl().then(async e => {
                                                                            //driver = await debug.debuging(e);
                                                                            await driver.get(e).then(async e => {
                                                                                await driver.wait(async function () {
                                                                                    const readyState = await driver.executeScript('return document.readyState');
                                                                                    return readyState === 'complete';
                                                                                }, 3000);
                                                                            });
                                                                            await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span'))
                                                                                .then(async e => {
                                                                                    console.log(i + "=>spanLen2:", e.length);
                                                                                    spanLen = e.length;
                                                                                });
                                                                        });
                                                                    }
                                                                    /* debug End */

                                                                    titleAry.push({
                                                                        //標題 
                                                                        //*[@id="rso"]/div/div[1]/div/div[1]/a/h3/span
                                                                        //*[@id="rso"]/div/div[2]/div/div[1]/a/h3/span
                                                                        //*[@id="rso"]/div/div[3]/div/div[1]/a/h3/span
                                                                        //連結
                                                                        //*[@id="rso"]/div/div[1]/div/div[1]/a
                                                                        //*[@id="rso"]/div/div[2]/div/div[1]/a
                                                                        //*[@id="rso"]/div/div[3]/div/div[1]/a
                                                                        //日期
                                                                        //*[@id="rso"]/div/div[1]/div/div[2]/div/span/span[1]
                                                                        //*[@id="rso"]/div/div[2]/div/div[2]/div/span/span[1]
                                                                        //*[@id="rso"]/div/div[3]/div/div[2]/div/span/span[1]
                                                                        symbol: null,
                                                                        name: null,
                                                                        date: (await checkHasDate(driver, i + 1, spanLen, 1, dl + 1)).toString(),
                                                                        time: null,
                                                                        text: (await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[1]/a/h3')).getText()),
                                                                        detail: (await checkHasDate(driver, i + 1, spanLen, 2, dl + 1)).toString(),
                                                                        href: (await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[1]/a')).getAttribute("href")),
                                                                        file: null,
                                                                    });
                                                                    // console.log("date type:",typeof titleAry[i].date);
                                                                    // console.log("date:",titleAry[i].date);

                                                                });
                                                        }
                                                    });

                                            }
                                        });
                                });
                        });
                });
            await driver.close();
            ConsoleTime();
        } catch (err) {
            let isNeedUpdate = 0;
            if (err.toString().includes("SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version")) {
                console.log("This version of ChromeDriver needs to update.");
                isNeedUpdate = 1;
            }
            console.log(err);
            return [false,isNeedUpdate];
        }

       return [true,titleAry];
    },
    // //google ListedCompany/NonListedCompany
    // queryCompanyNews5: async function (InputKeywordArr, isListed) {
    //     let InputKeyword = '';
    //     let info = [];
    //     let tmp = [];
    //     let driver;
    //     //for (var i = 0; i < InputKeywordArr.length; i++) { //InputKeywordArr.length
    //     for (var i = 0; i < InputKeywordArr.length; i++) { //InputKeywordArr.length
    //         InputKeyword = InputKeywordArr[i].CompanyAbbreviation;
    //         driver = await new webdriver.Builder().forBrowser("chrome").withCapabilities(options).build();// 建立這個browser的類型
    //         // await driver.getSession().then(e=>console.log("driver new:",e));
    //         // driver.manage().getCookie().then(e=>{console.log("前",e)});
    //         // driver.manage().deleteAllCookies();
    //         // driver.manage().getCookie().then(e=>{console.log("後",e)});
    //         await driver.get(url5);//在這裡要用await確保打開完網頁後才能繼續動作
    //         // 根據id定位 資訊
    //         const keyword = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[3]/form/div[2]/div[1]/div[1]/div/div[2]/input')));//填寫關鍵字

    //         //Convert an ISO date to the date format yyyy-mm-dd
    //         var afterDate = new Date();
    //         var beforeDate = new Date();
    //         afterDate = afterDate.getFullYear() + '-' + (afterDate.getMonth() + 1) + '-' + (afterDate.getDate() - 1);
    //         beforeDate = beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();

    //         await keyword.sendKeys('allintext: "' + InputKeyword + '"+"投資"+"新廠"+"億" after:' + afterDate + ' before:' + beforeDate + '\n')//將使用者輸入關鍵字填入 //"\n":i.e. enter key點擊
    //             .then(async e => {
    //                 await driver.wait(async function () {
    //                     const readyState = await driver.executeScript('return document.readyState');
    //                     return readyState === 'complete';
    //                 });
    //                 console.log("i:", i);
    //                 console.log("公司:", InputKeyword);

    //                 // console.log("type:",typeof module.exports.outputResult5(driver));
    //                 // console.log("object:",module.exports.outputResult5(driver));
    //                 await module.exports.outputResult5(driver, InputKeyword, isListed)
    //                     .then(async e => {
    //                         tmp = e;

    //                         // console.log("tmp:",tmp);
    //                     });
    //                 info = info.concat(tmp); //use selenium
    //                 // console.log("info",info);
    //                 // console.log("info length",info.length);

    //                 if (i !== (InputKeywordArr.length - 1)) {
    //                     await driver.sleep(60000);
    //                     // await driver.sleep((Math.random() * 90000) + 60000);
    //                     // await driver.sleep((Math.random() * 10000) + 5000);

    //                 }


    //             });

    //     }
    //     // await driver.getSession().then(e=>console.log("driver close:",e));
    //     await driver.close();
    //     return info;
    // },

    outputResultTest: function () {
        // 取得網頁資料
        request(url, (error, response, body) => {
            if (!error) {

                //console.log(body);

                // 用 cheerio 解析 html 資料
                var $ = cheerio.load(body);

                // 篩選有興趣的資料
                var titleAry = [];
                $("#divGridViewList .list_table tbody tr td a").each(function (i, elem) {
                    titleAry.push(
                        {
                            text: $(elem).text().split('\n'),
                            href: $(elem).attr('href'),
                        }
                    );
                })

                // 輸出
                // console.log("title org:" , titleAry);

                //網址處理
                const concatUrl = "https://www.moea.gov.tw/MNS/populace";
                for (i in titleAry) {
                    titleAry[i].href = titleAry[i].href.slice(2, titleAry[i].href.end);
                    titleAry[i].href = concatUrl.concat(titleAry[i].href);
                }

                // 輸出
                console.log("title after:", titleAry);
            } else {
                console.log("擷取錯誤：" + error);
            }
        });
    },


    // outputResult5: async function (driver) {
    //     await driver.wait(until.elementLocated(By.xpath('//*[@id="rso"]/div/div[1]/div/div[1]/a/h3/span'))); //確保頁面定位好 避免excption
    //     // await driver.getCurrentUrl().then(function(v){console.log("=====URL=====",v);}); //確保頁面定位好 避免excption
    //     // await driver.getCurrentUrl(); //確保頁面定位好 避免excption

    //     console.log("定位完成5");
    //     const titleAry = [];
    //     var len = 0;
    //     var spanLen = 0;
    //     await driver.findElements(By.xpath('//*[@id="rso"]/div/div')).then(e => { console.log("len:", e.length); len = e.length; });
    //     for (var i = 0; i < len; i++) {
    //         await driver.findElements(By.xpath('//*[@id="rso"]/div/div[' + (i + 1) + ']/div/div[2]/div/span/span'))
    //             .then(e => {
    //                 // console.log("spanLen:",e.length);
    //                 spanLen = e.length;
    //             });
    //         titleAry.push({
    //             //標題 
    //             //*[@id="rso"]/div/div[1]/div/div[1]/a/h3/span
    //             //*[@id="rso"]/div/div[2]/div/div[1]/a/h3/span
    //             //*[@id="rso"]/div/div[3]/div/div[1]/a/h3/span
    //             //連結
    //             //*[@id="rso"]/div/div[1]/div/div[1]/a
    //             //*[@id="rso"]/div/div[2]/div/div[1]/a
    //             //*[@id="rso"]/div/div[3]/div/div[1]/a
    //             //日期
    //             //*[@id="rso"]/div/div[1]/div/div[2]/div/span/span[1]
    //             //*[@id="rso"]/div/div[2]/div/div[2]/div/span/span[1]
    //             //*[@id="rso"]/div/div[3]/div/div[2]/div/span/span[1]
    //             symbol: null,
    //             name: null,
    //             date: (await checkHasDate(driver, i + 1, spanLen, 1)).toString(),
    //             time: null,
    //             text: await driver.findElement(By.xpath('//*[@id="rso"]/div/div[' + (i + 1) + ']/div/div[1]/a/h3/span')).getText(),
    //             detail: (await checkHasDate(driver, i + 1, spanLen, 2)).toString(),
    //             href: await driver.findElement(By.xpath('//*[@id="rso"]/div/div[' + (i + 1) + ']/div/div[1]/a')).getAttribute("href"),
    //             file: null,
    //         });
    //     }
    //     // console.log("Google title:", titleAry);
    //     return titleAry;
    // }
    outputResult5: async function (driver, companyName, isListed) {
        try {
            // await driver.wait(until.elementLocated(By.xpath('//*[@id="rso"]/div'))); //確保頁面定位好 避免excption
            await driver.wait(until.elementLocated(By.xpath('//*[@id="rcnt"]')), 3000); //確保頁面定位好 避免excption
            // await driver.getCurrentUrl().then(function(v){console.log("=====URL=====",v);}); //確保頁面定位好 避免excption
            // await driver.getCurrentUrl(); //確保頁面定位好 避免excption

            // try {
            //     await driver.wait(until.elementLocated(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]')));
            // } catch (e) {
            //     console.log(e);
            // }


            console.log("定位完成5");
            // await driver.getSession().then(e=>console.log("outputResult5 driver:",e));
            const titleAry = [];
            let len = 0;
            let spanLen = 0;
            let divLen = 0;
            var dl = 0;
            await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]'))
                .then(async e => {
                    console.log("divLen:", e.length);
                    divLen = e.length;
                    /* debug */
                    if (divLen === 0) {
                        await driver.getCurrentUrl().then(async e => {
                            // driver = await debug.debuging(e);
                            await driver.get(e).then(async e => {
                                await driver.wait(async function () {
                                    const readyState = await driver.executeScript('return document.readyState');
                                    return readyState === 'complete';
                                }, 3000);
                            });
                            await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]'))
                                .then(async e => {
                                    console.log("divLen2:", e.length);
                                    divLen = e.length;
                                });
                        });
                    }/* debug End */

                    //*[@id="rso"]/div[1]/div[1]/div/div[1]/a/h3/span
                    //*[@id="rso"]/div[1]/div[2]/div/div[1]/a/h3/span
                    //*[@id="rso"]/div[3]/div[2]/div/div[1]/a/h3/span
                    for (dl = 0; dl < divLen; dl++) {
                        console.log("dl:", dl);
                        await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div'))
                            .then(async e => {
                                console.log("len:", e.length);
                                len = e.length;
                                for (var i = 0; i < len; i++) {
                                    await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div[2]/span[contains(@class, "aCOpRe")]/span'))
                                        .then(async e => {
                                            console.log(i + "=>spanLen: " + e.length);
                                            // await driver.getCurrentUrl().then(e=>{ console.log("URL:",e);});
                                            spanLen = e.length;

                                            /* debug */
                                            if (spanLen === 0) {
                                                await driver.getCurrentUrl().then(async e => {
                                                    //driver = await debug.debuging(e);
                                                    await driver.get(e).then(async e => {
                                                        await driver.wait(async function () {
                                                            const readyState = await driver.executeScript('return document.readyState');
                                                            return readyState === 'complete';
                                                        }, 3000);
                                                    });
                                                    await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div[2]/span[contains(@class, "aCOpRe")]/span'))
                                                        .then(async e => {
                                                            console.log(i + "=>spanLen2:", e.length);
                                                            spanLen = e.length;
                                                        });
                                                });
                                            }/* debug End */

                                            titleAry.push({
                                                //標題 
                                                //*[@id="rso"]/div/div[1]/div/div[1]/a/h3/span
                                                //*[@id="rso"]/div/div[2]/div/div[1]/a/h3/span
                                                //*[@id="rso"]/div/div[3]/div/div[1]/a/h3/span
                                                //連結
                                                //*[@id="rso"]/div/div[1]/div/div[1]/a
                                                //*[@id="rso"]/div/div[2]/div/div[1]/a
                                                //*[@id="rso"]/div/div[3]/div/div[1]/a
                                                //日期
                                                //*[@id="rso"]/div/div[1]/div/div[2]/div/span/span[1]
                                                //*[@id="rso"]/div/div[2]/div/div[2]/div/span/span[1]
                                                //*[@id="rso"]/div/div[3]/div/div[2]/div/span/span[1]
                                                symbol: null,
                                                name: null,
                                                date: (await checkHasDate(driver, i + 1, spanLen, 1, dl + 1)).toString(),
                                                time: null,
                                                text: await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div[1]/a/h3')).getText(),
                                                detail: (await checkHasDate(driver, i + 1, spanLen, 2, dl + 1)).toString(),
                                                href: await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div[1]/a')).getAttribute("href"),
                                                file: null,
                                            });
                                            // console.log("date type:",typeof titleAry[i].date);
                                            // console.log("date:",titleAry[i].date);
                                        });
                                }
                            });

                    }

                    //將GOOGLE爬到的內容轉成html (每間公司)
                    // var Record_Context = '';
                    if (isListed) { //上市櫃
                        // Record_Context = await email_body.companyInfo(companyName, titleAry);
                        // console.log("Record_Context:", Record_Context);
                        //將GOOGLE->html 紀錄到資料庫
                        await Record.record(companyName, 5, titleAry);
                    } else { //未上市櫃
                        // Record_Context = await email_body.companyInfo(companyName, titleAry);
                        //將GOOGLE->html 紀錄到資料庫
                        await Record.record(companyName, 6, titleAry);
                    }
                });


            // console.log("Google title:", titleAry);
            // await driver.getCurrentUrl();
            await driver.close();

            return titleAry;

        } catch (err) {
            console.log("Google: ", err);
            await driver.close();
        }

    }


}

function ConsoleTime() {
    var currentTime = new Date();
    currentTime = (currentTime.getFullYear()
        + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
        + "/" + ('0' + currentTime.getDate()).slice(-2)
        + " " + ('0' + currentTime.getHours()).slice(-2)
        + ":" + ('0' + currentTime.getMinutes()).slice(-2)
        + ":" + ('0' + currentTime.getSeconds()).slice(-2));

    console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');
}

async function checkHasDate(driver, index, spanLen, flag, divIndex) {
    // if (spanLen == 2 && flag == 2) return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div[2]/div/span[contains(@class, "aCOpRe")]/span[2]')).getText();
    // else if (spanLen == 1 && flag == 1) return '';
    // else if (spanLen == 0 && flag == 1) return '';
    // else if (spanLen == 0 && flag == 2) return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div[2]/div/span[contains(@class, "aCOpRe")]/span')).getText();
    // else return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div[2]/div/span[contains(@class, "aCOpRe")]/span[1]')).getText();
    if (flag == 2 && spanLen == 1) return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span')).getText();
    else if (flag == 2 && spanLen == 2) return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span[2]')).getText();
    else if (flag == 1 && spanLen == 2) return await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + divIndex + ']/div[contains(@class, "g")][' + index + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span[contains(@class, "f")]')).getText();
    else return '';
}


/*
Count Elements On Page
    driver.findElements(By.css(".some-class")).then(elements => console.log(elements.length));
*/
