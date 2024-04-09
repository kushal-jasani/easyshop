const db = require("../util/database");

const findRole = async (userId) => {
  return await db.query("select role from users where id=?", [userId]);
};

const findCategoryOfBusiness = async (userId) => {
  return await db.query(
    "select id,name,image from category where business_id=?",
    userId
  );
};

const insertCategory = async (name, image, userId) => {
  return await db.query("insert into category set ?", {
    name: name,
    image: image,
    business_id: userId,
  });
};

const productsMainDetails = async () => {
  return await db.query(
    "select p.id,p.title,p.price,i.image from products p left join images i on p.id=i.product_id"
  );
};

module.exports = {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
};
