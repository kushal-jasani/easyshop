const { sendHttpResponse, generateResponse } = require("../helper/response");
const {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
  getCategoryList,
  getProductDetail,
  findSubcategoryOfCategory,
  findProductsOfSubCategory,
  insertIntoFavourite,
  findFavouriteProductsDetails,
  productExistsInFavourite,
  deleteFromFavouriteProductsDetails
} = require("../repository/products");

exports.categoryListBusiness = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [categoryList] = await findCategoryOfBusiness(userId);

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 201,
        status: "success",
        data: { categoryList, businessId: userId },
        msg: "Category data retrived successfully✅",
      })
    );
  } catch (error) {
    console.log("error while getting category");
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error,while getting category",
      })
    );
  }
};

exports.addCategory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [results] = await findRole(userId);

    if (results[0].role != 2) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: "400",
          msg: "Only businesses can add category,you're not authorized to do this!!",
        })
      );
    }

    const { name } = req.body;

    if (!req.files["image"][0]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "You're required to enter image for category",
        })
      );
    }

    const image = req.files["image"][0].path;

    const [result] = await insertCategory(name, image, userId);
    if (result.affectedRows == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "error while inserting category",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 201,
        status: "success",
        data: { name: name, image: image, businessId: userId },
        msg: "Category added successfully✅",
      })
    );
  } catch (error) {
    console.log("error while adding category");
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error,while adding category",
      })
    );
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const [productResults] = await productsMainDetails(userId,limit, offset);

    if (productResults.length === 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "success",
          statusCode: 200,
          msg: "products not found",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: productResults,
        msg: "product data retrived successfully",
      })
    );
  } catch (error) {
    console.log("while fetching products", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while fetching products",
      })
    );
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const productId = req.params.productId;

    const [productDetails] = await getProductDetail(userId,productId);
    // const formattedResponse = {
    //   product_id: productDetails[0].product_id,
    //   title: productDetails[0].title,
    //   price: productDetails[0].price,
    //   description: productDetails[0].description,
    //   additional_info: productDetails[0].additional_info,
    //   images: productDetails[0].images,
    //   specifications: productDetails[0].specifications,
    //   is_favourite:productDetails[0].is_favourite
    // };

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: productDetails,
        msg: "Product details retrived successfully",
      })
    );
  } catch (error) {
    console.log(error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error while fetching product details",
        statusCode: 500,
        msg: "internal server error while getting product details",
      })
    );
  }
};

exports.getCategoryListUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const offset = (page - 1) * limit;
    const [categoryList] = await getCategoryList(limit,offset);

    if (!categoryList || categoryList.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "No category found",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: { categoryList },
        msg: "Category list fetched successfully✅",
      })
    );
  } catch (error) {
    console.log("error in fectching category list", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 400,
        msg: "internal server error while fetching category list",
      })
    );
  }
};

exports.getSubcategoryOfCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;

    const [subCategoryResults] = await findSubcategoryOfCategory(categoryId);
    if (!subCategoryResults || subCategoryResults.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "No subcategory for given category can be found or given catogryid is invalid",
        })
      );
    }
    // const formattedSubCategoryResponse = {
    //   category_id: subCategoryResults[0].category_id,
    //   category_name: subCategoryResults[0].category_name,
    //   subcategories: subCategoryResults[0].subcategories,
    // };
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: subCategoryResults,
        msg: "subcategory data retrived successfully✅",
      })
    );
  } catch (error) {
    console.log("error while getting subcategorys:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while getting subcategory",
      })
    );
  }
};

exports.getProductsOfSubcategory = async (req, res, next) => {
  try {
    const userId=req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const subCategory_id = req.params.subCategory_id;

    const [productResults] = await findProductsOfSubCategory(userId,subCategory_id,limit,offset);
    if (!productResults || productResults.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "No product under this subcategory has been found or given subCatogry_id is invalid",
        })
      );
    }
    // const formattedSubCategoryResponse={
    //   product_id:subCategoryResults[0].category_id,
    //   category_name:subCategoryResults[0].category_name,
    //   subcategories:subCategoryResults[0].subcategories
    // }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: productResults,
        msg: "products details of given subcategory data retrived successfully✅",
      })
    );
  } catch (error) {
    console.log("error while getting products subcategory:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while getting products of subcategory",
      })
    );
  }
};

exports.postFavouritesProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.userId;
    const [existsInFavourite]=await productExistsInFavourite(productId,userId);
    if(existsInFavourite.length>0){
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "product already exists in favourites",
        })
      );
    }
    const [insertResult] = await insertIntoFavourite(productId, userId);
    if (!insertResult) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "failed to add product to favourites",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "product added to favourite product list successfully❤️",
      })
    );
  } catch (error) {
    console.log("error while posting to favourite products:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while posting to favourite products",
      })
    );
  }
};

exports.getFavouritesProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;

    const [favouriteResults] = await findFavouriteProductsDetails(userId,limit,offset);
    if (!favouriteResults || favouriteResults.length===0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "success",
          statusCode: 200,
          msg: "No products have been added to favourites by you yet!!👀",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data:favouriteResults,
        msg: "favourite product list fetched successfully❤️",
      })
    );
  } catch (error) {
    console.log("error while posting to favourite products:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while fetching favourite products",
      })
    );
  }
};

exports.removeFromFavourites = async (req, res, next) => {
  try {
    const productId=req.params.productId;
    const userId = req.user.userId;

    await deleteFromFavouriteProductsDetails(productId,userId);
  
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "product removed from favourites successfully",
      })
    );
  } catch (error) {
    console.log("error while removeing product from favourites :", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while removeing product favourites",
      })
    );
  }
};