"use strict"
const { check } = require('express-validator');
    module.exports = [
        check('manager_id').notEmpty().withMessage('Manager id is required').bail().withMessage('Manager id is required')
    ];