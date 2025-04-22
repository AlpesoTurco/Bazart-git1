const express = require('express');
const mongoose = require('mongoose');
const Producto = require('../models/newproduct');
const Carrito = require('../models/carrito');
const carrito = express.Router();

// Agregar producto al carrito
carrito.post('/agregar-al-carrito', async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ message: "Debes iniciar sesión para agregar productos al carrito" });
        }

        const usuarioId = new mongoose.Types.ObjectId(req.session.user._id);
        let { productId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Cantidad inválida" });
        }

        const producto = await Producto.findById(productId);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Buscar y actualizar o insertar en el carrito
        const carrito = await Carrito.findOneAndUpdate(
            { usuarioId, "items.productoId": productId }, // Busca si el usuario ya tiene el producto en su carrito
            { $inc: { "items.$.cantidad": quantity } }, // Si lo encuentra, incrementa la cantidad
            { new: true }
        );

        if (!carrito) {
            // Si no encontró el producto en el carrito, agregarlo como un nuevo item
            const nuevoCarrito = await Carrito.findOneAndUpdate(
                { usuarioId }, 
                { $push: { items: { productoId: productId, cantidad: quantity } } }, 
                { new: true, upsert: true } // Crea el carrito si no existe
            );

            return res.status(201).json({
                message: "Producto agregado al carrito correctamente",
                carrito: nuevoCarrito,
                alert: true,
                alertTitle: "🛒 Producto agregado",
                alertMessage: "Se ha añadido al carrito correctamente",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: 'shopitem/' + productId,
            });
        }

        res.status(201).json({
            message: "Cantidad del producto actualizada en el carrito",
            carrito,
            alert: true,
            alertTitle: "🛒 Producto actualizado",
            alertMessage: "Se ha actualizado la cantidad en el carrito",
            alertIcon: "info",
            showConfirmButton: false,
            timer: 1500,
            ruta: 'shopitem/' + productId,
        });

    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Eliminar producto del carrito
carrito.post('/eliminar-del-carrito', async (req, res) => {
    console.log("Holaaaaa")
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ message: "Debes iniciar sesión para eliminar productos del carrito" });
        }

        const usuarioId = new mongoose.Types.ObjectId(req.session.user._id);
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        // Buscar el carrito del usuario
        const carrito = await Carrito.findOne({ usuarioId });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        // Buscar si el producto existe en el carrito
        const itemIndex = carrito.items.findIndex(item => item.productoId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        // Eliminar el producto del carrito
        carrito.items.splice(itemIndex, 1);
        
        // Guardar los cambios en el carrito
        await carrito.save();

        res.status(200).json({
            message: "Producto eliminado del carrito",
            carrito,
            alert: true,
            alertTitle: "🛒 Producto eliminado",
            alertMessage: "Se ha eliminado el producto del carrito correctamente",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: '/car' // O la ruta donde quieras redirigir al usuario
        });

    } catch (error) {
        console.log("Error al eliminar producto del carrito:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});


module.exports = carrito;
