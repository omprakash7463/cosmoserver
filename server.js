import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import https from "https";

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
        process.env.FRONTEND_URL || 'https://cosmoshoponline.netlify.app',
        // Admin panel on Netlify
        process.env.ADMIN_URL || 'https://admin-cosmoshop.netlify.app',
        // Add your Render.com deployed URL here
        process.env.APP_URL || 'https://cosmoshop-backend.onrender.com'
    ],
    credentials: true
}));

// api routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Add ping endpoint
app.get("/ping", (req, res) => {
    res.send("pong");
});

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
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            
            // Setup periodic ping to prevent sleep
            const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
            const APP_URL = process.env.APP_URL;
            
            if (APP_URL) {
                setInterval(() => {
                    https.get(APP_URL + '/ping', (resp) => {
                        console.log('Ping successful:', new Date().toISOString());
                    }).on('error', (err) => {
                        console.log('Ping failed:', err.message);
                    });
                }, PING_INTERVAL);
            }
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

