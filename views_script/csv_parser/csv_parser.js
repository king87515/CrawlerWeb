const csv = require('csv-parser');
const fs = require('fs');
const path = require("path");


const ListedCompany = require('../../models/ListedCompany');
const NonListedCompany = require('../../models/NonListedCompany');
const ListedMachineryCompany = require('../../models/ListedMachineryCompany');
const ListedMachineryKeyword = require('../../models/ListedMachineryKeyword');

const GoogleKeyword = require('../../models/GoogleKeyword');

module.exports = {
    parser_setup: async function () {
        fs.createReadStream(path.join(__dirname, '上市櫃公司名稱關鍵字.csv'), 'utf8')
            .pipe(csv())
            .on('data', async (row) => {
                // console.log(row.CompanyCode);
                // console.log(row.CompanyAbbreviation);
                const newListedCompany = new ListedCompany({
                    CompanyCode: row.CompanyCode,
                    CompanyAbbreviation: row.CompanyAbbreviation
                });
                const savedPerPost = await newListedCompany.save();
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });

        fs.createReadStream(path.join(__dirname, '未上市櫃公司名稱關鍵字.csv'), 'utf8')
            .pipe(csv())
            .on('data', async (row) => {
                // console.log(row);
                const newNonListedCompany = new NonListedCompany({
                    CompanyAbbreviation: row.CompanyAbbreviation
                });
                const savedPerPost = await newNonListedCompany.save();
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });

        fs.createReadStream(path.join(__dirname, '上市櫃機械設備與零組件公司.csv'), 'utf8')
            .pipe(csv())
            .on('data', async (row) => {
                // console.log(row);
                const newListedMachineryCompany = new ListedMachineryCompany({
                    CompanyCode: row.CompanyCode,
                    CompanyAbbreviation: row.CompanyAbbreviation
                });
                const savedPerPost = await newListedMachineryCompany.save();
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });

        fs.createReadStream(path.join(__dirname, '篩選公告用之關鍵字.csv'), 'utf8')
            .pipe(csv())
            .on('data', async (row) => {
                // console.log(row['﻿Keyword']);
                const newListedMachineryKeyword = new ListedMachineryKeyword({
                    MachineryKeyword: row['﻿Keyword']
                });
                const savedPerPost = await newListedMachineryKeyword.save();
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });

        var item = ['投資', '新廠', '億'];
        for (var i = 0; i < item.length; i++) {
            const newGoogleKeyword = new GoogleKeyword({
                GoogleSearchKeyword: item[i]
            });
            const savedPerPost = await newGoogleKeyword.save();
        }
    }
}