// 1. Definir la URL base de la API automáticamente
const API_URL = "https://pimienton3000-system.onrender.com";
// REGISTRO
const formRegistro = document.getElementById("register-form");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = formRegistro.querySelector('input[name="name"]').value;
    const email = formRegistro.querySelector('input[name="email"]').value;
    const pass1 = document.getElementById("pass1").value;
    const pass2 = document.getElementById("pass2").value;

    if (pass1 !== pass2) return alert("Las contraseñas no coinciden");

    try {
      // Usamos ${API_URL} en lugar de la dirección fija
      const res = await fetch(`${API_URL}/api/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password: pass1 }),
      });
      const data = await res.json();
      alert(data.mensaje || data.error);
      if (res.ok) window.location.href = "index.html";
    } catch (err) {
      alert("Error de conexión");
    }
  });
}

// LOGIN
const formLogin = document.getElementById("login-form");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = formLogin.querySelector('input[name="correo-log"]').value;
    const password = formLogin.querySelector('input[name="password-log"]').value;

    try {
      // Usamos ${API_URL} en lugar de la dirección fija
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("¡Bienvenido al sistema!");
        localStorage.setItem("usuarioNombre", data.usuario.nombre);
        window.location.href = "dashboard.html";
      } else {
        alert("❌" + data.error);
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });
}
