import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({success:false, message:"No Authorization token provided"});
        }
        
        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({success:false, message:"No Authorization token provided"});
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Check if token is an admin token
            if(!decoded.isAdmin || decoded.email !== process.env.ADMIN_EMAIL) {
                return res.status(403).json({success:false, message:"Not authorized as admin"});
            }
            next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({success:false, message:"Invalid token"});
        }
    } catch (error) {
        console.error("Admin auth error:", error);
        res.status(500).json({success:false, message:"Authentication error"});
    }
}

export default adminAuth;
