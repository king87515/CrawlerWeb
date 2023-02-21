
const webdriver = require('selenium-webdriver'), //加入虛擬網頁套件
    By = webdriver.By, //你想要透過什麼方式來抓取元件，通常使用xpath、css
    until = webdriver.until; //直到抓到元件才進入下一步(可設定等待時間)
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();

// options.addArguments('--headless'); //瀏覽器不提供頁面觀看，linux下如果系統是純文字介面不加這條會啓動失敗
options.addArguments('--log-level=3'); //這個option可以讓你跟headless時網頁端的console.log說掰掰

//下面參數能提升爬蟲穩定性    
options.addArguments('--disable-dev-shm-usage'); //使用共享內存RAM
options.addArguments('--disable-gpu'); //規避部分chrome gpu bug

options.addArguments('user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36"'); //user agent
// options.addArguments("--incognito"); //無痕模式



// selenium
module.exports = {
    debuging: async function () {
        const url = "https://www.google.com/";
        for (var i = 0; i < 5; i++) {
            console.log(i);
            let driver = await new webdriver.Builder()
                .forBrowser("chrome").withCapabilities(options)
                .build();// 建立這個browser的類型

            await driver.get(url);
            console.log('sleep');
            await driver.sleep(5000);
            console.log('sleep end');
            await driver.close();
            console.log('close end');
        }
        console.log('end');
        return;
    },
}