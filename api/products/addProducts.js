const express = require('express');
const router = express.Router();
const Product = require("../../models/productsModel");
const { uploadFile, deleteFile } = require("../../utils/cloudinary");
const { upload } = require("../../multer/multerstore");

router.post('/add-product', async (req, res) => {
    try {
        const { codeUrl, productName, productDescription, price, Rating, categoryType, projectType, projectUrl,Image1} = req.body;
        // console.log(req.body);
        const uploadedImage = await uploadFile(req.body.image, "products");
        if(req.body.image1){

            const uploadedImage1 = await uploadFile(req.body.image1, "products");
        }
        if(req.body.image2){

            const uploadedImage2 = await uploadFile(req.body.image2, "products");
        }

        res.json({uploadedImage,uploadedImage1,uploadedImage2});
    //     if (!codeUrl || !productName || !productDescription || !price || !categoryType || !projectType) {
    //         return res.status(400).json({ message: 'Missing required fields' });
    //     }

    //     let productImages = [];
    //     await Promise.all(req.files.map(async (file) => {
    //         const uploadedImage = await uploadFile(file.path, "products");
    //         console.log(uploadedImage);
    //         productImages.push(uploadedImage);
    //     }));
    //     console.log(productImages);
    //   let productImage1=productImages[0]
    //   let productImage2=productImages[1]
    //   let productImage3=productImages[2]
    //   let productImage4=productImages[3]
    //   let productImage5=productImages[4];

    //     const newProduct = new Product({
    //         productName,
    //         productDescription,
    //         price,
    //         Rating,
    //         categoryType,
    //         projectType,
    //         projectUrl,
    //         productImage1,
    //         productImage2,
    //         productImage3,
    //         productImage4,
    //         productImage5,
    //         codeUrl
    //     });
    //     await newProduct.save();

    //     res.status(200).json({ message: 'Successfully added product', newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
});






router.put('/:productId/edit-product', async (req, res) => {
    try {
        const { productId } = req.params;
        const { codeUrl, productName, productDescription, price, Rating, categoryType, projectType, projectUrl } = req.body;

        const existingproduct = await Product.findById(productId);
        if (!existingproduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let productImage1;
        let productImage2;
        let productImage3;
        let productImage4;
        let productImage5;

        existingproduct.productName = productName;
        existingproduct.codeUrl = codeUrl;
        existingproduct.productDescription = productDescription;
        existingproduct.price = price;
        existingproduct.Rating = Rating;
        existingproduct.categoryType = categoryType;
        existingproduct.projectType = projectType;
        existingproduct.projectUrl = projectUrl;

        if (req.files && req.files.Image1) {
            productImage1 = await uploadFile(req.files.Image1.tempFilePath, "products");
            existingproduct.productImage1 = productImage1;
        }
        if (req.files && req.files.Image2) {
            productImage2 = await uploadFile(req.files.Image2.tempFilePath, "products");
            existingproduct.productImage2 = productImage2;
        }
        if (req.files && req.files.Image3) {
            productImage3 = await uploadFile(req.files.Image3.tempFilePath, "products");
            existingproduct.productImage3 = productImage3;
        }
        if (req.files && req.files.Image4) {
            productImage4 = await uploadFile(req.files.Image4.tempFilePath, "products");
            existingproduct.productImage4 = productImage4;
        }
        if (req.files && req.files.Image5) {
            productImage5 = await uploadFile(req.files.Image5.tempFilePath, "products");
            existingproduct.productImage5 = productImage5;
        }

        await existingproduct.save();
        res.status(200).json({ message: 'product updated successfully', updatedproduct: existingproduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
});
router.put('/:productId/show-to-home', async (req, res) => {
    try {
        const { productId } = req.params;


        const existingproduct = await Product.findById(productId);
        if (!existingproduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        existingproduct.mainPage = true
        await existingproduct.save();
        res.status(200).json({ message: 'product updated successfully', updatedproduct: existingproduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
});

router.get("/get-all-products", async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "products not found" });
        }

        res.status(200).json({ message: 'products fetched successfully', products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch all products', error: error.message });
    }
});

router.delete('/:productId/delete-product', async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }
        if (product.productImage1) {
            await deleteFile(product.productImage1);
        }
        if (product.productImage2) {
            await deleteFile(product.productImage2);
        }
        if (product.productImage3) {
            await deleteFile(product.productImage3);
        }
        if (product.productImage4) {
            await deleteFile(product.productImage4);
        }
        if (product.productImage5) {
            await deleteFile(product.productImage5);
        }

        await Product.deleteOne({ _id: productId });
        return res.status(200).json({ message: 'product deleted successfully', product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
});



module.exports = router;