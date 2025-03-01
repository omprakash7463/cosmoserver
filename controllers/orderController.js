import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const currency = 'INR';

// placing order using cod method
export const placeOrder = async (req, res) => {
    try {
        const { items, amount, address, paymentMethod } = req.body;
        const userId = req.user._id;

        // Create new order
        const order = new orderModel({
            userId,
            orderItems: items,
            totalAmount: amount,
            shippingAddress: address,
            orderStatus: "Order Placed",
            paymentMethod: paymentMethod || "COD",
            date: Date.now()
        });

        // Save order
        await order.save();

        // Clear cart after successful order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error placing order"
        });
    }
};

// get all orders
export const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find().sort({ date: -1 });
        
        // Transform orders to match admin panel expectations
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            items: order.orderItems.map(item => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
            })),
            amount: order.totalAmount,
            address: order.shippingAddress,
            status: order.orderStatus,
            paymentMethod: order.paymentMethod,
            payment: order.paymentMethod === 'PayPal',
            date: order.date
        }));

        res.status(200).json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching orders"
        });
    }
};

// get user orders
export const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });

        // Transform orders to match frontend expectations
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            items: order.orderItems.map(item => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
            })),
            amount: order.totalAmount,
            address: order.shippingAddress,
            status: order.orderStatus,
            paymentMethod: order.paymentMethod,
            payment: order.paymentMethod === 'PayPal',
            date: order.date
        }));

        res.status(200).json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching orders"
        });
    }
};

// update order status -- admin
export const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true }  // This ensures we get the updated document back
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: {
                _id: order._id,
                status: order.orderStatus
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating order status"
        });
    }
};

// track order
export const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order: {
                status: order.orderStatus,
                payment: order.paymentMethod === 'PayPal',
                paymentMethod: order.paymentMethod
            }
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error tracking order"
        });
    }
};

// delete order -- admin
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error deleting order"
        });
    }
};
