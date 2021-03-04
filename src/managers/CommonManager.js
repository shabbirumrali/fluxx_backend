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
const stripe = require('stripe')( config.get('STRIPE_ID') );
const app_route = config.get('app_route');
const { base64encode, base64decode } = require('nodejs-base64');

class CommonManager {
    constructor(wagner) {
        this.Regions = wagner.get("Regions");        
        this.Markets = wagner.get("Markets");
        this.Switches = wagner.get("Switches");
    }
    async getRegions(params) {
        try {
            let decoded = base64decode(params.headers.authorization);         
            let regions = [];
            if(decoded == '') {
                return({
                     success : false,
                     status_code : 422,
                     message: "Token not valid"
                 })                     
            }else{
                regions =  await this.Regions.findAll({});                  
                return({
                    success : true,
                    status : 200,
                    message:"Regions List",
                    regions: regions
                }) 
            }
        }catch(e){
            return({
                success : false,
                status : 400,
                messsage: "Internal server error.",
                error : e
            })
       }
    }
    async getMarkets(params) {       
        let id = params.params.region_id;
        try {
            let decoded = base64decode(params.headers.authorization);         
            
            if(decoded == '') {
                return({
                     success : false,
                     status_code : 422,
                     message: "Token not valid"
                 })                     
            }else{
             let  markets =  await this.Markets.findAll({
                                    where: {
                                regionId : id 
                            } 
                });                
                return({
                    success : true,
                    status : 200,
                    message:"Market List",
                    markets: markets
                }) 
            }
        }catch(e){
            return({
                success : false,
                status : 400,
                messsage: "Internal server error.",
                error : e
            })
       }
    }
    async getSwitches(params) {
        let id = params.params.market_id;      
        try {
            let decoded = base64decode(params.headers.authorization);
            
            if(decoded == '') {
                return({
                     success : false,
                     status_code : 422,
                     message: "Token not valid"
                 })                     
            }else{
                let switches =  await this.Switches.findAll({
                                    where: {
                                marketId : id 
                            } 
                });                
                return({
                    success : true,
                    status : 200,
                    message:"Switches List",
                    switches: switches
                }) 
            }
        }catch(e){
            console.log(e);
            return({
                success : false,
                status : 400,
                messsage: "Internal server error.",
                error : e
            })
       }
    }
} 
module.exports = CommonManager;   
            
            