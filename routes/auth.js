const express = require("express");
const authcontroller = require("../controller/auth");
const { isAuth } = require("../middleware/is-auth");
const { upload } = require("../uploads/multer");
const router = express.Router();

router.post("/login", authcontroller.postLogin);
router.post("/login/verify-otp", authcontroller.varifyOtpLogin);
router.post("/resendOtp", authcontroller.resendOtp);

router.post(
  "/register",
  upload.fields([
    { name: "aadharphoto", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  authcontroller.postRegister
);
router.post(
  "/register/verify-otp",
  upload.fields([
    { name: "aadharphoto", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  authcontroller.varifyOtpRegister
);

// router.post("/register/verify-otp", authcontroller.varifyMasterOtpRegister);

router.post("/changepassword", isAuth, authcontroller.postChangePassword);
router.post("/resetpassword", isAuth, authcontroller.resetPasswordLink);
router.post(
  "/resetpassword/:resettoken",
  isAuth,
  authcontroller.postResetPassword
);

module.exports = router;
