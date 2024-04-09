const { sendHttpResponse, generateResponse } = require("../helper/response");
const {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
} = require("../repository/products");

exports.categoryList = async (req, res, next) => {
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
