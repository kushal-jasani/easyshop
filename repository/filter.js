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

const filterResult=async(categoryFilters,priceFilter)=>{

    let query = `
    SELECT 
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
  `;


  // Add category filters to SQL query
  if (categoryFilters && categoryFilters.length > 0) {
    const categoryIds = categoryFilters.map(category => category.id);
    query += `s.category_id IN (${categoryIds.join(',')}) AND `;
  }

  // Add price filter to SQL query
  if (priceFilter && priceFilter.minPrice && priceFilter.maxPrice) {
    const { minPrice, maxPrice } = priceFilter;
    query += `p.price BETWEEN ${minPrice} AND ${maxPrice} AND `;
  }

  // Remove trailing "AND" if exists
  query = query.replace(/AND\s*$/, '');

  return await db.query(query);

}
module.exports={
filterByCategory,
filterResult
}