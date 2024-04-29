const express = require("express");
const {isAuth}=require('../middleware/is-auth')
const router = express.Router();
const usercontroller=require('../controller/user')
const feedcontroller=require('../controller/feed')

const { upload } = require("../uploads/multer");


router.get('/userprofile/accountdetails',isAuth,usercontroller.getUserDetails)
router.post('/userprofile/',isAuth,upload.fields([
    { name: "aadharphoto", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),usercontroller.postUpdateDetails);
router.get('/userprofile/cards',isAuth,usercontroller.getCardsDetails);
router.post('/userprofile/cards',isAuth,usercontroller.postCardsDetails);

router.get('/userprofile/address',isAuth,usercontroller.getAddressDetails);
router.post('/userprofile/address',isAuth,usercontroller.postAddressDetails);

router.get('/userprofile/totalposts',isAuth,feedcontroller.postCount);
router.get('/userprofile/totalfollowers',isAuth,feedcontroller.followerCount);
router.get('/userprofile/totalfollowings',isAuth,feedcontroller.followingCount);


module.exports=router