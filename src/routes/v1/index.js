const registerValidation    = require('../../validation/register');
const profileValidation    = require('../../validation/profile');
const addUserValidation    = require('../../validation/addUser');
const linkManagerValidation = require('../../validation/linkUser');
const { check, validationResult } = require('express-validator');

const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const validateToken = require('../../middlewares/validate_token').validateToken;
const formidable = require('formidable');

const fs = require('file-system');
const config = require('config');

module.exports = (app, wagner) => {
    app.get('/v1/', (req, res) => res.status(200).send({
        message: "Welcome to Flux apis",
    }));
    app.post('/v1/register', [
        check('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),

       // check('first_name').notEmpty().withMessage('first name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('First Name should be 3-20 characters long'),

        //check('last_name').notEmpty().withMessage('last name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('last name should be 3-20 characters long'),

        check('password').notEmpty().withMessage('password is required').bail().isLength({ min: 6 }).withMessage('Minimum 6 characters are required'),

        //check('phone').notEmpty().withMessage('phone number is required').bail().isNumeric().withMessage('phone number must be numeric').isLength({ min: 6, max:12 }).withMessage('phone number is not valid')

    ], (req, res, next)=>{
        
        let errors = validationResult(req); 
             
        if(!errors.isEmpty()){
            res.status(422).json({
                message: "Validations errors",
                errors: errors.array()
            });
        } else{
            wagner.get('AuthManager').register(req.body).then(user=>{
                if(user){
                    res.status(200).json(user)
                }
                else{
                    res.status(400).json(user)
                }
            }).catch(error=>{
                next(error);
            })
        }
    });

    /*Login*/

    app.post('/v1/login', [
        check('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),
        check('password').notEmpty().withMessage('password is required').bail().isLength({ min: 8 }).withMessage('Password must be minimum 8 characters')
    ], (req, res, next)=>{
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json({
                message: "Validations errors",
                errors: errors.array()
            });
        }
        wagner.get('AuthManager').login(req.body).then(user=>{
            if(user){
            	console.log(user);
                res.status(200).json(user)
            }
            else{
                res.status(400).json(user)
            }
        }).catch(error=>{
            next(error);
        });
    });
    /*Forget Password*/
    app.post('/v1/forgot_password', [
        check('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid')
    ], (req, res, next)=>{
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json({
                message: "Validations errors",
                errors: errors.array()
            });
        }
        wagner.get('AuthManager').forgot_password(req.body).then(user=>{
            if(user){
                res.status(200).json(user)
            }
            else{
                res.status(400).json(user)
            }
        }).catch(error=>{
            next(error);
        });
    });


    /*Reset Password*/
    app.post('/v1/reset_password',[
        check('password').notEmpty().withMessage('password is required').bail().isLength({ min: 6 }).withMessage('Minimum 6 characters are required'),
        check('reset_token').notEmpty().withMessage('Reset Token is required').bail().withMessage('Token Missing'),
    ], (req, res, next)=>{
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json({
                message: "Validations errors",
                errors: errors.array()
            });
        }
        wagner.get('AuthManager').reset_password(req.body).then(user=>{
            if(user){
                res.status(200).json(user)
            }
            else{
                res.status(400).json(user)
            }
        }).catch(error=>{
            next(error);
        });
    });

    /*contact us */
    /*Reset Password*/
    app.post('/v1/contactus',[
        check('firstname').notEmpty().withMessage('firstname is required').bail().isLength({ min: 6 }).withMessage('Minimum 6 characters are required'),
        check('lastname').notEmpty().withMessage('lastname is required').bail().isLength({ min: 6 }).withMessage('Minimum 6 characters are required'),
        check('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),
        check('subject').notEmpty().withMessage('subject is required').bail().isLength({ min: 10 }).withMessage('Minimum 10 characters are required'),
        check('description').notEmpty().withMessage('description is required').bail().isLength({ min: 20 }).withMessage('Minimum 20 characters are required'),
    ], (req, res, next)=>{
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json({
                message: "Validations errors",
                errors: errors.array()
            });
        }
        wagner.get('AuthManager').contactus(req.body).then(user=>{
            if(user){
                res.status(200).json(user)
            }
            else{
                res.status(400).json(user)
            }
        }).catch(error=>{
            next(error);
        });
    });



}

