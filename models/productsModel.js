const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, trim: true, required: true },
    productDescription: { type: String, trim: true, required: true },
    price: { type: String, trim: true, required: true },
    Rating: { type: Number, },
    productImage1: { type: String, trim: true, },
    productImage2: { type: String, trim: true, },
    productImage3: { type: String, trim: true, },
    productImage4: { type: String, trim: true, },
    productImage5: { type: String, trim: true, },
    categoryType: { type: String, trim: true, required: true },
    projectType: { type: String, trim: true, required: true },
    projectUrl: { type: String, trim: true, },
    codeUrl: { type: String, trim: true, },
    mainPage: { type: Boolean, default: false },

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
