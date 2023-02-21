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
const { strict, rejects } = require('assert');

const Record = require('./Record');
const KeywordRecords = require('../../models/KeywordRecord');
const logger = require('./logger');
// google
const url5 = "https://www.google.com/";
const GoogleKeyword = require("../../models/GoogleKeyword");



// selenium
module.exports = {
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
    runGoogle: async function (number, CompanyAbbreviation, isListed) {
        var number = number;
        try {
            await Promise.race([module.exports.setExecutedTime(15000), await module.exports.queryCompanyNews5(CompanyAbbreviation, isListed),]).then(async function (val) {
                console.log(val[0]);
                console.log('logger.jobs_crawler', logger.jobs_crawler);
                logger.jobs_crawler.pop();
                console.log('logger.jobs_crawler', logger.jobs_crawler);
                if (val[0] == false) {
                    console.log('\x1b[31m執行時間超時\033[0m');
                    if (val[1] != null) {
                        await val[1].close();
                        console.log('driver close');
                        if (logger.jobs_crawler.length == 0) {
                            await val[1].quit();
                            console.log('driver quit');
                        }
                    }
                }
                else if (val[0] == true) {
                    await val[1].sleep((Math.random() * 65000) + 65000);
                    console.log('driver sleep');
                    await val[1].close();
                    console.log('driver close');
                    if (logger.jobs_crawler.length == 0) {
                        await val[1].quit();
                        console.log('driver quit');
                    }
                    number++;

                    // Record 
                    await (await KeywordRecords.find())[0].deleteOne();
                    const post = new KeywordRecords({
                        KeywordCompany: isListed,
                        KeywordCompanyName: number,
                    });
                    await post.save();
                }
            });
        } catch (err) {
            console.log(err);
        } finally {
            return number;
        }
    },
    setExecutedTime: function (delay) {
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                resolve([false, null]);
            }, delay);
        });
    },
    //google ListedCompany/NonListedCompany
    queryCompanyNews5: async function (CompanyAbbreviation, isListed) {
        return new Promise(async (resolve, reject) => {
            logger.jobs_crawler.push('search');

            var driver;
            var InputKeyword = CompanyAbbreviation;
            var gk = await GoogleKeyword.find();
            let keywordStr = '';
            for (var i = 0; i < gk.length; i++) {
                keywordStr += ('+"' + gk[i].GoogleSearchKeyword + '"');
            }

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

                        var currentTime = new Date();
                        currentTime = (currentTime.getFullYear()
                            + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
                            + "/" + ('0' + currentTime.getDate()).slice(-2)
                            + " " + ('0' + currentTime.getHours()).slice(-2)
                            + ":" + ('0' + currentTime.getMinutes()).slice(-2)
                            + ":" + ('0' + currentTime.getSeconds()).slice(-2));

                        console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');

                        // Convert an ISO date to the date format yyyy-mm-dd
                        var afterDate = new Date();
                        var beforeDate = new Date();
                        afterDate = afterDate.getFullYear() + '-' + (afterDate.getMonth() + 1) + '-' + (afterDate.getDate() - 1);
                        beforeDate = beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();
                        console.log('allintext: "' + InputKeyword + '"' + keywordStr + ' after:' + afterDate + ' before:' + beforeDate);
                        //將使用者輸入關鍵字填入 //"\n":i.e. enter key點擊
                        await keyword.sendKeys('allintext: "' + InputKeyword +   '"' + keywordStr + ' after:' + afterDate + ' before:' + beforeDate + '\n')
                            .then(async e => {
                                await driver.wait(async function () {
                                    const readyState = await driver.executeScript('return document.readyState');
                                    return readyState === 'complete';
                                }, 3000);

                                console.log("公司:", '\x1b[36m' + InputKeyword + '\033[0m');

                                // console.log("type:",typeof module.exports.outputResult5(driver));
                                // console.log("object:",module.exports.outputResult5(driver));

                                await driver.wait(until.elementLocated(By.xpath('//*[@id="rcnt"]')), 3000)
                                    .then(async e => {
                                        console.log("定位完成");
                                        const titleAry = [];
                                        await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")]'))
                                            .then(async e => {
                                                console.log("\t" + "divLen:", e.length);
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
                                                                console.log("\t" + "divLen2:", e.length);
                                                                divLen = e.length;
                                                            });
                                                    });
                                                }

                                                for (var dl = 0; dl < divLen; dl++) {
                                                    console.log("\t" + "dl:", dl);
                                                    await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div'))
                                                        .then(async e => {
                                                            console.log("\t" + "len:", e.length);
                                                            var len = e.length;
                                                            for (var i = 0; i < len; i++) {
                                                                await driver.findElements(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[2]/span[contains(@class, "aCOpRe")]/span'))
                                                                                                    //*[@id="rso"]/div                                              /div[1]                                     /div/div/div[2]/span/span
                                                                    .then(async e => {
                                                                        console.log("\t" + i + "=>spanLen: " + e.length);
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
                                                                                        console.log("\t" + i + "=>spanLen2:", e.length);
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
                                                                                                                      //*[@id="rso"]/div                                              /div[1]                                     /div/div/div[1]/a/h3
                                                                            detail: (await checkHasDate(driver, i + 1, spanLen, 2, dl + 1)).toString(),
                                                                            href: (await driver.findElement(By.xpath('//*[@id="rso"]/div[contains(@class, "hlcw0c")][' + (dl + 1) + ']/div[contains(@class, "g")][' + (i + 1) + ']/div/div/div[1]/a')).getAttribute("href")),
                                                                            file: null,
                                                                        });
                                                                        // console.log("\t" +"date type:",typeof titleAry[i].date);
                                                                        // console.log("\t" +"date:",titleAry[i].date);

                                                                    });
                                                            }
                                                        });

                                                }
                                            });

                                        var isListedNumber = (isListed == true) ? 5 : 6;
                                        await Record.record(InputKeyword, isListedNumber, titleAry);

                                        console.log("搜尋結束");
                                    });

                            });
                    });

                var currentTime = new Date();
                currentTime = (currentTime.getFullYear()
                    + "/" + ('0' + (currentTime.getMonth() + 1)).slice(-2)
                    + "/" + ('0' + currentTime.getDate()).slice(-2)
                    + " " + ('0' + currentTime.getHours()).slice(-2)
                    + ":" + ('0' + currentTime.getMinutes()).slice(-2)
                    + ":" + ('0' + currentTime.getSeconds()).slice(-2));

                console.log('\x1b[36m' + "現在時間:", currentTime, '\033[0m');
                resolve([true, driver]);
            } catch (err) {
                console.log("Google: ", err);
                resolve([false, driver]);
            }
        });
        // await driver.getSession().then(e=>console.log("driver close:",e));
    },
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
