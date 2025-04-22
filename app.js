const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const http = require('http'); // Para crear el servidor HTTP
const socketIo = require('socket.io'); // Para WebSockets
const conexion = require('./database/db');

dotenv.config({ path: './env/.env' });

const app = express();
const server = http.createServer(app); // Crear el servidor HTTP
const io = socketIo(server); // Configurar socket.io

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-segura',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configurar rutas estáticas
app.use('/resources', express.static('public'));
app.use('/resources', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Configurar EJS como motor de vistas
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Conectar base de datos
conexion();

// WebSockets - Conexión con clientes
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        if (!message.trim()) return;

        const Chat = require('./models/chats'); // Importar aquí para evitar problemas de importación circular
        const newMessage = new Chat({ senderId, receiverId, message, createdAt: new Date() });

        await newMessage.save();

        io.emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Acciones (Controlador)
app.use('/', require('./controller/controller'));

// Levantar servidor correctamente
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
