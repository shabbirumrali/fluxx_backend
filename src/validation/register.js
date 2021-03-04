"use strict"
const { check } = require('express-validator');
  
    module.exports = { 
  
        validateEmail: check('email') 
      
            // To delete leading and triling space 
            .trim() 
      
            // Normalizing the email address 
            .normalizeEmail() 
      
            // Checking if follow the email  
            // address formet or not 
            .isEmail() 
      
            // Custom message 
            .withMessage('Invalid email') 
      
            // Custom validation 
            // Validate email in use or not 
            .custom(async (email) => { 
                const existingUser =  
                    await repo.getOneBy({ email }) 
                      
                if (existingUser) { 
                    throw new Error('Email already in use') 
                } 
            }) 
    },
    [
        check('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),        

        // check('first_name').notEmpty().withMessage('first name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('First Name should be 3-20 chracters long'),

        // check('last_name').notEmpty().withMessage('last name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('last name should be 3-20 chracters long'),

        check('password').notEmpty().withMessage('password is required').bail().isLength({ min: 6 }).withMessage('Minimum 6 characters are required'),
        
    ] 
    