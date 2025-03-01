import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";


const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
}

//Route for login user

const loginUser = async (req, res) => {
   try {
    const {email, password} = req.body;

    //check if user exists
    const user = await userModel.findOne({email});
    if(!user) {
        return res.json({success: false, message: "User does not exist"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(isMatch) {
        const token = createToken(user._id);
        // Send user data without sensitive information
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
        res.json({success: true, token, user: userData});
    }else{
        res.json({success: false, message: "Invalid password"});
    }
    
    
   } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message});
   }
}       

//Route for register user

const registerUser = async (req, res) => {
    try {   
        const { name, email, password } = req.body;

        //check if user already exists
        const exists = await userModel.findOne({email});

        if (exists) {
            return res.json({success: false, message: "User already exists"});
        }  
        
        //validator email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: "Please enter a valid email"});
        }
        if (password.length < 8) {
            return res.json({success: false, message: "Password must be at least 8 characters long"});
        }

        //hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //create new user
        const newUser = new userModel({name, email, password: hashedPassword});

        //save user to database
        const user = await newUser.save();

        const token = createToken(user._id);

        // Send user data without sensitive information
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        res.json({success: true, token, user: userData});
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }   
}   

//Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Debug logging
        console.log('Admin login attempt with:', { 
            attemptEmail: email,
            expectedEmail: process.env.ADMIN_EMAIL,
            emailMatch: email === process.env.ADMIN_EMAIL,
            passwordMatch: password === process.env.ADMIN_PASSWORD
        });

        // Validate environment variables
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error('Admin credentials not properly configured in environment');
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error" 
            });
        }

        // Check if email and password match admin credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Create admin token
            const token = jwt.sign(
                { email: process.env.ADMIN_EMAIL, isAdmin: true },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('Admin login successful');
            return res.json({ success: true, token });
        }
        
        console.log('Admin login failed: Invalid credentials');
        return res.status(401).json({ 
            success: false, 
            message: "Invalid admin credentials" 
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error during admin login" 
        });
    }
};

// Route for getting user profile
const getUserProfile = async (req, res) => {
    try {
        // req.user is already set by the auth middleware
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile };
