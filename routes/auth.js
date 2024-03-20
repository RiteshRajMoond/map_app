const express = require("express");
const User = require('../model/user');
const router = express.Router();
const authController = require("../controller/auth");

router.post('/auth/signup', authController.signUp);

router.post('/auth/login', authController.login);

module.exports = router;