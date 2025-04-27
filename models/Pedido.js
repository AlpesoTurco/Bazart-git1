const mongoose = require('mongoose');

// Asegúrate de que la referencia esté correctamente conectada al modelo de Usuario
const pedidoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',  // Cambié 'User' por 'Usuario' para usar el nombre correcto de tu modelo
        required: true,
    },
    items: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',  // Asegúrate de que 'Producto' esté bien definido
            required: true,
        },
        cantidad: {
            type: Number,
            required: true,
        },
        precio: {
            type: Number,
            required: true,
        },
        descripcion: String,
        imagen: String,
        estado: {
            type: String,
            default: 'Pendiente', // Puedes agregar más estados como 'Enviado', 'Entregado', etc.
        },
    }],
    estado: {
        type: String,
        default: 'Comprado', 
    },
    direccion: String, 
    telefono: String,
    email: String,
    fechaCompra: {
        type: Date,
        default: Date.now,
    },
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
