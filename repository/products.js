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

const productsMainDetails = async (userId) => {
  return await db.query(
    `SELECT 
    p.id AS product_id,
    p.title AS product_title,
    p.price,
    i.image,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM favourites f
            WHERE f.product_id = p.id AND f.user_id = ?
        ) THEN 1
        ELSE 0
    END AS is_favourite
FROM 
    products p
LEFT JOIN 
    images i ON p.id = i.product_id` ,[userId] );
};

const getCategoryList = async () => {
  return await db.query("select id,name,image from category");
};

const getProductDetail = async (userId,productId) => {
  const query = `SELECT 
  p.id AS product_id,
  p.title AS product_title,
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
)AS specifications,
CASE
WHEN EXISTS (
    SELECT 1 
    FROM favourites f 
    WHERE f.product_id = p.id AND f.user_id = ?
) THEN 1
ELSE 0
END AS is_favourite
FROM 
  products p
WHERE 
  p.id = ?;
`;
  return await db.query(query, [userId,productId]);
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

  return await db.query(query, [categoryId]);
};

const findProductsOfSubCategory = async (userId,subCategory_id) => {
  const query = `SELECT 
  p.id AS product_id,
  p.title,
  p.price,
  (SELECT image 
   FROM images 
   WHERE product_id = p.id 
   LIMIT 1) AS image_url,
  (SELECT type 
   FROM images 
   WHERE product_id = p.id 
   LIMIT 1) AS image_type,
   CASE
        WHEN EXISTS (
            SELECT 1 
            FROM favourites f 
            WHERE f.product_id = p.id AND f.user_id = ?
        ) THEN 1
        ELSE 0
    END AS is_favourite
FROM
  products p
WHERE
  p.subcategory_id = ?;`;

  return await db.query(query, [userId,subCategory_id]);
};

const insertIntoFavourite = async (productId, userId) => {
  return await db.query("insert into favourites set ?", {
    product_id: productId,
    user_id: userId,
  });
};

const findFavouriteProductsDetails=async(userId)=>{
  const query=`SELECT 
  p.id,
  p.title,
  p.price,
  (SELECT image FROM images WHERE product_id = p.id LIMIT 1) AS imageurl,
  (SELECT type FROM images WHERE product_id = p.id LIMIT 1) AS image_type
FROM 
  favourites fp
JOIN 
  products p ON fp.product_id = p.id
WHERE 
  fp.user_id = ?;
`
  return await db.query(query,[userId]);
}

const productExistsInFavourite=async(productId,userId)=>{
  return await db.query('select * from favourites where product_id=? && user_id=?',[productId,userId])
}

const deleteFromFavouriteProductsDetails=async(productId,userId)=>{
  return await db.query('delete from favourites where product_id=? && user_id=?',[productId,userId])
}

module.exports = {
  findRole,
  insertCategory,
  findCategoryOfBusiness,
  productsMainDetails,
  getCategoryList,
  getProductDetail,
  findSubcategoryOfCategory,
  findProductsOfSubCategory,
  insertIntoFavourite,
  findFavouriteProductsDetails,
  productExistsInFavourite,
  deleteFromFavouriteProductsDetails
};
