import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import connectCloudinary from "./config/cloudinary.js";

// app config
const app = express();
dotenv.config();
const port = process.env.PORT || 4000;

// Configure Cloudinary
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        // Frontend on InfinityFree
        process.env.FRONTEND_URL || 'https://cosmoshop.kesug.com',
        // Admin panel on Netlify
        process.env.ADMIN_URL || 'https://admin-cosmoshop.netlify.app'
    ],
    credentials: true
}));

// api routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// db config
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        // Explicitly specify the e-commerce database
        const dbName = 'e-commerce';
        const uri = process.env.MONGO_URI.includes(dbName) 
            ? process.env.MONGO_URI 
            : `${process.env.MONGO_URI}/${dbName}`;

        await mongoose.connect(uri, {
            dbName: dbName // Explicitly set database name
        });
        
        console.log("Connected to MongoDB e-commerce database");
        
        // Log current database name to verify
        const db = mongoose.connection.db;
        console.log("Current database:", db.databaseName);
        
        // List all collections
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to Cosmo Shop API");
});

// Start server
const startServer = () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
