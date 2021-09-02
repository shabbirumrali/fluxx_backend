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
        this.Category = wagner.get("Category");
        this.CategoryProject = wagner.get("CategoryProject");
        this.project  = wagner.get("Project");
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
                    message: "Account is not Existed"
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
                        "message": "Login successful",
                        user: {
                            id: user.id,
                            role: user.role,
                            token: token,
                            email:user.email,
                            subscribe:user.subscribeUser
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
     async createCategory(params) {
        try {
            console.log(params.body);
            console.log('sdsd');
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];

            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
                
            }
              let Category = await this.Category.create({
                categoryname: params.body.categoryname,
                userId:user_id                   
              });
              if(Category){
                return({
                    success : true,
                    status : 200,
                    message: "Category Created successfully."
                })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
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
    async createCharter(params) {
       
        try {
            
            
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            console.log('+++++++++++'+user_id);
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
                
            }
            let checkCharter =  await this.project.findOne({where: {name: params.body.name}});

            
            if(checkCharter){ 
                 console.log(params.body.goal); 
                console.log(typeof checkCharter.goal);
                let containdata = checkCharter.goal.includes("goallist");

                console.log(containdata+"hjkjhkhj");

                if(params.body.goal != undefined){
                    if(params.body.goal.length>0){
                        if(params.body.goal[0].goal == undefined){
                            console.log('sdfsdfds');
                            params.body.goal = JSON.parse(checkCharter.goal);
                        }

                        
                    }
                }
                if(typeof checkCharter.goal == 'string' && checkCharter.goal.includes("goallist") == false){
                    checkCharter.goal = '';
                }else{
                    checkCharter.goal = JSON.parse(checkCharter.goal);
                }
                if(params.body.benefits != undefined){
                    if(params.body.benefits.length>0){
                        if(params.body.benefits[0].benefits == undefined){
                            params.body.benefits = JSON.parse(checkCharter.benefits);
                        }
                    }
                }
                if(typeof checkCharter.InScope == 'string' && checkCharter.InScope.includes("goallist") == false){
                    checkCharter.InScope = '';
                }else{
                    checkCharter.InScope = JSON.parse(checkCharter.InScope);
                }
                if(params.body.InScope != undefined){
                    if(params.body.InScope.length>0){
                        if(params.body.InScope[0].InScope == undefined){
                            params.body.InScope = JSON.parse(checkCharter.InScope);
                        }
                    }
                }

                if(typeof checkCharter.outScope == 'string' && checkCharter.outScope.includes("goallist") == false){
                    checkCharter.outScope = '';
                }else{
                    checkCharter.outScope = JSON.parse(checkCharter.outScope);
                }
                if(params.body.outScope != undefined){
                    if(params.body.outScope.length>0){
                        if(params.body.outScope[0].outScope == undefined){
                            params.body.outScope = JSON.parse(checkCharter.outScope);
                        }
                    }
                }
                console.log(checkCharter);

                if(typeof checkCharter.benefits == 'string' && checkCharter.benefits.includes("goallist") == false){
                    checkCharter.benefits = '';
                }else{
                    checkCharter.benefits = JSON.parse(checkCharter.benefits);
                }
                
                if(params.body.impact != undefined){
                    if(params.body.impact.length>0){
                        if(params.body.impact[0].impact == undefined){
                            params.body.impact = JSON.parse(checkCharter.impact);
                        }
                    }
                }
                if(typeof checkCharter.impact == 'string' && checkCharter.impact.includes("goallist") == false){
                    checkCharter.impact = '';
                }else{
                    checkCharter.impact = JSON.parse(checkCharter.impact);
                }
                
                if(params.body.stakeholder != undefined){
                    if(params.body.stakeholder.length>0){
                        if(params.body.stakeholder[0].stakeholder == undefined){
                            params.body.stakeholder = JSON.parse(checkCharter.stakeholder);
                        }
                    }
                } 
                if(typeof checkCharter.stakeholder == 'string' && checkCharter.stakeholder.includes("goallist") == false){
                    checkCharter.stakeholder = '';
                }else{
                    checkCharter.stakeholder = JSON.parse(checkCharter.stakeholder);
                }
               
                if(params.body.risks != undefined){
                    if(params.body.risks.length>0){
                        if(params.body.risks[0].risks == undefined){
                            params.body.risks = JSON.parse(checkCharter.risks);
                        }
                    }
                }
                if(typeof checkCharter.risks == 'string' && checkCharter.risks.includes("goallist") == false){
                    checkCharter.risks = '';
                }else{
                    checkCharter.risks = JSON.parse(checkCharter.risks);
                }
                if(params.body.assumptionTime != undefined){
                    if(params.body.assumptionTime.length>0){
                        if(params.body.assumptionTime[0].assumptionTime == undefined){
                            params.body.assumptionTime = JSON.parse(checkCharter.assumptionTime);
                        }
                    }
                }
                if(typeof checkCharter.assumptionTime == 'string' && checkCharter.assumptionTime.includes("goallist") == false){
                    checkCharter.assumptionTime = '';
                }else{
                    checkCharter.assumptionTime = JSON.parse(checkCharter.assumptionTime);
                }

                let updateObject = {
                    name: params.body.name,
                    userId:user_id,
                    project_manager: params.body.project_manager ? params.body.project_manager: checkCharter.project_manager,
                    project_sponsor: params.body.project_sponsor ? params.body.project_sponsor : checkCharter.project_sponsor,
                    project_need: params.body.project_need ? params.body.project_need: checkCharter.project_need,
                    goal: params.body.goal ? params.body.goal:checkCharter.goal,
                    benefits: params.body.benefits ? params.body.benefits :checkCharter.benefits,
                    InScope: params.body.InScope ? params.body.InScope :checkCharter.InScope,
                    outScope: params.body.outScope ? params.body.outScope :checkCharter.outScope,
                    startDate: params.body.startDate ? params.body.startDate :checkCharter.startDate,
                    finishDate: params.body.finishDate ? params.body.finishDate :checkCharter.finishDate,
                    budget: params.body.budget ? params.body.budget:checkCharter.budget,
                    assumptionTime: params.body.assumptionTime ? params.body.assumptionTime:checkCharter.assumptionTime,
                    impact: params.body.impact ? params.body.impact :checkCharter.impact,
                    stakeholder: params.body.stakeholder ? params.body.stakeholder :checkCharter.stakeholder,
                    risks: params.body.risks ? params.body.risks :checkCharter.risks,
                    assignCat:params.body.assignCat ? params.body.assignCat: 0,
                    step:params.body.step ? params.body.step:checkCharter.step
                 };
                 console.log(updateObject);
                let charter = await this.project.update(updateObject,{ where: { id: checkCharter.id } });
                if(charter){
                    return({
                        success : true,
                        status : 200,
                        message: "Charter update successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
                }

            }else{

              let charter = await this.project.create({
                    name: params.body.name,
                    userId:user_id,
                    project_manager: params.body.project_manager ? params.body.project_manager: "",
                    project_sponsor: params.body.project_sponsor ? params.body.project_sponsor : "",
                    project_need: params.body.project_need ? params.body.project_need: "",
                    goal: params.body.goal ? params.body.goal:"",
                    benefits: params.body.benefits ? params.body.benefits :"",
                    InScope: params.body.InScope ? params.body.InScope :"",
                    outScope: params.body.outScope ? params.body.outScope :"",
                    startDate: params.body.startDate ? params.body.startDate :null,
                    finishDate: params.body.finishDate ? params.body.finishDate :null,
                    budget: params.body.budget ? params.body.budget:"",
                    assumptionTime: params.body.assumptionTime ? params.body.assumptionTime:"",
                    impact: params.body.impact ? params.body.impact :"",
                    stakeholder: params.body.stakeholder ? params.body.stakeholder :"",
                    risks: params.body.risks ? params.body.risks :"",
                    assignCat:params.body.assignCat ? params.body.assignCat: 0,
                    step:params.body.step ? params.body.step:""
              });
              if(charter){
                    return({
                        success : true,
                        status : 200,
                        message: "Charter Created successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
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
     async charterlist(params) {
        try {
          
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
                
            }else{
                
                let charterlist =  await this.project.findAll({where: {
                                userId : user_id,
                                 
                            },
                            order: [
                               ['id', 'DESC'],
                               ['name', 'ASC'],
                             ]
                });
                return({
                        success : true,
                        status : 200,
                        charterlist:charterlist,
                        message: "Charter Created successfully."
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
    async renameCharter(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkCharter =  await this.project.findOne({where: {id: params.body.charterid}});

            
            if(checkCharter){
                
                let charter = await this.project.update({
                    name: params.body.newchartername,                    
                 },{ where: { id: params.body.charterid } });
                if(charter){
                    return({
                        success : true,
                        status : 200,
                        message: "Charter update successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
                }

            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }  
    async deleteCharter(params) {
      
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkCharter =  await this.project.destroy({where: {id: params.body.charterid}});
            if(checkCharter){
                    return({
                        success : true,
                        status : 200,
                        message: "Charter delete successfully."
                    })

            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    } 
    async fetchcharter(params) {
        try {
          
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })                
            }else{  
                let charterlist =  await this.project.findOne({where: {name: params.params.chartername}});
                return({
                        success : true,
                        status : 200,
                        charterlist:charterlist,
                        message: "Charter Data"
                    })
            }
            
        } catch (e) {
            //console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    } 

    async fetchcategory(params) {
        try {
          
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })                
            }else{  
                let categoryList =  await this.Category.findAll({
                    where: { userId: user_id },
                    order: [
                        ['id', 'DESC']
                    ]
                });
                return({
                        success : true,
                        status : 200,
                        categoryList:categoryList,
                        message: "Category List"
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

    async updateCharterCategory(params) {
        try {
            console.log(params.body);
           
          
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })                
            }else{
                if(params.body.categoryId == "uncategorized"){
                    console.log('sdfsdfsdfsdfsdf');
                    let checkCharter =  await this.CategoryProject.destroy({where:{id:params.body.movefromcat}});
                    let updateCharter = await this.project.update({
                                                                    assignCat: 0,                    
                                                                 },{ where: { id: params.body.projectId } });
                    if(updateCharter){
                        let categoryList =  await this.CategoryProject.destroy({where:{categoryId:params.body.currentCategory,
                                                                              projectId:params.body.projectId,
                                                                              userId:user_id 
                                                                          }
                                                                      });
                        return({
                                success : true,
                                status  : 200,
                                message : "Charter moved successfully"
                              })
                    } 
                }else{
                    console.log('++++++++++++sdfsdfsdfsdfsdf');
                    console.log(params.body)
                    let checkCharter =  await this.CategoryProject.destroy({where:{id:params.body.movefromcat}});
                    let updateCharter = await this.project.update({
                                                                    assignCat: 1,                    
                                                                 },{ where: { id: params.body.projectId } });
                    if(updateCharter){
                
                    let categoryList =  await this.CategoryProject.create({
                                                    categoryId: params.body.categoryId,
                                                    projectId:params.body.projectId,
                                                    projectname:params.body.projectname,
                                                    userId:user_id                   
                                                  });
                    
                    
                    return({
                            success : true,
                            status  : 200,
                            message : "Charter moved successfully"
                          })
                    }
                }
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
    async lockAccount(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            console.log(params.body);
            console.log(user_id)
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkUser =  await this.User.findOne({where: {id: user_id}});
            let hash      =  await bcrypt.compare(params.body.password, checkUser.password);            
            if(hash){                
                let charter = await this.User.update({
                    status: 0,                    
                 },{ where: { id: user_id } });
                if(charter){
                    return({
                        success : true,
                        status : 200,
                        message: "User Deactive successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
                }

            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }  
    async changeEmail(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkUser =  await this.User.findOne({where: {id: user_id}});
            if(checkUser){
                let charter = await this.User.update({
                    email: params.body.email,                    
                 },{ where: { id: user_id } });
                if(charter){
                    return({
                        success : true,
                        status : 200,
                        message: "Email Update successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
                }  
            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    }
    async fetchcategoryprojects(params){
        try {   
       // console.log(params);       
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })                
            }else{  
                let categoryList = await this.Category.findAll(
                     { 
                        where: { id: params.params.categoryId },
                        include: [
                            {
                                model: this.CategoryProject, 
                            }
                        ]
                    });
                return({
                        success : true,
                        status : 200,
                        categoryList:categoryList,
                        message: "Category List"
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
    async deleteFolder(params) {
        try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkCharter =  await this.Category.destroy({where:{id:params.body.folderid}});
            if(checkCharter){
                    return({
                        success : true,
                        status : 200,
                        message: "Folder delete successfully."
                    })
            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }
    } 
    async renameFolder(params){
          try {
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkCharter =  await this.Category.update({categoryname: params.body.newfoldername},
                                                           {where:{id:params.body.folderid}});
            if(checkCharter){
                    return({
                        success : true,
                        status : 200,
                        message: "Folder rename successfully."
                    })
            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
            }
        }catch (e){
            console.log(e);
            return({
                success : false,
                status: 422,
                error: e
            })
        }


    }

    async updatepassword(params) {

        try {
            console.log(params);

            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');           
            const auth_token = params.headers.authorization.split(' ')[1];
            const decodedValue = jwt.verify(auth_token, JWT_KEY);
            const user_id = decodedValue.user.id;
            if(!decodedValue){                  
                return({
                    success : false,
                    status : 422,
                    message: "Token Not valid"
                })
            }
            let checkUser =  await this.User.findOne({where: {id: user_id}});
            if(checkUser){
                let hashPassword = await bcrypt.hash(params.body.newpassword, saltRounds);
                let updatepassw = await this.User.update({
                    password: hashPassword,                    
                 },{ where: { id: user_id } });
                if(updatepassw){
                    return({
                        success : true,
                        status : 200,
                        message: "Password Update successfully."
                    })
                }else{
                    return({
                        success : false,
                        status : 400,
                        message: "error"
                    })
                } 
            }else{
                 return({
                        success : false,
                        status : 400,
                        message: "error"
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