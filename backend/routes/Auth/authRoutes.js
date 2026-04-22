const express = require('express');
const router = express.Router();
const { login, register } = require('../../controllers/Auth/authController');

const { body } = require('express-validator');

const loginValidation = [
    // Allow either a valid email OR the specific 'admin' username used for Boss
    body('email')
        .notEmpty().withMessage('Email or username is required')
        .custom((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isAdmin = value.trim().toLowerCase() === 'admin';
            if (!isEmail && !isAdmin) {
                throw new Error('Please provide a valid email or admin username');
            }
            return true;
        }),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

module.exports = router;
