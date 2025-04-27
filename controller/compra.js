const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pedido, Carrito } = require('../models'); // Suponiendo que Pedido y Carrito están definidos
const mongoose = require('mongoose');

// Ruta para finalizar la compra y generar los tickets de cada producto
controller.post('/finalizar-compra', async (req, res) => {
    const usuarioId = req.session.user._id;

    try {
        // Buscar el carrito del usuario
        const carrito = await Carrito.findOne({ usuarioId }).populate('items.productoId');
        if (!carrito) {
            return res.status(404).json({ message: 'No se encontró el carrito.' });
        }

        // Crear el pedido
        const pedido = new Pedido({
            usuarioId,
            items: carrito.items.map(item => ({
                productoId: item.productoId._id,
                cantidad: item.cantidad,
                precio: item.productoId.productPrice,
                descripcion: item.productoId.productDescription,
                imagen: item.productoId.productImage,
            })),
            estado: 'Comprado',
            direccion: req.body.direccion,
            telefono: req.body.telefono,
            email: req.body.email,
        });

        await pedido.save();

        // Generar un ticket para cada producto en el carrito
        for (let item of carrito.items) {
            await generarTicketPorProducto(item, pedido._id);
        }

        // Eliminar los productos del carrito después de la compra
        await Carrito.updateOne({ usuarioId }, { $set: { items: [] } });

        // Redirigir al usuario o enviar la respuesta con los tickets generados
        res.status(200).json({
            message: 'Compra finalizada correctamente.',
            mensaje: 'Los tickets han sido generados.',
        });
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        res.status(500).json({ message: 'Error al finalizar la compra' });
    }
});

// Función para generar el ticket de cada producto
async function generarTicketPorProducto(item, pedidoId) {
    const doc = new PDFDocument();
    const producto = item.productoId;
    const filePath = path.join(__dirname, `../public/tickets/pedido_${pedidoId}_producto_${producto._id}.pdf`);
    
    doc.pipe(fs.createWriteStream(filePath));

    // Crear el contenido del ticket
    doc.fontSize(18).text(`Ticket de Compra: Producto ${producto.productName}`, { align: 'center' });
    doc.fontSize(14).text(`Producto: ${producto.productName}`);
    doc.text(`Marca: ${producto.productBrand}`);
    doc.text(`Cantidad: ${item.cantidad}`);
    doc.text(`Precio: $${producto.productPrice.toFixed(2)}`);
    doc.text(`Total: $${(producto.productPrice * item.cantidad).toFixed(2)}`);
    doc.text(`Descripción: ${producto.productDescription || 'Sin descripción'}`);
    doc.text(`Imagen: ${producto.productImages[0] || 'No disponible'}`);
    doc.text(`Pedido ID: ${pedidoId}`);
    doc.text(`Fecha: ${new Date().toLocaleString()}`);
    doc.text(`Estado: ${item.estado || 'Pendiente'}`);

    // Finalizar el PDF
    doc.end();

    // Devuelve la URL del ticket generado
    return filePath;
}
