const nodemailer = require("nodemailer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // librería para manejar rutas de archivos
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
// configuración gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "jonathangabriel5889@gmail.com",
    pass: process.env.GMAIL_APP_PASS,
  },
  family: 4, 
  connectionTimeout: 15000, 
  tls: {
    rejectUnauthorized: false
  }
});
//enviar correos
const enviarCorreoLogin = async (nombre, emailDestino) => {
  try {
    await transporter.sendMail({
      from: '"Pimienton 3000 System" <jonathangabriel5889@gmail.com>',
      to: emailDestino,
      subject: "Alerta de Seguridad: Inicio de Sesion detectado ",
      html: `
        <div style="font-family: sans-serif; border: 2px solid #ed6c02; padding: 20px; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #ed6c02;">Hola ${nombre}</h2>
          <p>Hemos detectado un nuevo inicio de sesión en tu cuenta de <strong>Pimienton3000</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
            <strong>Usuario:</strong> ${emailDestino}<br>
            <strong>Plataforma:</strong> Web Online
          </div>
          <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
            Si fuiste tu, ignora este correo. Si no fuiste tu , contactanos.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <small style="color: #aaa;">Enviado automáticamente por el Sistema de Logs de Pimienton3000</small>
        </div>
      `,
    });
    console.log(`Alerta enviada a: ${emailDestino}`);
  } catch (error) {
    console.error("Error de Nodemailer:",error);
  }
};

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
  const { nombre, email } = req.body;
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
    let detalleError = error.message;
    
    // error por correo duplicado (
    if (error.code === 11000) {
      detalleError = `Intento de registro con correo ya existente: ${email}`;
    }
     await new Log({
      evento: "Error en Registro",
      descripcion: detalleError,
      usuario: email || "Desconocido", 
    }).save();
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

    //correo enviado
    enviarCorreoLogin(usuario.nombre, usuario.email);

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
