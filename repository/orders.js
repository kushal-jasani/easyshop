const db = require("../util/database");

const findOrders = async (userId, offset, limit) => {
  let sql = `SELECT
  o.id AS order_id,
  JSON_ARRAYAGG(
      JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'order_price', oi.price,
          'product_title', p.title,
          'product_image', i.image
      )
  ) AS order_items,
  o.amount AS order_amount,
  o.status AS order_status,
  o.updated_at AS status_updated_at,
  payment.id AS payment_id
FROM
  orders o
JOIN
  orderitems oi ON o.id = oi.order_id
LEFT JOIN
  images i ON oi.product_id = i.product_id
LEFT JOIN
  products p ON oi.product_id = p.id
JOIN
  payment_details payment ON o.id = payment.order_id
WHERE
  o.user_id = ?
  AND (o.status = 'delivered' OR o.status = 'cancelled')
GROUP BY
  o.id
LIMIT ?, ?;
`;

  const pastOrders=await db.query(sql, [userId, offset, limit]);

  sql=`SELECT
  o.id AS order_id,
  JSON_ARRAYAGG(
      JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'order_price', oi.price,
          'product_title', p.title,
          'product_image', i.image
      )
  ) AS order_items,
  o.amount AS order_amount,
  payment.payment_id AS payment_id
FROM
  orders o
JOIN
  orderitems oi ON o.id = oi.order_id
LEFT JOIN
  images i ON oi.product_id = i.product_id
LEFT JOIN
  products p ON oi.product_id = p.id
JOIN
  payment_details payment ON o.id = payment.order_id
WHERE
  o.user_id = ?
  AND o.status != 'delivered'
  AND o.status != 'cancelled'
Group by
  o.id
LIMIT ?, ?
`;

const currentOrders=await db.query(sql, [userId, offset, limit]);

return {currentOrders:currentOrders[0],pastOrders:pastOrders[0]}
};

const findOrderByOrderId = async (userId,orderId) => {
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
            o.user_id = ? AND o.id=?`;
  return await db.query(sql, [userId,orderId]);
};

const createOrder = async (
  user_id,
  address_id,
  orderAmount,
  deliveryCharge,
  status
) => {
  return await db.query("insert into orders set ?", {
    user_id: user_id,
    address_id: address_id,
    amount: orderAmount,
    delivery_charge: deliveryCharge,
    status: status,
  });
};

const createOrderItem = async (orderId, productId, quantity, price) => {
  return await db.query("insert into orderitems set ?", {
    order_id: orderId,
    product_id: productId,
    quantity: quantity,
    price: price,
  });
};

const createPaymentDetail = async (orderId,paymentId,invoiceNumber, type, status) => {
  return await db.query("insert into payment_details set ?", {
    order_id: orderId,
    payment_id:paymentId,
    invoice_number: invoiceNumber,
    type: type,
    status: status,
  });
};

const calculateDeliveryCharge = (orderAmount) => {
  const freeDeliveryThreshold = 1000;
  const deliveryChargePercentage = 0.05;
  if (orderAmount > freeDeliveryThreshold) {
    return 0;
  } else {
    return orderAmount * deliveryChargePercentage;
  }
};

const updateOrderStatus=async(orderId,status)=>{
    return await db.query(`UPDATE orders 
    SET status = ?
    WHERE id = ?;`,[status,orderId])
}

const updatePaymentDetails=async(paymentIntent,status)=>{
    const paymentId=paymentIntent.id;
    return await db.query(`UPDATE payment_details 
    SET status = ?
    WHERE id = ?;`,[status,paymentId])
}

module.exports = {
  findOrders,
  findOrderByOrderId,
  createOrder,
  createOrderItem,
  createPaymentDetail,
  calculateDeliveryCharge,
  updateOrderStatus,
  updatePaymentDetails

};
