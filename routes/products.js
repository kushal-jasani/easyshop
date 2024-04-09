const express=require('express');
const { isAuth } = require('../middleware/is-auth');
const router=express.Router();
const productController=require('../controller/products');

router.get('/category-list',isAuth,productController.categoryList);
router.post('/category-list/addcategory',isAuth,productController.addCategory)

router.get('/products',productController.getProducts);

module.exports=router;