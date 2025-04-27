const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    comentarioTexto: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    status: { type: String, default: 'activo' },
    votosPositivos: { type: Number, default: 0 },
    votosNegativos: { type: Number, default: 0 }
});

module.exports = mongoose.model('Comentario', comentarioSchema);
