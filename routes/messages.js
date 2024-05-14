const express=require('express');
const router=express.Router();
const messagecontroller=require('../controller/messages');
const { isAuth } = require('../middleware/is-auth')

router.post('/personal',isAuth,messagecontroller.sendPersonalMessage);
router.post('/group',isAuth,messagecontroller.sendGroupMessage);

module.exports=router;