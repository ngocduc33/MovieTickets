const mailer = require('nodemailer')

module.exports = function (to, subject, content, callback) {

    let smtpTransport =  mailer.createTransport({

        service: cfMailer.service,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL || 'ltw2nnd@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'erzfrkcjmupomcnt'
          }

      });
    let mail = {
        from: process.env.EMAIL || 'ltw2nnd@gmail.com',
        to: to,
        subject: subject,
        html: content
    };

     smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
            if (callback == null || typeof callback == "undefined") {
            } else {
                callback({error: true, message: "send mail error!"});
            }
        } else {
            if (callback == null || typeof callback == "undefined") {
            } else {
                callback({error: false, message: "send mail success!"});
            }
        }

        // smtpTransport.close();
    });
};