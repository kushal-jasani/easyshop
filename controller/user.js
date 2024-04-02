const { sendHttpResponse, generateResponse } = require("../helper/response");
const { userDetailsFromId, updateUserDetails } = require("../repository/user");
exports.getUserDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [userResults] = await userDetailsFromId(userId);

    if (!userResults) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "no user found",
        })
      );
    }
    const user = userResults[0];
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: { user },
        msg: "data retrived successfully",
      })
    );
  } catch {
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};

exports.postUpdateDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedFields = req.body;

    const [results] = await updateUserDetails(updatedFields, userId);
    if (results.affectedRows == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "no user found",
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
        msg: "user data updated successfully",
      })
    );
  } catch (error) {
    console.log(error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};
