const express = require("express");
const path = require("path");
const root = require("../util/path");
const authcontroller = require("../controller/auth");
const {isAuth}=require('../middleware/is-auth')
const router = express.Router();

router.post("/login", authcontroller.postLogin);
router.post("/login/verify-otp", authcontroller.varifyOtpLogin);
router.post("/resendOtp", authcontroller.resendOtp);

router.post("/register", authcontroller.postRegister);
router.post("/register/verify-otp", authcontroller.varifyOtpRegister);

router.post('/changepassword',isAuth,authcontroller.postChangePassword)
router.post('/resetpassword',isAuth,authcontroller.resetPasswordLink)
router.post('/resetpassword/:resettoken',isAuth,authcontroller.postResetPassword)


module.exports = router;
