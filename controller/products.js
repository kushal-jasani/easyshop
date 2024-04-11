const { sendHttpResponse, generateResponse } = require("../helper/response");
const {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
  getCategoryList,
  getProductDetail,
  findSubcategoryOfCategory
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
    const [productResults] = await productsMainDetails();

    if (productResults.length === 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
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
        data: productResults.map((p) => ({
          product_id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
        })),
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
    const productId = req.params.productId;

    const [productDetails] = await getProductDetail(productId);


    const formattedResponse = {
      product_id: productDetails[0].product_id,
      title: productDetails[0].title,
      price: productDetails[0].price,
      description: productDetails[0].description,
      additional_info: productDetails[0].additional_info,
      images: productDetails[0].images,
      specifications: productDetails[0].specifications,
    };

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: 
          formattedResponse,
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
    const [categoryList] = await getCategoryList();

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


exports.getSubcategoryOfCategory=async(req,res,next)=>{
  try{

    const categoryId=req.params.categoryId;

    const [subCategoryResults]=await findSubcategoryOfCategory(categoryId);
    if(!subCategoryResults || subCategoryResults.length==0){
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
    const formattedSubCategoryResponse={
      category_id:subCategoryResults[0].category_id,
      category_name:subCategoryResults[0].category_name,
      subcategories:subCategoryResults[0].subcategories
    }
    return sendHttpResponse(req,res,next,generateResponse({statusCode:200,status:'success',data:formattedSubCategoryResponse,msg:'subcategory data retrived successfully✅'}))
  }
  catch(error){
    console.log('error while getting subcategorys:',error);
    return sendHttpResponse(req,res,next,generateResponse({status:'error',statusCode:500,msg:'internal server error while getting subcategory'}))
  }
}

exports.getProductsOfSubcategory=async(req,res,next)=>{
  try{

    const subCategory_id=req.params.subCategory_id;

    const [productResults]=await findSubcategoryOfCategory(subCategory_id);
    if(!productResults || productResults.length==0){
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
    const formattedSubCategoryResponse={
      product_id:subCategoryResults[0].category_id,
      category_name:subCategoryResults[0].category_name,
      subcategories:subCategoryResults[0].subcategories
    }
    return sendHttpResponse(req,res,next,generateResponse({statusCode:200,status:'success',data:formattedSubCategoryResponse,msg:'subcategory data retrived successfully✅'}))
  }
  catch(error){
    console.log('error while getting subcategorys:',error);
    return sendHttpResponse(req,res,next,generateResponse({status:'error',statusCode:500,msg:'internal server error while getting subcategory'}))
  }
}