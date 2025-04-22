const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Producto = require('../models/newproduct');

const newproduct = express.Router();

//Verificar que la carpeta "uploads" existe, si no, crearla
const uploadDir = path.join(__dirname, '../public/uploads/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Configuración de `multer`
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const randomNumber = generateRandomNumber();
        const extension = file.originalname.split('.').pop();  // Obtiene la extensión del archivo
        cb(null, `foto-${timestamp}-${randomNumber}.${extension}`);  // Nombre del archivo personalizado
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes en formato JPEG, JPG, PNG o GIF.'));
        }
    }
}).array('productImages', 5);

newproduct.post('/agregar-producto', (req, res) => {
    const usuario = req.session.user;
    const estatus = 1
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        console.log(usuario); // Depuración: Verifica los datos recibidos

        try {
            const { productName, productDescription, productPrice, productStock, productCategory, productTags, productBrand, productModel, productColor, productSize } = req.body;

            const newProduct = new Producto({
                productName,
                productDescription,
                productPrice,
                productStock,
                productCategory,
                productImages: req.files.map(file => `resources/uploads/${file.filename}`),
                productTags: productTags ? productTags.split(',').map(tag => tag.trim()) : [],
                productBrand,
                productModel,
                productColor,
                usuarioid: usuario._id,
                status: estatus,
                productSize
            });

            await newProduct.save();

            // Asegúrate de que req.session.user esté definido
            
            if (!usuario) {
                throw new Error("Usuario no autenticado");
            }

            res.render('nuevo-producto', { 
                alert: true,
                alertTitle: "Producto Agregado",
                alertMessage: "Ahora tu producto está a la venta! Ve a la configuración si quieres agregar más imágenes",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: 'misproductos',
                Session: true, 
                usuario: usuario 
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar producto', error: error.message });
        }
    });
});

// Ruta para actualizar un producto
newproduct.post('/actualizar-producto/:id', upload, async (req, res) => {
    const { id } = req.params;
    const {
        productName,
        productDescription,
        productPrice,
        productStock,
        productCategory
    } = req.body;

    try {
        // Obtener el producto actual
        const productoExistente = await Producto.findById(id);
        if (!productoExistente) {
            return res.status(404).send("Producto no encontrado");
        }

        // Verificar si hay archivos subidos
        let nuevasImagenes = productoExistente.productImages;
        if (req.files && req.files.length > 0) {
            nuevasImagenes = req.files.map(file => `resources/uploads/${file.filename}`);
        }

        // Actualizar el producto en la base de datos
        await Producto.findByIdAndUpdate(id, {
            productName,
            productDescription,
            productPrice,
            productStock,
            productCategory,
            productImages: nuevasImagenes
        });

        // Redirigir o mostrar mensaje de éxito
        res.redirect('/productedit/' + id);
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).send("Error al actualizar el producto");
    }
});



// Función para generar un número aleatorio
function generateRandomNumber() {
    return Math.floor(Math.random() * 10000);  // Genera un número aleatorio entre 0 y 9999
}

module.exports = newproduct;
