require("dotenv").config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

const { generateResponse, sendHttpResponse } = require("../helper/response");
const {
  findOrders,
  createOrder,
  createOrderItem,
  createPaymentDetail,
  calculateDeliveryCharge
} = require("../repository/orders");


exports.postOrder = async (req, res, next) => {
  try {
    const { address_id, products, payment_mode } = req.body;
    const user_id = req.user.userId;
    let orderAmount = 0;
    products.forEach((product) => {
      orderAmount += product.price * product.quantity;
    });
    const deliveryCharge = calculateDeliveryCharge(orderAmount);

    // let orderTotal=parseFloat(orderAmount)+parseFloat(deliveryCharge);
    // const orderId = uuidv4();

    const [result]=await createOrder(
      user_id,
      address_id,
      orderAmount,
      deliveryCharge,
      'pemding'
    );
    const orderId=result.insertId;
    await Promise.all(
      products.map(async (product) => {
        await createOrderItem(
          orderId,
          product.id,
          product.quantity,
          product.price
        );
      })
    );
    let paymentIntent;
    if (payment_mode === "cod") {
      await createPaymentDetail(orderId,null, "cod", "pending" );
    } else if (payment_mode === "online") {
      paymentIntent = await stripe.paymentIntents.create({
        amount: (orderAmount + deliveryCharge) * 100,
        currency: "usd",
        description: "Product Order",
        payment_method_types: ["card"],
        metadata: {
          order_id: orderId,
        },
      });
      console.log(paymentIntent)
      await createPaymentDetail(orderId,paymentIntent.id, "online", "pending" ); // Type: 'online', Status: 'pending', Invoice Number: paymentIntent.id
    } else {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "invalid payment method",
        })
      );
    }
    const response = generateResponse({
      status: "success",
      statusCode: 200,
      msg: "Order placed successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        deliveryCharge,
        orderId,
      },
    });

    return sendHttpResponse(req, res, next, response);
  } catch (error) {
    console.error("Error while processing order:", error);

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
