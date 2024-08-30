const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");

// also restructured users 8/23/24
// contains register routes
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// contains login routes
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// LOGOUT ROUTE
router.get('/logout', users.logout)
module.exports = router;