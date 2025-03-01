import {v2 as cloudinary} from "cloudinary";
import ProductModel from "../models/productModel.js";


// function for add products

const addProduct = async (req, res) => {
    try {

        const {name, price, description, category, subCategory, sizes, bestseller } = req.body;
        
        // Detailed logging of the request body
        console.log('Raw request body:', req.body);
        console.log('Bestseller from request:', bestseller);
        console.log('Bestseller type:', typeof bestseller);

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        
        let imagesUrl = await Promise.all(
            images.map(async(item)=> {
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                return result.secure_url;
            })
        )

        // Convert bestseller to boolean explicitly
        const isBestseller = bestseller === "1" || bestseller === 1 || bestseller === "true" || bestseller === true;
        console.log('Converted bestseller value:', isBestseller);

        const productData = {
            name,
            price:Number(price),
            description,
            category,
            subCategory,
            sizes:JSON.parse(sizes),
            bestseller: isBestseller,
            image:imagesUrl,
            date: Date.now(),
        }

        console.log('Final product data:', productData);
        const product = new ProductModel(productData);
        await product.save();

        res.json({success:true, message:"Product added successfully", product})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// function for list products

const listProducts = async (req, res) => {
    try {
        console.log('Fetching products...');
        const products = await ProductModel.find().lean().exec();
        console.log('Products found:', products.length);
        
        if (!products || products.length === 0) {
            return res.json({ success: true, products: [], message: 'No products found' });
        }
        
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error in listProducts:', error);
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
}

// function for delete products

const removeProduct = async (req, res) => {
    try {

        await ProductModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Product deleted successfully"});

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// function for single product info

const singleProduct = async (req, res) => {
    try {

        const {productId} = req.body;
        const product = await ProductModel.findById(productId);
        res.json({success:true, product});

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

export {addProduct, listProducts, removeProduct, singleProduct};
