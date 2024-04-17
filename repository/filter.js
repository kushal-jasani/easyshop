const db=require('../util/database');

const filterByCategory=async(category_id)=>{
    const query=`SELECT 
    p.id AS product_id,
    p.title,
    p.price,
    p.description,
    p.additional_info,
    (
        SELECT image 
        FROM images 
        WHERE product_id = p.id 
        LIMIT 1
    ) AS image_url
FROM 
    products p
JOIN 
    subcategory s ON p.subcategory_id = s.id
WHERE 
    s.category_id = ?
`

    return await db.query(query,[category_id])
}

const filterResult=async(searchText,categoryFilters,priceFilter,limit,offset)=>{

    let query = `
    SELECT 
        p.id AS product_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.title AS product_title,
        p.price,
        p.description,
        p.additional_info,
        (
            SELECT image 
            FROM images 
            WHERE product_id = p.id 
            LIMIT 1
        ) AS image_url
    FROM 
        products p
    JOIN 
        subcategory s ON p.subcategory_id = s.id
    JOIN 
        category c ON s.category_id = c.id
    WHERE 
  `;



  // Add category filters to SQL query
  if (categoryFilters && categoryFilters.length > 0) {
    const categoryIds = categoryFilters.map(category => category.id);
    query += `s.category_id IN (${categoryIds.join(',')}) AND `;
  }

  if(searchText){
    query+=`(c.name LIKE '%${searchText}%'
    OR s.name LIKE '%${searchText}%'
    OR p.title LIKE '%${searchText}%') AND `
  }

  // Add price filter to SQL query
  if (priceFilter && priceFilter.minPrice && priceFilter.maxPrice) {
    const { minPrice, maxPrice } = priceFilter;
    query += `p.price BETWEEN ${minPrice} AND ${maxPrice} AND `;
  }


  // Remove trailing "AND" if exists
  query = query.replace(/AND\s*$/, '');

  query+=`LIMIT ?,?`

  return await db.query(query,[offset,limit]);

}

const search=async(searchText)=>{
    const query=`
    SELECT 
        p.id AS product_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.title AS product_title,
        p.price,
        p.description,
        p.additional_info,
        (SELECT image 
         FROM images 
         WHERE product_id = p.id 
         LIMIT 1) AS image_url
    FROM 
        products p
    JOIN 
        subcategory s ON p.subcategory_id = s.id
    JOIN 
        category c ON s.category_id = c.id
    WHERE 
        c.name LIKE '%${searchText}%'
        OR s.name LIKE '%${searchText}%'
        OR p.title LIKE '%${searchText}%'
    `;
    return await db.query(query);
}
module.exports={
filterByCategory,
filterResult,
search
}