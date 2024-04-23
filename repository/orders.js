const db = require('../util/database');

const findOrders = async (userId, offset, limit ) => {
    let sql = `SELECT
            o.id AS order_id,
            (
                SELECT JSON_OBJECT('address_type', a.type, 'delivery_address', a.address, 'zip_code', a.zip)
                FROM address a
                WHERE o.address_id = a.id
            ) AS address,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('product_id', orderItem.product_id, 'quantity', orderItem.quantity, 'order_price', orderItem.price))
                FROM (
                    SELECT oi.product_id, oi.quantity, oi.price
                    FROM orderitems oi
                    WHERE oi.order_id = o.id
                ) AS orderItem
            ) AS orderItems,
            o.amount as Order_amount,
            o.discount_amt as Discount_amount,
            o.delivery_charge,
            p.invoice_number as Payment_inovice,
            p.type as Payment_type,
            p.status as Payment_Status,
            o.status as Order_Status
        FROM
            orders o
        JOIN
        payment_details p ON o.id = p.order_id
        WHERE
            o.user_id = ?
        LIMIT ?, ?`

    return await db.query(sql, [userId, offset, limit])
}


module.exports = {
    findOrders
};