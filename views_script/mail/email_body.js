module.exports = {
    // ---------------------------------------------------------------------------
    // 語句處理
    // ---------------------------------------------------------------------------
    allinfo: async function (emailtitle_info, info) {

        var email_title = '';
        var email_body = '';

        var new_news = false;
        for (var i = 0; i < info.length; i++) {
            if (info[i] !== false) {
                // email body
                email_body += await module.exports.info(i, info[i]);

                // email title
                if (info[i].length != 0) new_news = true;
                if (email_title != '') email_title += " & ";
                email_title += (emailtitle_info[i]);
            }
        }
        if (new_news == true) email_title = (" * " + email_title);
        // email_body += await module.exports.info0(info[0]);
        // email_body += await module.exports.info1(info[1]);
        // email_body += await module.exports.info2(info[2]);
        // email_body += await module.exports.info3(info[3]);
        // email_body += await module.exports.info4(info[4]);
        // email_body += await module.exports.info5(info[5]);
        return [email_title, email_body];
    },
    info: async function (num, info) {
        var email_body = '';
        var date, text, href, detail, file, name, symbol = null;
        // console.log(num, info);
        console.log(num);

        switch (num) {
            case 0:
                email_body += '<h2 style="margin-left: 10px;">經濟部本部新聞</h2>';
                break;
            case 1:
                email_body += '<h2 style="margin-left: 10px;">投審會最新公告</h2>';
                break;
            case 2:
                email_body += '<h2>科技部新聞資料</h2>';
                break;
            case 3:
                email_body += '<h2>公開資訊觀測站</h2>';
                break;
            case 4:
                email_body += '<h2>Google</h2>';
                break;
            // case 5:
            //     email_body += '<h2>Google 上市櫃</h2>';
            //     break;
            // case 6:
            //     email_body += '<h2>Google 未上市櫃</h2>';
            //     break;
            default:
                break;
        }
        email_body += ('<div style="margin-left: 50px; margin-right: 60px;">');
        email_body += ('<table style="border-collapse: collapse; border-spacing: 5px;">');

        // console.log("body info:",info);
        // console.log("body info length:",info.length);

        if (info.length == 0) {
            email_body += ('<tr style="border-bottom:1pt #eeeeee solid; border-top:1pt #eeeeee solid;">');
            email_body += ('<td colspan="2">');
            email_body += ('<h3>搜尋結果查無符合內容。</h3>')
            email_body += ('</td>');
            email_body += ('</tr>');
        };

        for (var i = 0; i < info.length; i++) {
            if (info[i] === undefined) {
                continue;
            }


            date = (('時間： ')
                + ((info[i].date == null) ? "" : info[i].date + " ")
                + ((info[i].time == null) ? "" : info[i].time + " "));

            text = info[i].text;
            href = info[i].href;
            detail = info[i].detail;
            file = info[i].file;

            name = info[i].name;
            symbol = info[i].symbol;
            var stock = ((symbol != null) ? (symbol + " | ") : "") + ((name != null) ? (name + " | ") : "");



            email_body += ('<tr style="border-top:1pt #eeeeee solid; height:50px">');
            email_body += ('<td style="width:150px; font-size: 16px;">');
            email_body += ('<strong>' + date);
            email_body += ('</td>');
            email_body += ('<td style="font-size: 16px;">');
            email_body += ('<strong>' + stock + '<a href="' + href + '">' + text + '</a>');
            email_body += ('</td>');
            email_body += ('</tr>');

            email_body += ('<tr>');
            email_body += ('<td colspan="2" style="padding-left: 30px; padding-right: 30px;">');
            email_body += ((detail == null) ? '' : detail.substring(0, 150) + " ...");
            email_body += ((file == null) ? '' : '<a href="' + file + '">檔案下載</a>');
            email_body += ('</td>');
            email_body += ('</tr>');

            email_body += ('<tr style="height:10px">');
            email_body += ('<td>');
            email_body += ('</td>');
            email_body += ('</tr>');
        }

        email_body += ('<tr style="border-top:1pt #eeeeee solid;">');
        email_body += ('<td colspan="2">');
        email_body += ('</td>');
        email_body += ('</tr>');
        email_body += ('</table>');
        email_body += ('</div>');

        return email_body;
    },
    Info_Google: async function (companyName, info) {
        var email_body = '';
        var date, text, href, detail, file, name, symbol = null;
        // console.log(num, info);

        email_body += ('<div style="margin-left: 50px; margin-right: 60px;">');
        email_body += ('<table style="border-collapse: collapse; border-spacing: 5px;">');
        email_body += ('<tr>');
        email_body += ('<td style="font-size: 20px; color: #D84800; height: 40px;">');
        email_body += ('<strong>' + companyName);
        email_body += ('</td>');
        email_body += ('</tr>');
        // console.log("body info:",info);
        // console.log("body info length:",info.length);
        if (info === undefined) {
            console.log("undefined companyName:", companyName);
        }
        else if (info !== undefined) {
            for (var i = 0; i < info.length; i++) {
                if (info[i] === undefined) {
                    continue;
                }

                date = (('時間： ')
                    + ((info[i].date == null) ? "" : info[i].date + " ")
                    + ((info[i].time == null) ? "" : info[i].time + " "));

                text = info[i].text;
                href = info[i].href;
                detail = info[i].detail;
                file = info[i].file;

                name = info[i].name;
                symbol = info[i].symbol;
                var stock = ((symbol != null) ? (symbol + " | ") : "") + ((name != null) ? (name + " | ") : "");


                email_body += ('<tr style="border-top:1pt #eeeeee solid; height:50px">');
                email_body += ('<td style="width:150px; font-size: 16px;">');
                email_body += ('<strong>' + date);
                email_body += ('</td>');
                email_body += ('<td style="width:1150px; font-size: 16px;">');
                email_body += ('<strong>' + stock + '<a href="' + href + '">' + text + '</a>');
                email_body += ('</td>');
                email_body += ('</tr>');

                email_body += ('<tr>');
                email_body += ('<td colspan="2" style="width:1300px;">');
                email_body += ((detail == null) ? '' : detail);
                email_body += ((file == null) ? '' : '<a href="' + file + '">檔案下載</a>');
                email_body += ('</td>');
                email_body += ('</tr>');

                email_body += ('<tr style="width:1300px; height:10px">');
                email_body += ('<td colspan="2">');
                email_body += ('</td>');
                email_body += ('</tr>');
            }
        }

        email_body += ('<tr style="border-top:1pt #eeeeee solid;">');
        email_body += ('<td colspan="2">');
        email_body += ('</td>');
        email_body += ('</tr>');
        email_body += ('</table>');
        email_body += ('</div>');
        return email_body;
    },
    companyInfo: async function (companyName, info) {
        var email_body = '';
        var date, text, href, detail, file, name, symbol = null;
        // console.log(num, info);

        email_body += ('<div>');
        email_body += ('<p style="color: #D84800; font-size: 26px; margin-top: 40px; margin-left: 30px;"><strong>' + companyName + '</strong></p>');
        email_body += ('</div>');
        email_body += ('<table style="border-collapse: collapse; margin-left: 60px; margin-right: 60px;">');
        email_body += ('<tr style="border-bottom:1pt #eeeeee solid;"><td><td></tr>');

        // console.log("body info:",info);
        // console.log("body info length:",info.length);
        if (info === undefined) {
            console.log("undefined companyName:", companyName);
        }
        else if (info !== undefined) {

            if (info.length == 0) {
                email_body += ('<tr style="border-bottom:1pt #eeeeee solid;"><td>');
                email_body += ('<div style="margin-top: 20px; margin-bottom: 20px;">');
                email_body += ('<p style="font-size: 18px;">搜尋結果查無符合內容。</p>');
                email_body += ('</div></td></tr>');
            };

            for (var i = 0; i < info.length; i++) {
                if (info[i] === undefined) {
                    continue;
                }
                email_body += ('<tr style="border-bottom:1pt #eeeeee solid;"><td>');
                email_body += ('<div style="margin-top: 20px; margin-bottom: 20px;">');

                date = ('<p style="font-size: 16px;">時間： '
                    + ((info[i].date == null) ? "" : info[i].date + " ")
                    + ((info[i].time == null) ? "" : info[i].time + " ")
                    + ('</p>'));

                text = info[i].text;
                href = info[i].href;
                detail = info[i].detail;
                file = info[i].file;

                name = info[i].name;
                symbol = info[i].symbol;
                var stock = ((symbol != null) ? (symbol + " | ") : "") + ((name != null) ? (name + " | ") : "");

                email_body += date;
                email_body += ('<p style="font-size: 18px;">' + stock + '<a href="' + href + '">' + text + '</a></p>');
                email_body += ((detail == null) ? '' : '<p style="font-size: 14px;">' + detail + '</p>');
                email_body += ((file == null) ? '' : '<h5><a href="' + file + '">檔案下載</a></h5>');

                email_body += ('</div></td></tr>');
            }
        }

        email_body += ('</table>');
        return email_body;
    },
    // info0: async function (info) {
    //     var email_body = '';
    //     let date = null;
    //     let text = null;
    //     let href = null;

    //     email_body += '<h2>經濟部本部新聞</h2>';
    //     for (var i = 0; i < info.length; i++) {
    //         date = info[i].date;
    //         text = info[i].text;
    //         href = info[i].href;
    //         email_body += '<h4>' + date + '</h4><p><a href="' + href + '">' + text + '</a></p>';
    //     }

    //     return email_body;
    // },
    // info1: async function (info) {
    //     var email_body = '';
    //     let date = null;
    //     let text = null;
    //     let href = null;
    //     let file = null;

    //     email_body += '<h2>投審會最新公告</h2>';
    //     for (var i = 0; i < info.length; i++) {
    //         date = info[i].date;
    //         text = info[i].text;
    //         href = info[i].href;
    //         file = info[i].file;
    //         email_body += '<h4>' + date + '</h4><p><a href="' + href + '">' + text + '</a></p><h5><a href="' + file + '">檔案下載</a><h5>';
    //     }

    //     return email_body;
    // },
    // info2: async function (info) {
    //     var email_body = '';
    //     let date = null;
    //     let text = null;
    //     let href = null;

    //     email_body += '<h2>科技部新聞資料</h2>';
    //     for (var i = 0; i < info.length; i++) {
    //         date = info[i].date;
    //         text = info[i].text;
    //         href = info[i].href;
    //         email_body += '<h4>' + date + '</h4><p><a href="' + href + '">' + text + '</a></p>';
    //     }
    //     return email_body;
    // },
    // info3: async function (info) {
    //     var email_body = '';

    //     let text = null;


    //     let symbolAry = [];
    //     let nameAry = [];
    //     let dateAry = [];
    //     let timeAry = [];
    //     let textAry = [];
    //     let detailAry = [];
    //     let hrefAry = [];

    //     for (var i = 0; i < info.length; i++) {
    //         symbolAry.push(info[i].symbol);
    //         nameAry.push(info[i].name);
    //         dateAry.push(info[i].date);
    //         timeAry.push(info[i].time);
    //         textAry.push(info[i].text);
    //         detailAry.push(info[i].detail);
    //         hrefAry.push(info[i].href);
    //     }


    //     email_body += '<h2>公開資訊觀測站</h2>';
    //     for (var i = 0; i < info.length; i++) {
    //         email_body += '<h4>' + dateAry[i] + ',' + timeAry[i] + '</h4><p>' + symbolAry[i] + '' + nameAry[i] + '</p><p><a href="' + hrefAry[i] + '">' + textAry[i] + '</a></p>';
    //     }
    //     symbolAry = [];
    //     nameAry = [];
    //     dateAry = [];
    //     timeAry = [];
    //     textAry = [];
    //     detailAry = [];
    //     return email_body;
    // },
    // info4: async function (info) {
    //     var email_body = '';

    //     let dateAry = [];
    //     let textAry = [];
    //     let hrefAry = [];

    //     for (var i = 0; i < info.length; i++) {
    //         dateAry.push(info[i].date);
    //         textAry.push(info[i].text);
    //         hrefAry.push(info[i].href);
    //     }

    //     email_body += '<h2>google</h2>';
    //     for (var i = 0; i < textAry.length; i++) {
    //         email_body += '<h4>' + dateAry[i] + '</h4><p><a href="' + hrefAry[i] + '">' + textAry[i] + '</a></p>';
    //     }
    //     return email_body;
    // },
    // info5: async function (info) {
    //     var email_body = '';

    //     let dateAry = [];
    //     let textAry = [];
    //     let hrefAry = [];

    //     for (var i = 0; i < info.length; i++) {
    //         dateAry.push(info[i].date);
    //         textAry.push(info[i].text);
    //         hrefAry.push(info[i].href);
    //     }

    //     email_body += '<h2>google cont.</h2>';
    //     for (var i = 0; i < textAry.length; i++) {
    //         email_body += '<h4>' + dateAry[i] + '</h4><p><a href="' + hrefAry[i] + '">' + textAry[i] + '</a></p>';
    //     }
    //     return email_body;
    // }
}
