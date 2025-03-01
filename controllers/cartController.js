import userModel from "../models/userModel.js";

// add products to user cart
const addToCart = async (req, res) => {
    try {
        const {userId, itemId, size} = req.body;
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};
        
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {
                [size]: 1
            };
        }

        await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
        res.json({success: true, message: "Product added to cart"});
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// update user cart
const updateCart = async (req, res) => {
    try {
        const {userId, itemId, size, quantity} = req.body;
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        // If quantity is 0 or less, remove the item
        if (quantity <= 0) {
            if (cartData[itemId] && cartData[itemId][size]) {
                delete cartData[itemId][size];
                // If no more sizes, remove the entire item
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            // Update quantity
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
        res.json({success: true, message: "Cart updated successfully"});
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// delete item from user cart
const deleteFromCart = async (req, res) => {
    try {
        const {userId, itemId, size} = req.body;
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        if (cartData && cartData[itemId]) {
            if (size) {
                // Delete specific size
                if (cartData[itemId][size] !== undefined) {
                    delete cartData[itemId][size];
                    // If no more sizes, delete the whole item
                    if (Object.keys(cartData[itemId]).length === 0) {
                        delete cartData[itemId];
                    }
                }
            } else {
                // Delete whole item if no size specified
                delete cartData[itemId];
            }
            
            // Clean up empty objects
            for (const id in cartData) {
                if (Object.keys(cartData[id]).length === 0) {
                    delete cartData[id];
                }
            }
            
            await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
            res.json({success: true, message: "Product removed from cart"});
        } else {
            res.json({success: false, message: "Product not found in cart"});
        }
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const {userId} = req.body;
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        // Clean up any empty entries or zero quantities
        for (const itemId in cartData) {
            for (const size in cartData[itemId]) {
                if (cartData[itemId][size] <= 0) {
                    delete cartData[itemId][size];
                }
            }
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }

        // Update the cleaned cart data if needed
        if (JSON.stringify(userData.cartData) !== JSON.stringify(cartData)) {
            await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
        }

        res.json({success: true, cartData});
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

export {addToCart, updateCart, getUserCart, deleteFromCart}
