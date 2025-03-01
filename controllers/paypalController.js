import paypal from '@paypal/checkout-server-sdk';
import Order from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// PayPal client configuration
function getPayPalClient() {
    const clientId = process.env.PAYPAL_MODE === 'sandbox' 
        ? process.env.PAYPAL_CLIENT_ID_SANDBOX 
        : process.env.PAYPAL_CLIENT_ID_LIVE;
    const clientSecret = process.env.PAYPAL_MODE === 'sandbox'
        ? process.env.PAYPAL_CLIENT_SECRET_SANDBOX
        : process.env.PAYPAL_CLIENT_SECRET_LIVE;

    console.log('PayPal Mode:', process.env.PAYPAL_MODE);
    console.log('Using Client ID:', clientId);
        
    const environment = process.env.PAYPAL_MODE === 'sandbox'
        ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
        : new paypal.core.LiveEnvironment(clientId, clientSecret);
    
    return new paypal.core.PayPalHttpClient(environment);
}

// Create PayPal Order
export const createPayPalOrder = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        
        if (!items || !amount || !address) {
            return res.status(400).json({
                error: 'Missing required fields: items, amount, or address'
            });
        }

        console.log('Creating PayPal order with amount:', amount);
        const client = getPayPalClient();

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2)
                }
            }]
        });

        console.log('Executing PayPal order request...');
        const order = await client.execute(request);
        console.log('PayPal order created successfully:', order.result.id);
        
        // Save order details to database with correct field names
        const newOrder = new Order({
            userId: req.user._id,
            orderItems: items.map(item => ({
                ...item,
                payment: true
            })),
            totalAmount: amount,
            shippingAddress: address,
            orderStatus: "Order Placed",
            paymentMethod: 'PayPal',
            paymentId: order.result.id,
            date: Date.now()
        });

        console.log('Saving order with data:', {
            userId: req.user._id,
            itemsCount: items.length,
            totalAmount: amount,
            paymentId: order.result.id
        });

        await newOrder.save();
        console.log('Order saved to database:', newOrder._id);

        res.json({
            id: order.result.id
        });
    } catch (error) {
        console.error('PayPal Create Order Error:', error);
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('PayPal API Response:', error.response);
        }
        res.status(500).json({
            error: 'Failed to create PayPal order: ' + error.message
        });
    }
};

// Capture PayPal Payment
export const capturePayPalOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                error: 'Missing orderId'
            });
        }

        console.log('Capturing PayPal order:', orderId);
        const client = getPayPalClient();

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        console.log('Executing capture request...');
        const capture = await client.execute(request);
        console.log('Payment captured successfully:', capture.result.id);

        // Update order status in database
        const order = await Order.findOne({
            paymentId: orderId,
            userId: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        order.orderStatus = 'Order Placed';
        order.paymentResult = {
            id: capture.result.id,
            status: capture.result.status,
            update_time: capture.result.update_time
        };
        await order.save();
        console.log('Order updated in database:', order._id);

        // Clear user's cart after successful payment
        await userModel.findByIdAndUpdate(req.user._id, { cartData: {} });
        console.log('Cart cleared for user:', req.user._id);

        res.json({
            success: true,
            orderId: order._id
        });
    } catch (error) {
        console.error('PayPal Capture Order Error:', error);
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('PayPal API Response:', error.response);
        }
        res.status(500).json({
            error: 'Failed to capture PayPal payment: ' + error.message
        });
    }
};
