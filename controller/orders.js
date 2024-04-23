// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

const { generateResponse, sendHttpResponse } = require("../helper/response");
const { findOrders,createOrder, createOrderItem, updateOrderStatus } = require("../repository/orders");

// const { calculateDeliveryCharge } = require('../utils/helpers');

// exports.postOrder = async (req, res, next) => {
//   try {
//     const { address_id, products,payment_method } = req.body;

//     let orderAmount = 0;
//     products.forEach(product => {
//       orderAmount += product.product_price * product.product_quantity;
//     });
//     const deliveryCharge = calculateDeliveryCharge(orderAmount);

//     const orderId = uuidv4();

//     await createOrder(orderId, address_id, orderAmount, deliveryCharge, 'pending');

//     await Promise.all(products.map(async product => {
//       await createOrderItem(orderId, product.product_id, product.product_quantity, product.product_price);
//     }));

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: (orderAmount + deliveryCharge) * 100, // Amount in cents
//       currency: 'usd',
//       description: 'Product Order',
//       payment_method_types: ['card'],
//       metadata: {
//         order_id: orderId,
//       },
//     });

//     const response = generateResponse({
//       status: 'success',
//       statusCode: 200,
//       msg: 'Order placed successfully',
//       data: {
//         clientSecret: paymentIntent.client_secret,
//         deliveryCharge,
//         orderId,
//       },
//     });

//     sendHttpResponse(req, res, next, response);
//   } catch (error) {
//     console.error('Error while processing order:', error);
//     // Generate error response
//     const response = generateResponse({
//       status: 'error',
//       statusCode: 500,
//       msg: 'Internal server error',
//     });
//     // Send the error response
//     sendHttpResponse(req, res, next, response);
//   }
// };

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const [orders] = await findOrders(userId, offset, limit);
    if (!orders.length) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "success",
          statusCode: 200,
          msg: "No Orders found.",
        })
      );
    }
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "success",
        statusCode: 200,
        msg: "Orders fetched!",
        data: orders,
      })
    );
  } catch (err) {
    console.log(err);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Internal server error",
      })
    );
  }
};


