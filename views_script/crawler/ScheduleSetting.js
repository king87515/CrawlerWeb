const Keyword = require('../../models/Keyword');
const SearchMOPSRecord = require('../../models/SearchMOPSRecord');
const crawlerRoutes = require('./crawlerRoutes');
const schedule = require('node-schedule');

const logger = require('./logger');

module.exports = {
    setup: async function () {
        try {
            // 排程初始設定
            const keyword = await Keyword.find();

            for (var i = 0; i < keyword.length; i++) {
                crawlerRoutes.schedule_crawler(keyword[i]);
            }


            console.log('logger.jobs');
            for (var m = 0; m < logger.jobs.length; m++) {
                console.log(logger.jobs[m][0]);
                var temp_jobs = [];
                for (var n = 0; n < logger.jobs[m][1].length; n++) {
                    temp_jobs.push(logger.jobs[m][1][n][1]);
                }
                console.log(temp_jobs.length);
                console.log(temp_jobs);
            }

            console.log('\x1b[36m', '[Schedule] 定時排程初始設定完畢');
        } catch (err) {
            console.log(err);
        }
    },
    searchmopsrecord_setup: async function () {
        try {
            // 重大資訊觀測站每次清空
            const searchmopsrecord = await SearchMOPSRecord.find();
            schedule.scheduleJob('0 0 0 * * *', async function () {
                for (var i = 0; i < searchmopsrecord.length; i++) {
                    await SearchMOPSRecord.updateOne(
                        { _id: searchmopsrecord[i]._id },
                        {
                            $set: {
                                Record_id: searchmopsrecord[i].Record_id,
                                Record_Context: [],
                            }
                        }
                    );
                }
            });
            console.log('\x1b[36m', '[Schedule] 重大資訊觀測站清空');
        } catch (err) {
            console.log(err);
        }
    }
}