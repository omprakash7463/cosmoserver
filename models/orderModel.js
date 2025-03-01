import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: Array, default: [] },
    size: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderItems: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: Object, required: true },
    orderStatus: { type: String, required: true, default: 'Pending' },
    paymentMethod: { type: String, required: true },
    paymentId: { type: String },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String }
    },
    date: { type: Date, default: Date.now }
});

const orderModel = mongoose.models.Order || mongoose.model("order", orderSchema);

export default orderModel;
