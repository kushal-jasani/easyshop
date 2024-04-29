const cloudinary = require("cloudinary").v2;

const { sendHttpResponse, generateResponse } = require("../helper/response");
const {
  userDetailsFromId,
  businessDetailsFromId,
  updateUserDetails,
  getCardDetailsFromUserId,
  insertCardDetails,
  findDuplicateCard,
  insertAddress,
  findAddressFromId,
} = require("../repository/user");
const { getUserDataByPhoneNo } = require("../repository/auth");
const { findRole } = require("../repository/products");
const { uploader } = require("../uploads/uploader");
const { extractPublicId } = require("../uploads/public_id");

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
          msg: "no user found😓",
        })
      );
    }
    const user = userResults[0];
    let userDetails;
    if (user.role === 2) {
      const [businessResult] = await businessDetailsFromId(userId);
      if (businessResult.length == 0) {
        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            status: "error",
            statusCode: 404,
            msg: "Business details not found❌",
          })
        );
      }
      userDetails = {
        email: user.email,
        phoneno: user.phoneno,
        image: businessResult[0].image,
        b_name: businessResult[0].b_name,
        b_logo: businessResult[0].b_logo,
        category: businessResult[0].category,
        subcategory: businessResult[0].subcategory,
        city: businessResult[0].city,
        state: businessResult[0].state,
        country: businessResult[0].country,
        address: businessResult[0].address,
        aadhar_photo: businessResult[0].aadhar_photo,
        aadhar_no: businessResult[0].aadhar_no,
      };
    } else {
      userDetails = user;
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: { userDetails },
        msg: "data retrived successfully✅",
      })
    );
  } catch (error) {
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
    const [userData] = await userDetailsFromId(userId);
    const [businessData]=await businessDetailsFromId(userId)
    const [roleOfCurrentUser] = await findRole(userId);
    const role = roleOfCurrentUser[0].role;

    const allowedFields = {
      1: ["firstname", "lastname", "email", "phoneno", "image"],
      2: [
        "email",
        "phoneno",
        "b_name",
        "category",
        "subcategory",
        "city",
        "state",
        "country",
        "address",
        "aadhar_photo",
        "aadhar_no",
        "image",
      ],
    };

    if (!allowedFields[role]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: "Invalid user role",
        })
      );
    }

    let imageUrl;

    if (req.files && req.files["image"]) {

      const publicId = await extractPublicId(userData[0].image);
      cloudinary.api
        .delete_resources([publicId], {
          type: "upload",
          resource_type: "image",
        })
        .then(console.log("Deleted old profile image"));
      const imageFile = req.files["image"][0];
      imageUrl = await uploader(`easyshop/User_${userId}/Profile`, imageFile);
    }
    if (imageUrl) {
      updatedFields["image"] = imageUrl;
    }

    if (updatedFields.phoneno) {
      let [existingUser] = await getUserDataByPhoneNo(updatedFields.phoneno);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            statusCode: 400,
            status: "error",
            msg: `Can't update..User with this phone number ${updatedFields.phoneno} already exists👀`,
          })
        );
      }
    }

    const disallowedFields = Object.keys(updatedFields).filter(
      (field) => !allowedFields[role].includes(field)
    );
    if (disallowedFields.length > 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: `Updating ${disallowedFields.join(
            ", "
          )} is not allowed for users with role ${role}`,
        })
      );
    }

    let aadharImageUrl;

    if (req.files && req.files["aadharphoto"]) {
      const publicId = await extractPublicId(businessData[0].aadhar_photo);
      cloudinary.api
        .delete_resources([publicId], {
          type: "upload",
          resource_type: "image",
        })
        .then(console.log("Deleted old aadhar image"));
      const imageFile = req.files["aadharphoto"][0];
      aadharImageUrl = await uploader(
        `easyshop/User_${userId}/Profile`,
        imageFile
      );
    }
    if (aadharImageUrl) {
      updatedFields["aadhar_photo"] = aadharImageUrl;
    }
    // const filteredFields = Object.keys(updatedFields)
    // .filter(key => allowedFields[role].includes(key))
    // .reduce((obj, key) => {
    //   obj[key] = updatedFields[key];
    //   return obj;
    // }, {});

    const [results] = await updateUserDetails(updatedFields, userId, role);

    if (results.affectedRows == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "no user found or no changes have be made",
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
        msg: "user data updated successfully ⚡️",
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
          msg: "No cards has been added by you yet👀",
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
          msg: "Entered expiry date is invalid,Enter in MM/YY format😓",
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
          msg: "The card has expired❗️",
        })
      );
    }

    const [existingCards] = await findDuplicateCard(card_num, userId);
    if (existingCards.length > 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Card with given number is already added😪",
        })
      );
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
        msg: "card added successfully✅",
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

exports.getAddressDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [addressDetails] = await findAddressFromId(userId);

    if (addressDetails.length == 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "success",
          statusCode: 200,
          msg: "no address has been added by you yet!!",
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
        data: { addressDetails },
        msg: "address fetched successfully🥳",
      })
    );
  } catch (error) {
    console.log("error while fetching address", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: "500",
        msg: "Internal server error",
      })
    );
  }
};

exports.postAddressDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, address, city, state, country, zip } = req.body;

    await insertAddress(userId, type, address, city, state, country, zip);

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 201,
        status: "success",
        msg: "address added successfully✅",
      })
    );
  } catch (error) {
    console.log("error while adding address", error);
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
