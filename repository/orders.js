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

const createOrder=async(user_id,address_id,orderAmount,deliveryCharge,status)=>{
    return await db.query('insert into orders set ?',{
        user_id:user_id,
        address_id:address_id,
        amount:orderAmount,
        delivery_charge:deliveryCharge,
        status:status
    })
}

const createOrderItem=async(orderId,productId,quantity,price)=>{
    return await db.query('insert into orderitems set ?',{
        order_id:orderId,
        product_id:productId,
        quantity:quantity,
        price:price
    })
}

const createPaymentDetail=async(orderId, invoiceNumber,type, status )=>{
   return await db.query( 'insert into payment_details set ?',{
        order_id:orderId,
        invoice_number:invoiceNumber,
        type:type,
        status:status
    })
}

const calculateDeliveryCharge=(orderAmount)=> {
    const freeDeliveryThreshold = 1000;
    const deliveryChargePercentage = 0.05;
    if (orderAmount > freeDeliveryThreshold) {
      return 0;
    } else {
      return orderAmount * deliveryChargePercentage; 
    }
  }
  

module.exports = {
    findOrders,
    createOrder,
    createOrderItem,
    createPaymentDetail,
    calculateDeliveryCharge
};