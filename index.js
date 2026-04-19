//Arduino

//

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
const MONGO_URI = process.env.MONGO_URI;
// 1 CONEXIÓN A MONGODB ATLAS
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas con éxito"))
  .catch((err) => console.error("❌ Error de conexión:", err.message));

// 2 MODELOS DE DATOS
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
  }),
);

const Log = mongoose.model(
  "Log",
  new mongoose.Schema({
    evento: String,
    descripcion: String,
    usuario: String,
    fecha: { type: Date, default: Date.now },
  }),
);

// 3 RUTAS
app.get("/", (req, res) => res.send("Servidor Pimienton3000 activo"));

// RUTA DE REGISTRO
app.post("/api/registrar", async (req, res) => {
  try {
    const nuevoUsuario = new User(req.body);
    await nuevoUsuario.save();
    await new Log({
      evento: "Registro de Usuario",
      descripcion: `Se creó la cuenta de ${nuevoUsuario.nombre}`,
      usuario: nuevoUsuario.email,
      password: nuevoUsuario.password,
    }).save();
    res.status(201).json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar: " + error.message });
  }
});

// RUTA DE LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario || usuario.password !== password) {
      await new Log({
        evento: "Intento Fallido",
        descripcion: `Credenciales incorrectas para: ${email}`,
        usuario: email,
      }).save();
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }
    await new Log({
      evento: "Inicio de Sesión",
      descripcion: `Acceso exitoso de ${usuario.nombre}`,
      usuario: usuario.email,
    }).save();
    res.json({
      mensaje: "¡Bienvenido!",
      usuario: { nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

//port del servidor
// Busca donde dice app.listen(3000...) y cámbialo por esto:
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});