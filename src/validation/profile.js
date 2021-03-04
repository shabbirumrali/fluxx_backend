"use strict"
const { check } = require('express-validator');
    module.exports = [

        check('username').notEmpty().withMessage('Username is required').bail().isLength({ min: 4, max:20 }).withMessage('Please enter username between 4-20 charcters'),

        // check('first_name').notEmpty().withMessage('first name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('First Name should be 3-20 chracters long'),

        // check('last_name').notEmpty().withMessage('last name is required').bail().isAlpha().withMessage('Only alphabets are allowed').bail().isLength({ min: 3, max:20 }).withMessage('last name should be 3-20 chracters long'),

        check('phone').notEmpty().withMessage('phone number is required').bail().isNumeric().withMessage('phone number must be numeric').isLength({ min: 6, max:12 }).withMessage('phone number is not valid')
            
    ];