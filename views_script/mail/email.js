//引用 nodemailer
var nodemailer = require('nodemailer');
//宣告發信物件
//低安全性的存取權：開啟
//gmail IMAP存取：開啟
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xxx@gmail.com',
        pass: 'xxx' //'xxx'
    }
});


//發送信件方法
module.exports = {
    // 寄Email
    sendMail: async function (EmailTo, EmailTitle, EmailBody, file) {
        var mailOptions = {
            from: 'xxx@gmail.com',
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