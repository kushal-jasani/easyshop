require("dotenv").config();

const otpless = require("otpless-node-js-auth-sdk");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const clientId = process.env.OTPLESS_CLIENTID;
const clientSecret = process.env.OTPLESS_CLIETSECRET;
const { generateResponse, sendHttpResponse } = require("../helper/response");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../util/jwt");
const {
  getUserDataByPhoneNo,
  insertCustomer,
  insertBusinessDetails,
  findPasswordOfUser,
  updateUserPassword,
  getUserByEmail,
  generateToken,
  addTokenToUser,
  getUserFromToken,
  updatePasswordAndToken,
  updateUserImage,
  updateAadharImage,
} = require("../repository/auth");

const {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  resetPasswordSchema,
  postResetPasswordSchema,
} = require("../helper/validation_schema");
const { uploader } = require("../uploads/uploader");

// function generateJWT(userId) {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "2h" });
// }

// exports.varifyMasterOtpRegister = async (req, res, next) => {
//   try {
//     const {
//       role,
//       firstname,
//       lastname,
//       email,
//       country_code,
//       phoneno,
//       hashedPassword,
//       imageUrl,
//       b_name,
//       category,
//       subcategory,
//       city,
//       state,
//       address,
//       aadharphoto,
//       aadharno,
//       otpid,
//       enteredotp,
//     } = req.body;

//     if (
//       enteredotp != '1234' ||
//       otpid !== "Otp_1A92DDDBBD014A5680909AE2CB2B4C72"
//     ) {
//       return sendHttpResponse(
//         req,
//         res,
//         next,
//         generateResponse({
//           status: "error",
//           statusCode: 401,
//           msg: "Invalid otp or otpId!",
//         })
//       );
//     }

//     [userResults] = await insertCustomer(
//       firstname,
//       lastname,
//       email,
//       country_code,
//       phoneno,
//       hashedPassword,
//       imageUrl,
//       role
//     );
//     const userId = userResults.insertId;
//     if (role == 2) {
//       await insertBusinessDetails(
//         userId,
//         b_name,
//         category,
//         subcategory,
//         city,
//         state,
//         address,
//         aadharphoto,
//         aadharno
//       );
//     }

//     return sendHttpResponse(
//       req,
//       res,
//       next,
//       generateResponse({
//         statusCode: 201,
//         status: "success",
//         msg: "User registerd successfully✅",
//       })
//     );
//   } catch (err) {
//     return sendHttpResponse(
//       req,
//       res,
//       next,
//       generateResponse({
//         status: "error",
//         statusCode: 500,
//         msg: "Internal server error",
//       })
//     );
//   }
// };

exports.resendOtp = async (req, res, next) => {
  const { otpid } = req.body;
  try {
    const response = await otpless.resendOTP(otpid, clientId, clientSecret);
    if (response.success === false) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: response.errorMessage,
        })
      );
    }
    const newotpId = response.orderId;
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        data: {
          otpid: newotpId,
        },
        msg: "otp resent successfully✅",
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
        msg: "internal server error",
      })
    );
  }
};

exports.varifyOtpRegister = async (req, res, next) => {
  try {
    const {
      role,
      firstname,
      lastname,
      email,
      country_code,
      phoneno,
      password,
      b_name,
      category,
      subcategory,
      city,
      state,
      address,
      aadharno,
      otpid,
      enteredotp,
    } = req.body;

    if (parseInt(role) == 2 && !req.files["image"]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "For businesses,business logo is required",
        })
      );
    }
    let imageUrl, aadharphoto;
    if (req.files && req.files["image"]) {
      imageUrl = req.files["image"][0];
    } else {
      imageUrl = null;
    }

    if (role == 2 && !req.files["aadharphoto"]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Addhar photo for business is required",
        })
      );
    } else if (role == 2 && req.files["aadharphoto"]) {
      aadharphoto = req.files["aadharphoto"][0];
    }

    const phonewithcountrycode = country_code + phoneno;
    const varificationresponse = await otpless.verifyOTP(
      "",
      phonewithcountrycode,
      otpid,
      enteredotp,
      clientId,
      clientSecret
    );

    if (varificationresponse.success === false) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 404,
          status: "error",
          msg: varificationresponse.errorMessage,
        })
      );
    }

    if (varificationresponse.isOTPVerified === true) {
      const hashedPassword = await bcrypt.hash(password, 8);
      [userResults] = await insertCustomer(
        firstname,
        lastname,
        email,
        country_code,
        phoneno,
        hashedPassword,
        role
      );

      const userId = userResults.insertId;
      if (userId && imageUrl) {
        let imageResult = await uploader(`easyshop/User_${userId}/Profile`,imageUrl);
        const [profileImageUrl = null] = imageResult ?? [];
        // console.log("profileImageUrl: ", profileImageUrl);

        if (profileImageUrl) {
          await updateUserImage({ userId, profileImageUrl });
        }
      }
      if (role == 2) {
        [businessResults] = await insertBusinessDetails(
          userId,
          b_name,
          category,
          subcategory,
          city,
          state,
          address,
          aadharno
        );
        const businessInsertId = businessResults.insertId;
        if (businessInsertId && aadharphoto) {
          let imageResult = await uploader(`easyshop/User_${userId}/Profile`,aadharphoto);
          const [aadharImageUrl = null] = imageResult ?? [];
          // console.log("aadharImageUrl: ", aadharImageUrl);
          if (aadharImageUrl) {
            await updateAadharImage({ businessInsertId, aadharImageUrl });
          }
        }
      }
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 201,
          status: "success",
          msg: "User registerd successfully✅",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 404,
        status: "error",
        msg: varificationresponse.reason ? varificationresponse.reason :"entered otp is wrong,please try again😓",
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
        msg: "internal server error",
      })
    );
  }
};

exports.postRegister = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: error.details[0].message,
        })
      );
    }
    const { role, phoneno, country_code } = req.body;

    if (parseInt(role) !== 1 && parseInt(role) !== 2) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Invalid role❌",
        })
      );
    }

    if (parseInt(role) == 2 && !req.files["image"]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "For businesses,business logo is required",
        })
      );
    }

    let [userResults] = await getUserDataByPhoneNo(phoneno);

    if (userResults.length > 0) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: "User already exists👀",
        })
      );
    }

    let imageUrl, aadharphoto;
    if (req.files && req.files["image"]) {
      imageUrl = req.files["image"][0].path;
    } else {
      imageUrl = null;
    }

    if (role == 2 && !req.files["aadharphoto"]) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Addhar photo for business is required",
        })
      );
    } else if (role == 2 && req.files["aadharphoto"][0]) {
      aadharphoto = req.files["aadharphoto"][0].path;
    }

    const phonewithcountrycode = country_code + phoneno;
    // const hashedPassword = await bcrypt.hash(password, 8);
    const response = await otpless.sendOTP(
      phonewithcountrycode,
      "",
      "SMS",
      "",
      "",
      600,
      4,
      clientId,
      clientSecret
    );
    if (response.success === false) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: "Failed to generate OTP❌",
        })
      );
    } else {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 201,
          status: "success",
          msg: "Otp sent successfully on given mobile number🚀",
          data: {
            // role: role,
            // firstname: firstname,
            // lastname: lastname,
            // email: email,
            // password: hashedPassword,
            // image: imageUrl,
            // b_name: b_name,
            // category: category,
            // subcategory: subcategory,
            // city: city,
            // state: state,
            // address: address,
            // aadharphoto: aadharphoto,
            // aadharno: aadharno,
            // country_code,
            // phoneno: phoneno,
            otpid: response.orderId,
            // otpid: 'Otp_1A92DDDBBD014A5680909AE2CB2B4C72',
          },
        })
      );
    }
  } catch (error) {
    console.log("error while registering user", error);
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

exports.postLogin = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: error.details[0].message,
        })
      );
    }
    const { country_code, phoneno } = req.body;
    const phonewithcountrycode = country_code + phoneno;

    const [userResults] = await getUserDataByPhoneNo(phoneno);
    const user = userResults[0];
    if (!user) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 404,
          status: "error",
          msg: "user with given phone number is not registered already❌",
        })
      );
    }

    const response = await otpless.sendOTP(
      phonewithcountrycode,
      "",
      "SMS",
      "",
      "",
      600,
      4,
      clientId,
      clientSecret
    );
    if (response.success === false) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: "Failed to generate OTP❗️",
        })
      );
    } else {
      const otpid = response.orderId;
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 200,
          status: "success",
          data: {
            country_code: country_code,
            phoneno: phoneno,
            otpid: otpid,
          },
          msg: "Otp sent on this number successfully🚀",
        })
      );
    }
  } catch (error) {
    console.log(error);
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

exports.varifyOtpLogin = async (req, res, next) => {
  try {
    const { country_code, phoneno, otpid, enteredotp } = req.body;
    const [userResults] = await getUserDataByPhoneNo(phoneno);
    const user = userResults[0];
    const phonewithcountrycode = country_code + phoneno;
    const varificationresponse = await otpless.verifyOTP(
      "",
      phonewithcountrycode,
      otpid,
      enteredotp,
      clientId,
      clientSecret
    );
    if (varificationresponse.success === false) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 404,
          status: "error",
          msg: varificationresponse.errorMessage,
        })
      );
    }
    if (varificationresponse.isOTPVerified === true) {
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 200,
          status: "success",
          msg: "You're loggedin successfully🥳",
          data: {
            JWTToken: { accessToken, refreshToken },
          },
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 404,
        status: "error",
        msg: varificationresponse.reason ? varificationresponse.reason : "entered otp is wrong,please try again😓",
      })
    );
  } catch (error) {
    console.log("error while login", error);
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

exports.refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = verifyRefreshToken(refreshToken);
    if (userId === "expired") {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 401,
          status: "error",
          msg: "Refresh token has expired⏳",
        })
      );
    } else if (!userId) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 401,
          status: "error",
          msg: "Invalid refresh token🚨",
        })
      );
    }
    const accessToken = generateAccessToken(userId);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "New access token generated successfully🧾",
        data: {
          accessToken,
        },
      })
    );
  } catch (error) {
    console.log("error while refreshing access token", error);
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

exports.postChangePassword = async (req, res, next) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: error.details[0].message,
        })
      );
    }
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.user.userId;

    const dbPassword = await findPasswordOfUser(userId);

    if (dbPassword && dbPassword.length > 0) {
      const hashedDbPassword = dbPassword[0][0].password;
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        hashedDbPassword
      );
      if (passwordMatch) {
        if (newPassword !== confirmPassword) {
          return sendHttpResponse(
            req,
            res,
            next,
            generateResponse({
              status: "error",
              statusCode: 400,
              msg: "new password and confirm password is not matching😓",
            })
          );
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 8);
        await updateUserPassword(hashedNewPassword, userId);
        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            statusCode: 200,
            status: "success",
            msg: "password changed successfully✅",
          })
        );
      } else {
        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            status: "error",
            statusCode: 400,
            msg: "entered current password is incorrect🚨",
          })
        );
      }
    }
  } catch (error) {
    console.log("error while changing password", error);
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

exports.resetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: error.details[0].message,
        })
      );
    }
    const [userResults] = await getUserByEmail(email);
    const user = userResults[0];
    if (!user) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "user not found❗️",
        })
      );
    }
    const tokenlength = 32;
    const expiryhours = 24;
    const { resettoken, resettokenexpiry } = await generateToken(
      tokenlength,
      expiryhours
    );
    // console.log(resettoken);
    // console.log(resettokenexpiry);

    await addTokenToUser(resettoken, resettokenexpiry, email);

    const transporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          api_key: process.env.SENDGRID_API,
        },
      })
    );
    transporter.sendMail({
      to: email,
      from: "kushaljasani843445@gmail.com",
      subject: "ALERT:Password Reset🚨",
      html: `<p>You requested password Reset</p>
      <p>Click given <a href="http://localhost:3000/reset/${resettoken}">link</a> to reset password</p>`,
    });

    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "link for reset password send successfully",
      })
    );
  } catch (error) {
    console.log("error whie reseting password", error);
    sendHttpResponse(
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

exports.postResetPassword = async (req, res, next) => {
  try {
    const { resettoken } = req.params;

    const { newPassword } = req.body;
    const { error } = postResetPasswordSchema.validate(req.body);
    if (error) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: error.details[0].message,
        })
      );
    }
    const [userresults] = await getUserFromToken(resettoken);
    const user = userresults[0];

    if (!user) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "Invalid or expired token❌",
        })
      );
    }
    const cuurentTime = new Date();

    if (
      user.resettokenexpiry &&
      cuurentTime > new Date(user.resettokenexpiry)
    ) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 404,
          msg: "Invalid token or expired❌",
        })
      );
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 8);
    await updatePasswordAndToken(hashedNewPassword, user.id);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        statusCode: 200,
        status: "success",
        msg: "Password reset successfully..🥳",
      })
    );
  } catch {
    console.log("error whie reseting password", error);
    sendHttpResponse(
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
