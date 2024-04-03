const db = require("../util/database");

const userDetailsFromId = async (userId) => {
  return await db.query(
    "select firstname,lastname,email,phoneno,role from users where id=?",
    [userId]
  );
};

const businessDetailsFromId = async (userId) => {
  return await db.query(
    "select b_name,b_logo,category,subcategory,address,city,state,country,aadhar_photo,aadhar_no from business where userid=?",
    [userId]
  );
};

const updateUserDetails = async (updatedFields, userId) => {
  return await db.query("update users set ? where id=?", [
    updatedFields,
    userId,
  ]);
};

const getCardDetailsFromUserId = async (userId) => {
  return await db.query("select * from cards where userid=?", [userId]);
};

const insertCardDetails = async (
  userId,
  card_num,
  holder_name,
  expiry,
  cvv
) => {
  return await db.query("insert into cards set ?", {
    userid: userId,
    card_num: card_num,
    holder_name: holder_name,
    expiry: expiry,
    cvv: cvv,
  });
};

const findDuplicateCard = async (card_num, userId) => {
  return await db.query("select id from cards where card_num=? && userid=?", [
    card_num,
    userId,
  ]);
};

const insertAddress = async (
  userId,
  type,
  address,
  city,
  state,
  country,
  zip
) => {
  return await db.query("insert into address set ?", {
    userId: userId,
    type: type,
    address: address,
    city: city,
    state: state,
    country: country,
    zip: zip,
  });
};

const findAddressFromId = async (userId) => {
  return await db.query(
    "select type,address,city,state,country,zip,latitude,longitude from address where userid=?",
    [userId]
  );
};

module.exports = {
  userDetailsFromId,
  businessDetailsFromId,
  updateUserDetails,
  getCardDetailsFromUserId,
  insertCardDetails,
  findDuplicateCard,
  insertAddress,
  findAddressFromId
};
