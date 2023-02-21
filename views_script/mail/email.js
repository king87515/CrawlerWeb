//引用 nodemailer
var nodemailer = require('nodemailer');
//宣告發信物件
//低安全性的存取權：開啟
//gmail IMAP存取：開啟
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'itriinvesttool@gmail.com',
        pass: 'xknhryfcqtcwolec' //'itri2021'
    }
});

/*
var options = {
    //寄件者
    from: 'icrttesttool@gmail.com',
    //收件者
    to: 'a0928063208@gmail.com',
    //副本
    // cc: 'account3@gmail.com',
    //密件副本
    // bcc: 'account4@gmail.com',
    //主旨
    subject: '這是 node.js 發送的測試信件', // Subject line
    //純文字
    // text: null, // plaintext body
    //嵌入 html 的內文
    html: null,
    //附件檔案
    // attachments: [ {
    //     filename: 'text01.txt',
    //     content: 'ICRT 測試'
    // }, {
    //     filename: 'icrt.jpg',
    //     path: 'img/icrt.png'
    // }]
};
*/

//發送信件方法
module.exports = {
    // 寄Email
    sendMail: async function (EmailTo, EmailTitle, EmailBody, file) {
        var mailOptions = {
            from: 'icrttesttool@gmail.com',
            to: EmailTo,
            subject: EmailTitle,
            html: EmailBody,
            attachments: file,
        };

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
                return "error!";
            } else {
                console.log('Email sent: ' + await info.response);
                return "success!";
            }
        });
    }
}