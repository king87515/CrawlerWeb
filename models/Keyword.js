const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    /*
    Keyword
    KeywordEmail
    KeywordStartSunday
    KeywordStartMonday
    KeywordStartTuesday
    KeywordStartWednesday
    KeywordStartThursday
    KeywordStartFriday
    KeywordStartSaturday
    KeywordTimeFrom : 開始~
    KeywordTimeTo : 至~
    KeywordTimes
    KeywordFrequency
    KeywordQueryRecord
    KeywordSearchWeb
    
    KeywordSearchMOEA
    KeywordSearchMOEAIC
    KeywordSearchMOST
    KeywordSearchMOPS
    KeywordSearchGOOGLE

    KeywordValid
    */
    // Keyword: {
    //     type: String
    // },
    KeywordEmail: {
        type: Array
    },
    KeywordStartSunday: {
        type: Boolean
    },
    KeywordStartMonday: {
        type: Boolean
    },
    KeywordStartTuesday: {
        type: Boolean
    },
    KeywordStartWednesday: {
        type: Boolean
    },
    KeywordStartThursday: {
        type: Boolean
    },
    KeywordStartFriday: {
        type: Boolean
    },
    KeywordStartSaturday: {
        type: Boolean
    },
    KeywordTimeFrom: {
        type: String
    },
    KeywordTimeTo: {
        type: String
    },
    KeywordTimes: {
        type: Number
    },
    KeywordFrequency: {
        type: String
    },
    KeywordQueryRecord: {
        type: Date
    },
    // KeywordSearchWeb: {
    //     type: Number
    // },
    // 經濟部本部新聞
    KeywordSearchMOEA: {
        type: Boolean
    },
    KeywordMOEA: {
        type: String
    },
    // 投審會最新公告
    KeywordSearchMOEAIC: {
        type: Boolean
    },
    KeywordMOEAIC: {
        type: String
    },
    // 科技部新聞資料
    KeywordSearchMOST: {
        type: Boolean
    },
    KeywordMOST: {
        type: String
    },
    // 公開資訊觀測站即時重大訊息
    KeywordSearchMOPS: {
        type: Boolean
    },
    // Google搜尋引擎查詢
    KeywordSearchGOOGLE: {
        type: Boolean
    },
    KeywordGOOGLE: {
        type: String
    },
    KeywordValid: {
        type: Boolean
    },
});

module.exports = mongoose.model('Keywords', PostSchema);