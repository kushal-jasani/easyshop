const express=require('express');
const router=express.Router();
const filterController=require('../controller/filter');

router.get('/filter/:category_id',filterController.categoryFilter)

router.get('/filters',filterController.getFilter)
router.get('/filters/options',filterController.showFilter)


module.exports=router