const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Librería para manejar rutas de archivos
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

// archivos estaticoas para web
app.use(express.static(__dirname));
// conexion a mongo
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDBcon éxito"))
  .catch((err) => console.error("Error de conexión:", err.message));

// modelo de datos para mongo
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
  })
);

const Log = mongoose.model(
  "Log",
  new mongoose.Schema({
    evento: String,
    descripcion: String,
    usuario: String,
    fecha: { type: Date, default: Date.now },
  })
);
// Modelo para los Niveles de Ingredientes
const Ingredientes = mongoose.model(
  "Ingrediente",
  new mongoose.Schema({
    cs: { type: Number, default: 0 },
    cn: { type: Number, default: 0 },
    oc: { type: Number, default: 0 },
  }),
  "ingredientes" 
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ruta api log y reg
app.post("/api/registrar", async (req, res) => {
  try {
    const nuevoUsuario = new User(req.body);
    await nuevoUsuario.save();
    await new Log({
      evento: "Registro de Usuario",
      descripcion: `Se creó la cuenta de ${nuevoUsuario.nombre}`,
      usuario: nuevoUsuario.email,
    }).save();
    res.status(201).json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar: " + error.message });
  }
});

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

app.get("/api/niveles", async (req, res) => {
  try {
    const niveles = await Ingredientes.findOne();
    if (!niveles) {
      return res.json({ cs: 0, cn: 0, oc: 0 });
    }
    res.json(niveles);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
