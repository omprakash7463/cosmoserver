import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({success:false, message:"No Authorization. Please login again!"});
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id }; 
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({success:false, message:"Invalid token. Please login again!"});
    }
}

export default auth;
