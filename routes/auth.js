const express = require("express");
const path = require("path");
const root = require("../util/path");
const authcontroller = require("../controller/auth");
const {isAuth}=require('../middleware/is-auth')
const router = express.Router();

router.post("/auth/login", authcontroller.postLogin);
router.post("/auth/register", authcontroller.postRegister);
router.post('/auth/changepassword',isAuth,authcontroller.postChangePassword)
router.post('/auth/resetpassword',isAuth,authcontroller.resetPasswordLink)
router.post('/auth/resetpassword/:resettoken',isAuth,authcontroller.postResetPassword)


module.exports = router;
