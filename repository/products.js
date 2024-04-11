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

const getCategoryList = async () => {
  return await db.query("select id,name,image from category");
};

const getProductDetail = async (productId) => {
  const query = `SELECT 
  p.id AS product_id,
  p.title,
  p.price,
  p.description,
  p.additional_info,
  (
		SELECT JSON_ARRAYAGG(JSON_OBJECT('image_url',i.image , 'image_type', i.type))
		FROM images i
		WHERE i.product_id = p.id
	)AS images,
  (
  SELECT JSON_ARRAYAGG(JSON_OBJECT('key',s.key , 'value', s.value))
  FROM specification s
  WHERE s.product_id = p.id
)AS specifications
FROM 
  products p
LEFT JOIN 
  images i ON p.id = i.product_id
WHERE 
  p.id = ?;
`;
  return await db.query(query, [productId]);
};

const findSubcategoryOfCategory = async (categoryId) => {
  const query = `SELECT 
  c.id AS category_id,
  c.name AS category_name,
  (
      SELECT JSON_ARRAYAGG(JSON_OBJECT('subCategory_id', s.id, 'name', s.name,'image',s.image))
      FROM subcategory s
      WHERE s.category_id = c.id
  ) AS subcategories
FROM 
  category c
WHERE
c.id=?;`;

  return await db.query(query,[categoryId])
};

module.exports = {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
  getCategoryList,
  getProductDetail,
  findSubcategoryOfCategory
};
