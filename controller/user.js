const { sendHttpResponse, generateResponse } = require("../helper/response");
const {
  userDetailsFromId,
  updateUserDetails,
  getCardDetailsFromUserId,
  insertCardDetails,
  findDuplicateCard,
} = require("../repository/user");
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
    console.log("error while updateing user details: ", error);
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

exports.getCardsDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [cardResults] = await getCardDetailsFromUserId(userId);
    if (!cardResults) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "No cards has been added by you yet",
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
        data: { cards: cardResults },
        msg: "Cards data retrived",
      })
    );
  } catch (error) {
    console.log("error while fetching cards details : ", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error",
      })
    );
  }
};

exports.postCardsDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { card_num, holder_name, expiry, cvv } = req.body;

    function validateExpiryDate(expiry) {
      const regx = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      return regx.test(expiry);
    }

    function isExpired(expiry) {
      const [month, year] = expiry.split("/");
      const currYear = new Date().getFullYear() % 100;
      const currMonth = new Date().getMonth() + 1;
      return (
        parseInt(year) < currYear ||
        (parseInt(year) === currYear && parseInt(month) < currMonth)
      );
    }

    if (!validateExpiryDate(expiry)) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Entered expiry date is invalid,Enter in MM/YY format",
        })
      );
    }

    if (isExpired(expiry)) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "The card has expired",
        })
      );
    }

    const [existingCards]=await findDuplicateCard(card_num);
    if(existingCards.length>0){
      return sendHttpResponse(req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Card with given number is already added",
        }))
    }
    await insertCardDetails(userId, card_num, holder_name, expiry, cvv);

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: { card: { card_num, holder_name } },
        msg: "card added successfully",
      })
    );
  } catch (error) {
    console.log("error while adding cards:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "internal server error",
      })
    );
  }
};
