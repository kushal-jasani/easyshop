const express = require('express');

const orderController =require('../controller/orders')
const { isAuth } = require('../middleware/is-auth')

const router = express.Router();

router.get('/orders', isAuth, orderController.getOrders);

router.post('/createorder',isAuth,orderController.postOrder);

module.exports = router;