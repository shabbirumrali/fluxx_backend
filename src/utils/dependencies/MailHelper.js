var nodemailer = require('nodemailer');
const config = require('config');
const transport = nodemailer.createTransport({
    host: config.get('MAIL_HOST'),
    port: config.get('MAIL_PORT'),
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: config.get('MAIL_USERNAME'),
        pass: config.get('MAIL_PASSWORD')
    },
    tls: {
    rejectUnauthorized: false
   }
    
});

class MailHelper {

    constructor(wagner) {
    }

    async sendMail (params) {
        let mailOptions = params;
        let sendMailfun = await transport.sendMail(mailOptions);
        if (!sendMailfun) {
            return({
                success : false,
                status: 400,
                message: "error",
            })  
        } else {
            return({
                success : true,
                status: 200,
                message: "Mail sent",
            }) 
        }         
    }      
}

module.exports = MailHelper