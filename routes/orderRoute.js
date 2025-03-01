import express from 'express';
import { placeOrder, allOrders, userOrders, updateStatus, trackOrder, deleteOrder } from "../controllers/orderController.js";
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/paypalController.js';

const orderRouter = express.Router();

// place order
orderRouter.post('/cod', auth, placeOrder);

// get all orders -- admin
orderRouter.get('/all', adminAuth, allOrders);

// get user orders
orderRouter.get('/user', auth, userOrders);

// update order status -- admin
orderRouter.put('/status/:orderId', adminAuth, updateStatus);

// delete order -- admin
orderRouter.delete('/:orderId', adminAuth, deleteOrder);

// track order
orderRouter.get('/track/:orderId', auth, trackOrder);

// PayPal Routes
orderRouter.post('/create-paypal-order', auth, createPayPalOrder);
orderRouter.post('/capture-paypal-order', auth, capturePayPalOrder);

export default orderRouter;
