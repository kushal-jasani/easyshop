const express = require("express");
const {isAuth}=require('../middleware/is-auth')
const router = express.Router();
const usercontroller=require('../controller/user')

router.get('/userprofile/accountdetails',isAuth,usercontroller.getUserDetails)
router.post('/userprofile/',isAuth,usercontroller.postUpdateDetails);

module.exports=router