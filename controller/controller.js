const express = require('express');
const controller = express.Router(); // Usa Router, pero lo llamas "controller"
const Usuario = require('../models/usuarios');
const Producto = require('../models/newproduct');
const Carrito = require('../models/carrito');
const Chat = require('../models/chats');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');



// Obtener carrito del usuario
controller.get('/car', async (req, res) => {
    if (!req.session?.user?._id) { 
        return res.render('car', { Session: false });
    }

    try {
        const usuarioId = req.session.user._id;
        
        // Buscar el carrito del usuario
        const carrito = await Carrito.findOne({ usuarioId }).populate('items.productoId');
        console.log(carrito.items[0])

        res.render('car', {
            Session: true,
            usuario: req.session.user,
            carritoFrond: carrito,
        });

    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send("Error al cargar el carrito");
    }
});


// Eliminar producto
// Cambiar status del producto en lugar de eliminarlo
controller.delete('/productdelete/:producto', async (req, res) => {
    const idProducto = req.params.producto;

    if (!req.session.user) {
        return res.status(401).json({ message: "No autorizado" });
    }

    try {
        const producto = await Producto.findById(idProducto);

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar que el usuario tiene permiso para modificar el producto
        if (producto.usuarioid.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({ message: "No tienes permiso para modificar este producto" });
        }

        // Cambiar el status del producto a "2"
        producto.status = "2";
        await producto.save();

        res.status(200).json({ message: "Estado del producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el estado del producto:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});



// Editar productos en la ventana de productedit
controller.get('/productedit/:producto', async (req, res) => {
    const idproducto = req.params.producto;
    if (!req.session.user) { 
        return res.render('productedit', { Session: false });
    }

    try {
        const producto = await Producto.findOne({ _id: idproducto });  // Cambiado de find() a findOne()
        if (!producto) {
            return res.status(404).send("Producto no encontrado");
        }

        const usuario = await Usuario.findOne({ _id: producto.usuarioid });
        const productosRelacionados = await Producto.find({});

        res.render('productedit', {
            Session: true, 
            usuario: req.session.user,
            producto: producto,  // Ahora producto es un objeto, no un array
            relacionados: productosRelacionados,
            Datosusuario: usuario
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});



// Registro
controller.post('/registro', async (req, res) => {
    const { firstName, lastName, email, password, address, city, state, zip, country, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = new Usuario({
        nombre: firstName,
        apellidos: lastName,
        correo: email,
        password: hashedPassword,
        direccion: {
            calle: address,
            ciudad: city,
            estado: state,
            codigo_postal: zip,
            pais: country
        },
        telefono: phone,
        fecha_creacion: new Date()
    });

    try {
        await usuario.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Login
controller.post('/loginauth', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo: email });
        if (usuario && await bcrypt.compare(password, usuario.password)) {
            req.session.user = usuario; 
            res.render('login', { 
                alert: true,
                alertTitle: "¡BIENVENIDO!",
                alertMessage: "Nos alegra verte aquí. 🎉 Disfruta de tu experiencia de compra.",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: '',
                usuario: usuario
            });
            console.log("Funciona")
        } else {
            res.render('login', { 
                alert: true,
                alertTitle: "Intenta De Nuevo",
                alertMessage: "Correo o contraseña incorrectos",
                alertIcon: "warning",
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login',
                usuario: usuario
            });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión');
    }
});

// Ruta principal
controller.get('/', async (req, res) => {
    if (!req.session.user) {
        res.render('index', {
            Session: false 
        });
    } else {
        try {
            const productos = await Producto.find({});
            res.render('index', {
                Session: true, 
                usuario: req.session.user,
                productos: productos
            });
    
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).send("Error al cargar productos");
        }
    }
});


// Nuevo producto
controller.get('/nuevo-producto', (req, res) => {
    if (req.session.user === undefined) {
        res.render('nuevo-producto', {
            Session: false 
        });
    } else {
        res.render('nuevo-producto', {
            Session: true, 
            usuario: req.session.user 
        });
    }
    console.log(req.session); // Para depurar y ver el contenido de la sesión
});


// Mis
controller.get('/misproductos', async (req, res) => {
    if (!req.session.user) { 
        return res.render('misproductos', {
            Session: false 
        });
    }

    try {
        const productos = await Producto.find({ usuarioid: req.session.user._id });
        res.render('misproductos', {
            Session: true, 
            usuario: req.session.user,
            productos: productos
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});

// Otras rutas
controller.get('/login', (req, res) => {
    res.render('login');
});

controller.get('/registro', (req, res) => {
    res.render('registro');
});




controller.get('/chats/:contacto', async (req, res) => {
    const contacto = req.params.contacto;

    if (!req.session.user) {
        return res.render('chats', { Session: false });
    }

    const userId = new mongoose.Types.ObjectId(req.session.user._id);
    const contactoId = new mongoose.Types.ObjectId(contacto); // ✅


    try {
        const mensajes = await Chat.find({
            $or: [
                { senderId: userId, receiverId: contactoId },
                { senderId: contactoId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        res.render('chats', {
            Session: true,
            usuario: req.session.user,
            contacto: contacto,
            mensajes: mensajes
        });

        console.log(mensajes);
    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        res.status(500).send("Error al cargar los mensajes.");
    }
});




controller.get('/contactos', async (req, res) => {
    if (!req.session.user) {
        return res.render('contactos', {
            Session: false 
        });
    }

    const userId = req.session.user._id;

    try {
        // Buscar todos los mensajes donde el usuario esté involucrado
        const mensajes = await Chat.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });

        // Obtener los IDs de los contactos con los que ha chateado
        const contactosIds = new Set();

        mensajes.forEach(msg => {
            if (msg.senderId.toString() !== userId.toString()) {
                contactosIds.add(msg.senderId.toString());
            }
            if (msg.receiverId.toString() !== userId.toString()) {
                contactosIds.add(msg.receiverId.toString());
            }
        });

        // Buscar los usuarios por esos IDs
        const contactos = await Usuario.find({ _id: { $in: Array.from(contactosIds) } });

        res.render('contactos', {
            Session: true,
            usuario: req.session.user,
            contactos: contactos
        });

    } catch (error) {
        console.error("Error al obtener contactos con mensajes:", error);
        res.status(500).send("Error al cargar contactos.");
    }
});


controller.get('/shopitem/:producto', async (req, res) => {
    const idproducto = req.params.producto;
    if (!req.session.user) { 
        return res.render('misproductos', {
            Session: false 
        });
    }

    try {
        const producto = await Producto.find({ _id: idproducto });
        const usuario = await Usuario.find({_id: producto[0].usuarioid});
        const productosRelacionados = await Producto.find({});
        res.render('shopitem', {
            Session: true, 
            usuario: req.session.user,
            producto: producto,
            relacionados: productosRelacionados,
            Datosusuario: usuario
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});

controller.use('/', require('./newproduct.js'));
controller.use('/', require('./carrito.js'));
controller.use('/', require('./mensajes.js'));


// Exporta el controller
module.exports = controller;