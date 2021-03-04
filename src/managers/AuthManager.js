"use strict"

const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');
let saltRounds = 12;
let jwt = require('jsonwebtoken');
const mail = require('../utils/dependencies/MailHelper');
const config = require('config');
const ejs = require("ejs");
const app_route = config.get('app_route');
const frontend_url = config.get('frontend_url');

class AuthManager {
    constructor(wagner) {
        this.User = wagner.get("User");
        this.mail = wagner.get("MailHelper");
    }
    async checkToken( params ){

        const JWT_KEY = config.get('JWT_KEY');
        const JWT_HASH = config.get('JWT_HASH');

        const authorizationHeaader = params.headers.authorization;
        const auth_token = params.headers.authorization.split(' ')[1];

        var decodedValue = jwt.verify(auth_token, JWT_KEY);
        const user_id = decodedValue.user.id;

        let user = await this.User.findOne({
            where: {
                id : user_id
            }
        });
        if(user){
            var response = {
                success : true,
                message:"Token valid",
                data:user
            }
        }else{
            var response = {
                success : false,
                message:"Token not valid",
                data:{}
            }
        }
        return response;
    }
  async register(params) {
        try {
            let userdata =  await this.User.findOne({where: {email: params.email}
            });
            if(userdata){
                return({
                    success : false,
                    status : 422,
                    messsage: 'Email Already exists',
                   data:{}
                });

            }else{
           
             let hashPassword = await bcrypt.hash(params.password, saltRounds);

             let user = await this.User.create({
                email: params.email,
                password: hashPassword,
                status: 1
                
            });

            if (user) {
                /*sendmail*/
                

                const emailTemplate = await ejs.renderFile(__dirname + "/../views/email_templates/account_email.ejs",
                    {
                        name: "",
                        email:user.email,
                        password:params.password,
                        role:"",
                        phone:""
                    }
                );

                let emailParams = ({
                    from    : config.get('SENDER_EMAIL'),
                    to      : user.email,
                    subject : "New Account Created",
                    html    : emailTemplate
                });

                let sendMailfunc = await this.mail.sendMail(emailParams);
                console.log(sendMailfunc);
                if (sendMailfunc){
                    var message = "Your account has been successfully created. You will be redirected to login in a few seconds."
                }
                else{
                    var message = "Your account has been successfully created. You will be redirected to login in a few seconds."
                }
                return({
                    success : true,
                    status : 200,
                    messsage: '',
                    data: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        phone: user.phone
                    }
                });
            } else {
                console.log('dsds');
                return({
                    success : false,
                    status : 400,
                    messsage: "Oops problem in creating user, Please try again."
                })
            }
          }
        } catch (e) {
            console.log(e);
            return({
                success : false,
                status : 400,
                messsage: "Internal server error.",
                "error": e
            })
        }
    }

    async login(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');
            let emailId = params.email;
            let password = params.password;
            let user = await this.User.findOne({where: {email : emailId } });

            if (!user) {
                return({
                    success : false,
                    status : 422,
                    message: "Email not found"
                })
            }
            if(user.status == false){
                return({
                    success : false,
                    status : 422,
                    message: "Account is disabled"
                })
            }

            let hash = await bcrypt.compare(password, user.password);

            if (hash) {
                let token = await jwt.sign({ user: user }, JWT_KEY, { algorithm: JWT_HASH });
                    if (!token) {
                        console.log(err);
                        return({
                            status: 422,
                            success : false,
                            "error": err
                        })
                    }
                    return({
                        success: true,
                        status: 200,
                        "message": "Login successfully",
                        user: {
                            id: user.id,
                            role: user.role,
                            token: token,
                            email:user.email
                            }
                    })

            } else {
                return({
                    status: 422,
                    success : false,
                    message: 'Incorrect password'
                })
            }

        } catch (e) {
            return({
                status: 422,
                success : false,
                "error": e
            })
        }
    }

    async forgot_password(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');
            const email = params.email;
            let user = await this.User.findOne({where: { email: email }});
            console.log(user);

            if (!user) {
                return({
                    success : false,
                    status : 400,
                    message: "Email not found"
                })
            }
            let token = await jwt.sign({ id: user.id }, JWT_KEY, {
                algorithm: JWT_HASH,
                expiresIn: '1h'
            });
            console.log(token);
            if (!token) {
                return({
                    success : false,
                    status : 400,
                    message: "Oops problem in creating reset password token."
                })
            }

            let update = await user.update({
                reset_token: token
            });
            const emailTemplate = await ejs.renderFile(__dirname + "/../views/email_templates/forgetpassword.ejs",
                { name: user.first_name, link: frontend_url + 'reset_password/' + token });
            let emailParams = ({
                from    : config.get('SENDER_EMAIL'),
                to      : email,
                subject : 'Reset Password',
                html : emailTemplate
            });
            let sendMailfunc = await this.mail.sendMail(emailParams);
            if (sendMailfunc){

                return({
                    success : true,
                    status: 200,
                    message: "Email link sent successfully"                    
                })
            }
        } catch (e) {
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }

    async reset_password(params) {

        try {

            const reset_token = params.reset_token;
            console.log('12121');
            console.log(reset_token);
            const password = params.password;

            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');
            let user = await this.User.findOne({
                where: { reset_token: reset_token }//checking if the email address sent by client is present in the db(valid)
            });

            if (user) {
                let decoded = await jwt.verify(reset_token, JWT_KEY, { algorithm: JWT_HASH });

                let hashPassword = await bcrypt.hash(params.password, saltRounds);

                let update = await user.update({
                    password: hashPassword,
                    reset_token: null
                });
                return({
                    success : true,
                    status : 200,
                    message: "Password resetted successfully. You will be redirected to login screen."
                })
            } else {
                return({
                    success : false,
                    status : 400,
                    message: "Invalid reset token."
                })
            }
        } catch (e) {
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }

    async contactus(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');
            const email = params.email;
            const firstname = params.firstname;
            const lastname = params.lastname;
            const subject = params.subject;
            const description = params.description;            
            const emailTemplate = await ejs.renderFile(__dirname + "/../views/email_templates/contact_us.ejs",
                { firstname: firstname,lastname:lastname,email:email,subject:subject,description:description });
            let emailParams = ({
                from    : email,
                to      : config.get('SENDER_EMAIL'),
                subject : 'Contact Us',
                html : emailTemplate
            });
            let sendMailfunc = await this.mail.sendMail(emailParams);
            if (sendMailfunc){

                return({
                    success : true,
                    status: 200,
                    message: "Email sent successfully"                   
                })
            }
        } catch (e) {
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }
}

module.exports = AuthManager;
