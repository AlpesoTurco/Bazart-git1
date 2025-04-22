const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Servidor HTTP
const socketIo = require('socket.io'); // WebSockets
const Producto = require('../models/newproduct');
const Carrito = require('../models/carrito');
const Chat = require('../models/chats');
const mensajes = express.Router(); // Crear el router
const server = http.createServer(mensajes); // Crear el servidor HTTP
const io = socketIo(server); // Configurar Socket.io


// WebSockets - Conexión con los clientes
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        if (!message.trim()) return;

        // Guardar mensaje en MongoDB
        const newMessage = new Chat({ senderId, receiverId, message, createdAt: new Date() });
        await newMessage.save();

        // Emitir mensaje a ambos usuarios
        io.emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Ruta para enviar mensajes (usando REST API además del WebSocket)
mensajes.post('/enviar-mensaje', async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ message: "Debes iniciar sesión para enviar mensajes" });
        }

        const senderId = new mongoose.Types.ObjectId(req.session.user._id);
        const { receiverId, message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "ID del receptor inválido" });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "El mensaje no puede estar vacío" });
        }

        const newMessage = new Chat({
            senderId,
            receiverId,
            message,
            createdAt: new Date()
        });

        await newMessage.save();

        io.emit('receiveMessage', newMessage); // Notificar a los clientes en tiempo real

        res.status(201).json({
            message: "Mensaje enviado correctamente",
            chat: newMessage
        });

    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});



module.exports = mensajes;