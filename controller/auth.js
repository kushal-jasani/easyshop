const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const jwt = require("jsonwebtoken");

const { generateResponse, sendHttpResponse } = require("../helper/response");
const {
  getUserDataByPhoneNo,
  insertUser,
  findPasswordOfUser,
  updateUserPassword,
  getUserByEmail,
  generateToken,
  addTokenToUser,
  getUserFromToken,
  updatePasswordAndToken,
} = require("../repository/auth");

function generateJWT(userId) {
  return jwt.sign({ userId },process.env.JWT_SECRET, { expiresIn: "2h" });
}

exports.postRegister = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phoneno, password } = req.body;

    const [userResults] = await getUserDataByPhoneNo(phoneno);
    // const userData = (userResults ?? [])[0] ?? {};
    const user = userResults[0];

    if (user.length) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 400,
          status: "error",
          msg: "User already exists",
        })
      );
      // res.status(400).json({ error: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    // jwt.sign()
    insertUser(firstname, lastname, email, phoneno, hashedPassword);
    // const token = generateJWT(user.id);
    const response = generateResponse({
      statusCode: 201,
      status: "success",
      msg: "uers created sucessfully",
      data: {
        user: {
          // userData
        },
        token_details: {
          // token,
        },
      },
    });

    return sendHttpResponse(req, res, next, response);
  } catch (error) {
    console.log(error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Error while generating response",
      })
    );
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { phoneno } = req.body;

    const [userResults] = await getUserDataByPhoneNo(phoneno);
    // console.log(userResults);
    const user = userResults[0];
    if (user.length) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 404,
          status: "error",
          msg: "user with given phone number is not registered already",
        })
      );
    }
    let otp = "1234";
    const { enteredotp } = req.body;
    if (otp == enteredotp) {
      // console.log(user.id)
      const token = generateJWT(user.id);
      // console.log(token)
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 200,
          status: "success",
          msg: "loggedin successfully",
          data: {
            token,
          },
        })
      );
    } else {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          statusCode: 404,
          status: "error",
          msg: "entered otp is wrong,please try again",
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
        msg: "Error while generating response",
      })
    );
  }
};

exports.postChangePassword = async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;

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
              msg: "new password and confirm password is not matching",
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
            msg: "password changed successfully",
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
            msg: "entered current password is incorrect",
          })
        );
      }
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
        msg: "error while changing password",
      })
    );
  }
};

exports.resetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
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
          msg: "user not found",
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
          api_key:process.env.SENDGRID_API,
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
    console.log(error);
    sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "error whie reseting password",
      })
    );
  }
};

exports.postResetPassword = async (req, res, next) => {
  try {
    const { resettoken } = req.params;

    const { newPassword } = req.body;

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
          msg: "Invalid or expired token",
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
          msg: "Invalid token or expired",
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
    console.log(error);
    sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "error whie reseting password",
      })
    );
  }
};
