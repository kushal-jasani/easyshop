const express = require('express');

const orderController =require('../controller/orders')
const { isAuth } = require('../middleware/is-auth')

const router = express.Router();

router.get('/orders',isAuth, orderController.getOrders);
router.get('/orders/orderdetails/:orderId', isAuth,orderController.getOrderDetails);

router.post('/createorder',isAuth,orderController.postOrder);

router.post('/stripe/webhook',isAuth,orderController.stripeWebhook);


module.exports = router;