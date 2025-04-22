const mongoose = require('mongoose');

const CarritoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    items: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        cantidad: { type: Number, required: true, default: 1 }
    }],
    fechaCreacion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Carrito', CarritoSchema);
