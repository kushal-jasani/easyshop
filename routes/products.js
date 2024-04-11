const express=require('express');
const { isAuth } = require('../middleware/is-auth');
const router=express.Router();
const productController=require('../controller/products');

router.get('/category-list',isAuth,productController.categoryListBusiness);
router.post('/category-list/addcategory',isAuth,productController.addCategory)

router.get('/products',productController.getProducts);
router.get('/products/category-list',productController.getCategoryListUser);
router.get('/products/category-list/:categoryId',productController.getSubcategoryOfCategory);

// router.post('/products',productController.addProducts);
router.get('/products/:productId',productController.getProductDetail);


module.exports=router;