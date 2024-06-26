const { sendHttpResponse, generateResponse } = require("../helper/response");
const { filterByCategory, filterResult,search } = require("../repository/filter");
const { getCategoryList } = require("../repository/products");

exports.categoryFilter = async (req, res, next) => {
  try {
    const category_id = req.params.category_id;

    const [categoryProducts] = await filterByCategory(category_id);

    if (!categoryProducts || categoryProducts.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "No products in given category or wrong category id has been passed",
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
        data: categoryProducts,
        msg: "filter by category successful💪🏻",
      })
    );
  } catch (error) {
    console.log("error while filtering category products", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while filtering category products",
      })
    );
  }
};

exports.showFilter = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    const [categoryList] = await getCategoryList(limit,offset);
    const categoryFilters = categoryList.map((category) => {
      const { image, ...rest } = category;
      return rest;
    });
    let minPrice = 0;
    let maxPrice = 100000;
    const priceFilter = { minPrice, maxPrice };

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "success",
        statusCode: 200,
        data: { categoryFilters: categoryFilters, priceFilter: priceFilter },
        msg: "filter option showed successfully",
      })
    );
  } catch (error) {
    console.log("error while showing filters", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while showing ",
      })
    );
  }
};

exports.getFilter = async (req, res, next) => {
  try {
    const { searchText,categoryFilters, priceFilter } = req.body;

    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const [categoryProducts] = await filterResult(searchText,categoryFilters, priceFilter,limit,offset);

    if (!categoryProducts || categoryProducts.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "No products in given category or wrong category id has been passed",
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
        data: {page,limit,categoryProducts},
        msg: "filter successful💪🏻",
      })
    );
  } catch (error) {
    console.log("error while filtering category products", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while filtering category products",
      })
    );
  }
};

exports.search = async (req, res, next) => {
  try {
    const {searchText} = req.body;
    
    const [searchResults] = await search(searchText);

    if (!searchResults || searchResults.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "products for this search not found",
        })
      );
    }
    return sendHttpResponse(req,res,next,generateResponse({statusCode:200,status:'success',data:searchResults,msg:'products for search retirved successfully'}))

  } catch (error) {
    console.log("error while searching:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error while searching ",
      })
    );
  }
};
