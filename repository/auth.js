const crypto = require("crypto");
const db = require("../util/database");

const getUserDataByPhoneNo = async (phoneno) => {
  return await db.query("select * from users where phoneno = ?", [phoneno]);
};

const insertCustomer = async (
  firstname,
  lastname,
  email,
  country_code,
  phoneno,
  hashedPassword,
  imageUrl,
  role
) => {
  return await db.query("insert into users set ?", {
    firstname: firstname,
    lastname: lastname,
    email: email,
    country_code: country_code,
    phoneno: phoneno,
    password: hashedPassword,
    image: imageUrl,
    role: role,
  });
};

const insertBusinessDetails = async (
  insertId,
  b_name,
  category,
  subcategory,
  city,
  state,
  address,
  aadharphoto,
  aadharno
) => {
  return await db.query("insert into business set ?", {
    userid: insertId,
    b_Name: b_name,
    category: category,
    subcategory: subcategory,
    city: city,
    state: state,
    address: address,
    aadhar_photo: aadharphoto,
    aadhar_no: aadharno,
  });
};

const findPasswordOfUser = async (userId) => {
  return await db.query("select password from users where id = ?", [userId]);
};

const updateUserPassword = async (hashedNewPassword, userId) => {
  return await db.query("update users set password = ? where id = ?", [
    hashedNewPassword,
    userId,
  ]);
};

const getUserByEmail = async (email) => {
  return await db.query("select * from users where email= ?", [email]);
};

const generateToken = (length, expiryhours) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, async (err, buf) => {
      if (err) {
        reject(err);
      } else {
        const resettoken = buf.toString("hex");
        const resettokenexpiry = new Date(
          Date.now() + expiryhours * 3600 * 1000
        );
        resolve({ resettoken, resettokenexpiry });
      }
    });
  });
};

const addTokenToUser = async (resettoken, resettokenexpiry, email) => {
  return await db.query(
    "update users set resettoken=?,resettokenexpiry=? where email=?",
    [resettoken, resettokenexpiry, email]
  );
};

const getUserFromToken = async (resettoken) => {
  return await db.query("select * from users where resettoken=?", [resettoken]);
};

const updatePasswordAndToken = async (hashedNewPassword, userId) => {
  return await db.query(
    "update users set password=?,resettoken=NULL where id=?",
    [hashedNewPassword, userId]
  );
};

module.exports = {
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
};
