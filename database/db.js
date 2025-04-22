const mongoose = require('mongoose');

const conexion = async () => {
  try {
    const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
    await mongoose.connect(uri, {
      authSource: process.env.MONGO_DB, // Base de datos de autenticación
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos de MongoDB:', error);
  }
};

module.exports = conexion;
