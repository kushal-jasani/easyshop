require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { generateResponse, sendHttpResponse } = require("../helper/response");
const {
  findOrders,
  findOrderByOrderId,
  createOrder,
  createOrderItem,
  createPaymentDetail,
  calculateDeliveryCharge,
  updateOrderStatus,
  updatePaymentDetails,
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

    const [result] = await createOrder(
      user_id,
      address_id,
      orderAmount,
      deliveryCharge,
      "pending"
    );
    const orderId = result.insertId;
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
      await createPaymentDetail(orderId, null, null, "cod", "pending");
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
      await createPaymentDetail(
        orderId,
        paymentIntent.id,
        null,
        "online",
        "pending"
      ); // Type: 'online', Status: 'pending', Invoice Number: paymentIntent.id
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
        paymentIntent_id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
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
    const userId =  req.user.userId ;
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const offset = (page - 1) * limit;
    const { currentOrders, pastOrders } = await findOrders(
      userId,
      offset,
      limit
    );
    if (!currentOrders.length && !pastOrders.length) {
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
        data: { currentOrders, pastOrders },
        msg: "Orders fetched!",
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

exports.getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const [order] = await findOrderByOrderId(userId, orderId);
    if (!order.length) {
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "success",
          statusCode: 200,
          msg: "Order Detail not found!",
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
        msg: "Order Detail fetched!",
        data: order,
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

exports.stripeWebhook = async (req, res, next) => {

    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
    } catch(error) {
      console.error("Error verifying webhook signature:", error);
      return sendHttpResponse(
        req,
        res,
        next,
        generateResponse({
          status: "error",
          statusCode: 400,
          msg: "Webhook Error: Invalid signature",
        })
      );
    }

    try {
    switch (event.type) {
      case "payment_intent.succeeded":

        // Payment succeeded, update order status to 'placed'
        const paymentIntent = event.data.object;
        await updateOrderStatus(paymentIntent.metadata.order_id, "placed");

        //update the payment details table with the payment status
        await updatePaymentDetails(paymentIntent, "succeeded");

        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            status: "success",
            statusCode: 200,
            msg: "Webhook received and processed successfully",
          })
        );

      case "payment_intent.payment_failed":
        const paymentFailedIntent = event.data.object;

        // Payment failed, update order status to 'cancelled'
        await updateOrderStatus(
          paymentFailedIntent.metadata.order_id,
          "cancelled"
        );

        // handle further actions for failed payments
        await updatePaymentDetails(paymentIntent, "failed");

        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            status: "success",
            statusCode: 200,
            msg: "Webhook received and processed successfully",
          })
        );

      default:
        return sendHttpResponse(
          req,
          res,
          next,
          generateResponse({
            status: "error",
            statusCode: 400,
            msg: `Unsupported event type: ${event.type}`,
          })
        );
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return sendHttpResponse(
      req,
      res,
      next,
      generateResponse({
        status: "error",
        statusCode: 500,
        msg: "Webhook error",
      })
    );
  }
};
