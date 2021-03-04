"use strict"

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const saltRounds = 12;
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
const config = require('config');
const ejs = require("ejs");
const asyncLoop = require('node-async-loop');
const sequelize = require("sequelize");
const Op = sequelize.Op;
const formidable = require('formidable');
const moment = require('moment');
const path = require('path'),
    fs = require('fs');
const form = new formidable.IncomingForm();

const app_route = config.get('app_route');

class UserManager {

    constructor(wagner) {
        this.User = wagner.get("User");        
    }


    

    

    
    
    async changePassword(params){
        try{
            const JWT_KEY = config.get('JWT_KEY');
            const JWT_HASH = config.get('JWT_HASH');
            const token = params.headers.authorization.split(' ')[1]; // Bearer <token>
            let decoded = await jwt.verify(token, JWT_KEY, { algorithm: JWT_HASH });
            let hash = await bcrypt.hash(params.body.password, saltRounds);
            if (!decoded) {
                return({
                    success : false,
                    status: 422,
                    message: "Token not valid"
                })
            }
            let exist =  await this.User.findOne({
                                         where: {id: decoded.user.id}
                                        });

            if(exist == null){
                return({
                    success : false,
                    status: 400,
                    message: "Record doesn't exists"

                })
            }else{

                let hash2 = await bcrypt.compare(params.body.oldpassword, exist.password);
                if(hash2){

                    let update = await this.User.update({password:hash},{
                                                    where: {id: decoded.user.id}
                                                    });
                     if(update){
                        return({
                            success : true,
                            status: 200,
                            message:  "Password updated successfully"
                         })
                     }else{
                        return({
                            success : false,
                            status: 400,
                            message: "An error occured"
                        })
                     }

                }else{
                    return({
                        success : false,
                        status: 400,
                        message: "Current password is incorrect"
                    })

                }




            }
        } catch (e) {
            console.log(e);
            return({
                success : false,
                status: 400,
                error: e
            })

        }
    }
}

module.exports = UserManager;
