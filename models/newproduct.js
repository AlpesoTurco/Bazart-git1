const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productStock: { type: Number, required: true },
    productCategory: { type: String, required: true },
    productImages: [{ type: String }], // Almacenar nombres de archivos
    productTags: [{ type: String }],
    productBrand: { type: String },
    productModel: { type: String },
    productColor: { type: String },
    productSize: { type: String },
    usuarioid: { type: String },
    status: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', productoSchema);
