const express=require('express');
const { isAuth } = require('../middleware/is-auth');
const router=express.Router();
const productController=require('../controller/products');

router.get('/category-list',isAuth,productController.categoryListBusiness);
router.post('/category-list/addcategory',isAuth,productController.addCategory)

router.get('/products',isAuth,productController.getProducts);
router.get('/products/category-list',isAuth,productController.getCategoryListUser);
router.get('/products/category-list/:categoryId',isAuth,productController.getSubcategoryOfCategory);
router.get('/products/category-list/subcategory/:subCategory_id',isAuth,productController.getProductsOfSubcategory);


// router.post('/products',productController.addProducts);
router.get('/products/:productId',isAuth,productController.getProductDetail);

//favourite products
router.post('/products/addtofavourites/:productId',isAuth,productController.postFavouritesProduct);
router.get('/products/favourites/list',isAuth,productController.getFavouritesProducts);
router.delete('/products/favouritres/remove/:productId',isAuth,productController.removeFromFavourites);


module.exports=router;