const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellidos: String,
    correo: String,
    password: String,
    direccion: {
        calle: String,
        ciudad: String,
        estado: String,
        codigo_postal: String,
        pais: String
    },
    telefono: String,
    fecha_creacion: Date
});

// Verificar si el modelo ya ha sido definido
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
