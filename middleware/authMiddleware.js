import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const requireAuth = async (req, res, next) => {
    // Verify authentication
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authorization.split(' ')[1];

    try {
        // Verify token
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id and select only non-sensitive fields
        req.user = await userModel.findById(id).select('_id name email createdAt');
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Request is not authorized' });
    }
};

export { requireAuth };
