const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Remitente
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Receptor
    message: { type: String, required: true }, // Contenido del mensaje
    isRead: { type: Boolean, default: false }, // Estado de lectura del mensaje
    createdAt: { type: Date, default: Date.now } // Fecha y hora del mensaje
});

module.exports = mongoose.model('Chat', chatSchema);
