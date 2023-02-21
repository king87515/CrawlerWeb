
const SearchMOEARecord = require("../../models/SearchMOEARecord");
const SearchMOEAICRecord = require("../../models/SearchMOEAICRecord");
const SearchMOSTRecord = require("../../models/SearchMOSTRecord");
const SearchMOPSRecord = require("../../models/SearchMOPSRecord");
const SearchGoogleListedRecord = require("../../models/SearchGoogleListedRecord");
const SearchGoogleNonListedRecord = require("../../models/SearchGoogleNonListedRecord");
const { jobs } = require("./logger");

module.exports = {
    record: async function (id, num, info) {
        // 紀錄
        switch (num) {
            case 0:
                // 簡化資料
                var infosimplify = [];
                for (var i = 0; i < info.length; i++) {
                    var temp = {
                        date: info[i].date,
                        text: info[i].text,
                    };
                    infosimplify.push(temp);
                }
                // delete and save
                await SearchMOEARecord.find({ Record_id: id }).deleteOne().then(async x => {
                    const post = new SearchMOEARecord({
                        Record_id: id,
                        Record_Context: infosimplify,
                    });
                    await post.save();
                });
                break;
            case 1:
                // 簡化資料
                var infosimplify = [];
                for (var i = 0; i < info.length; i++) {
                    var temp = {
                        date: info[i].date,
                        text: info[i].text,
                    };
                    infosimplify.push(temp);
                }
                // delete and save
                await SearchMOEAICRecord.find({ Record_id: id }).deleteOne().then(async x => {
                    const post = new SearchMOEAICRecord({
                        Record_id: id,
                        Record_Context: infosimplify,
                    });
                    await post.save();
                });
                break;
            case 2:
                // 簡化資料
                var infosimplify = [];
                for (var i = 0; i < info.length; i++) {
                    var temp = {
                        date: info[i].date,
                        text: info[i].text,
                    };
                    infosimplify.push(temp);
                }
                // delete and save
                await SearchMOSTRecord.find({ Record_id: id }).deleteOne().then(async x => {
                    const post = new SearchMOSTRecord({
                        Record_id: id,
                        Record_Context: infosimplify,
                    });
                    await post.save();
                });
                break;
            case 3:
                // 簡化資料
                var infosimplify = [];
                for (var i = 0; i < info.length; i++) {
                    var temp = {
                        symbol: info[i].symbol,
                        name: info[i].name,
                        text: info[i].text,
                    };
                    infosimplify.push(temp);
                }
                // console.log(infosimplify);
                // delete and save
                await SearchMOPSRecord.find({ Record_id: id }).deleteOne().then(async x => {
                    const post = new SearchMOPSRecord({
                        Record_id: id,
                        Record_Context: infosimplify,
                    });
                    await post.save();
                });
                break;
            case 5: // 上市櫃 id:Record_CompanyName
                await SearchGoogleListedRecord.find({ Record_CompanyName: id }).deleteOne().then(async x => {
                    const post = new SearchGoogleListedRecord({
                        Record_CompanyName: id,
                        Record_Listed_Context: info,
                    });
                    await post.save();
                });
                break;
            case 6: // 未上市櫃 id:Record_CompanyName
                await SearchGoogleNonListedRecord.find({ Record_CompanyName: id }).deleteOne().then(async x => {
                    const post = new SearchGoogleNonListedRecord({
                        Record_CompanyName: id,
                        Record_NonListed_Context: info,
                    });
                    await post.save();
                });
                break;
            default:
                break;
        }
    },

    compare: async function (id, num, info) {
        var id = id;
        var num = num;
        // 比對
        // console.log("info:", info);
        if (info.length === undefined) info.length = 0;
        switch (num) {
            case 0:
                var SearchMOEARecordDatabase = await SearchMOEARecord.findOne({ Record_id: id });
                // console.log("SearchMOEARecordDatabase ID:",id);
                // console.log("SearchMOEARecordDatabase:",SearchMOEARecordDatabase);
                // console.log("SearchMOEARecordDatabase Record_Context:",SearchMOEARecordDatabase.Record_Context);
                // console.log("info.length:",info.length);
                // console.log("SearchMOEARecordDatabase.length:",SearchMOEARecordDatabase.Record_Context.length);
                var recordAry = [];
                var emailAry = [];
                if (SearchMOEARecordDatabase !== null) {
                    console.log("經濟部本部新聞 比對");
                    var yesterday = new Date(new Date().setDate(new Date().getDate() - 16));

                    for (var i = 0; i < SearchMOEARecordDatabase.Record_Context.length; i++) {
                        if (new Date(SearchMOEARecordDatabase.Record_Context[i].date) >= yesterday) {
                            recordAry.push(SearchMOEARecordDatabase.Record_Context[i]);
                        }
                    }

                    for (var i = 0; i < info.length; i++) {
                        if (new Date(info[i].date) >= yesterday) {
                            var found = false;
                            for (var j = 0; j < recordAry.length; j++) {
                                if (info[i].date == recordAry[j].date &&
                                    info[i].text == recordAry[j].text) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                emailAry.push(info[i]);
                                recordAry.push(info[i]);
                            }
                        }
                    }
                    module.exports.record(id, num, recordAry);
                    return emailAry;
                    // console.log("MOEAR newsAry:",newsAry);
                } else {
                    console.log("經濟部本部新聞 沒有比對");
                    module.exports.record(id, num, info);
                    return info;

                    var today = new Date();
                    var date = (today.getFullYear());
                    date += ('/' + String(today.getMonth() + 1).padStart(2, '0'));
                    date += ('/' + String(today.getDate()).padStart(2, '0'));
                    // for(var i=0; i<info.length;i++){
                    //     if(info[i].date === date){
                    //         newsAry.push(info[i]);
                    //     }
                    // }

                    // for (var i = 0; i < 2; i++) {
                    //     newsAry.push(info[i]);
                    // }

                    for (var i = 0; i < info.length; i++) {
                        // console.log("info:",info[i]);
                        // console.log("date:",date);
                        if (date == info[i].date) newsAry.push(info[i]);
                        else break;
                    }
                }

            case 1:
                var SearchMOEAICRecordDatabase = await SearchMOEAICRecord.findOne({ Record_id: id })
                // console.log("SearchMOEAICRecordDatabase:",SearchMOEAICRecordDatabase.Record_Context);
                var recordAry = [];
                var emailAry = [];
                if (SearchMOEAICRecordDatabase !== null) {
                    console.log("投審會最新公告 比對");
                    var yesterday = new Date(new Date().setDate(new Date().getDate() - 16));

                    for (var i = 0; i < SearchMOEAICRecordDatabase.Record_Context.length; i++) {
                        if (new Date(SearchMOEAICRecordDatabase.Record_Context[i].date) >= yesterday) {
                            recordAry.push(SearchMOEAICRecordDatabase.Record_Context[i]);
                        }
                    }
                    // console.log(recordAry);
                    for (var i = 0; i < info.length; i++) {
                        if (new Date(info[i].date) >= yesterday) {
                            var found = false;
                            for (var j = 0; j < recordAry.length; j++) {
                                if (info[i].date == recordAry[j].date &&
                                    info[i].text == recordAry[j].text) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                emailAry.push(info[i]);
                                recordAry.push(info[i]);
                            }
                        }
                    }
                    module.exports.record(id, num, recordAry);
                    return emailAry;
                    // console.log("MOEAR newsAry:",newsAry);
                } else {
                    console.log("投審會最新公告 沒有比對");
                    module.exports.record(id, num, info);
                    return info;

                    var today = new Date();
                    var date = (today.getFullYear());
                    date += ('/' + String(today.getMonth() + 1).padStart(2, '0'));
                    date += ('/' + String(today.getDate()).padStart(2, '0'));
                    // for(var i=0; i<info.length;i++){
                    //     if(info[i].date === date){
                    //         newsAry.push(info[i]);
                    //     }
                    // }

                    // for (var i = 0; i < 2; i++) {
                    //     newsAry.push(info[i]);
                    // }

                    for (var i = 0; i < info.length; i++) {
                        // console.log("info:",info[i]);
                        // console.log("date:",date);
                        if (date == info[i].date) newsAry.push(info[i]);
                        else break;
                    }
                }

            case 2:
                var SearchMOSTRecordDatabase = await SearchMOSTRecord.findOne({ Record_id: id })
                // console.log("SearchMOSTRecordDatabase:",SearchMOSTRecordDatabase.Record_Context);
                var recordAry = [];
                var emailAry = [];
                if (SearchMOSTRecordDatabase !== null) {
                    console.log("科技部新聞資料 比對");
                    var yesterday = new Date(new Date().setDate(new Date().getDate() - 16));

                    for (var i = 0; i < SearchMOSTRecordDatabase.Record_Context.length; i++) {
                        if (new Date(SearchMOSTRecordDatabase.Record_Context[i].date) >= yesterday) {
                            recordAry.push(SearchMOSTRecordDatabase.Record_Context[i]);
                        }
                    }

                    for (var i = 0; i < info.length; i++) {
                        if (new Date(info[i].date) >= yesterday) {
                            var found = false;
                            for (var j = 0; j < recordAry.length; j++) {
                                if (info[i].date == recordAry[j].date &&
                                    info[i].text == recordAry[j].text) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                emailAry.push(info[i]);
                                recordAry.push(info[i]);
                            }
                        }
                    }
                    module.exports.record(id, num, recordAry);
                    return emailAry;
                    // console.log("MOEAR newsAry:",newsAry);
                } else {
                    console.log("科技部新聞資料 沒有比對");
                    module.exports.record(id, num, info);
                    return info;


                    var today = new Date();
                    var date = (today.getFullYear());
                    date += ('/' + String(today.getMonth() + 1).padStart(2, '0'));
                    date += ('/' + String(today.getDate()).padStart(2, '0'));
                    // for(var i=0; i<info.length;i++){
                    //     if(info[i].date === date){
                    //         newsAry.push(info[i]);
                    //     }
                    // }

                    // for (var i = 0; i < 2; i++) {
                    //     newsAry.push(info[i]);
                    // }

                    for (var i = 0; i < info.length; i++) {
                        // console.log("info:",info[i]);
                        // console.log("date:",date);
                        if (date == info[i].date) newsAry.push(info[i]);
                        else break;
                    }
                }

            case 3:
                var SearchMOPSRecordDatabase = await SearchMOPSRecord.findOne({ Record_id: id });
                var recordAry = [];
                var emailAry = [];
                if (SearchMOPSRecordDatabase !== null) {
                    console.log("公開資訊觀測站 比對");
                    for (var i = 0; i < SearchMOPSRecordDatabase.Record_Context.length; i++) {
                        recordAry.push(SearchMOPSRecordDatabase.Record_Context[i]);
                    }
                    for (var i = 0; i < info.length; i++) {
                        var found = false;
                        for (var j = 0; j < SearchMOPSRecordDatabase.Record_Context.length; j++) {
                            if (info[i].symbol == SearchMOPSRecordDatabase.Record_Context[j].symbol &&
                                info[i].name == SearchMOPSRecordDatabase.Record_Context[j].name &&
                                info[i].text == SearchMOPSRecordDatabase.Record_Context[j].text) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            emailAry.push(info[i]);
                            recordAry.push(info[i]);
                        }
                    }
                    module.exports.record(id, num, recordAry);
                    return emailAry;
                } else {
                    console.log("公開資訊觀測站 沒有比對");
                    module.exports.record(id, num, info);
                    return info;
                }
            default:
                break;
        }

    }
}