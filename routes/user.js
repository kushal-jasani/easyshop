const express = require("express");
const {isAuth}=require('../middleware/is-auth')
const router = express.Router();
const usercontroller=require('../controller/user')

router.get('/userprofile/accountdetails',isAuth,usercontroller.getUserDetails)
router.post('/userprofile/',isAuth,usercontroller.postUpdateDetails);
router.get('/userprofile/cards',isAuth,usercontroller.getCardsDetails);
router.post('/userprofile/cards',isAuth,usercontroller.postCardsDetails);

router.get('/userprofile/address',isAuth,usercontroller.getAddressDetails);
router.post('/userprofile/address',isAuth,usercontroller.postAddressDetails);

module.exports=router