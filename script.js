// Configuración de la API
const API_URL = "https://pimienton3000-system.onrender.com";
//menasjes
function mostrarMensaje(texto, tipo = 'error') {
    const caja = document.getElementById('mensaje-error');
    if (!caja) return; 
    caja.textContent = texto;
    caja.classList.remove('mensaje-oculto', 'error-visible', 'success-visible');

    if (tipo === 'success') {
        caja.classList.add('success-visible');
    } else {
        caja.classList.add('error-visible');
    }

setTimeout(() => {

       caja.classList.remove('error-visible', 'success-visible');
 
       caja.classList.add('mensaje-oculto');
    }, 4000);
}

// Lógica de Registro 
const formRegistro = document.getElementById("register-form");
if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = formRegistro.querySelector('input[name="name"]').value;
        const email = formRegistro.querySelector('input[name="email"]').value;
        const pass1 = document.getElementById("pass1").value;
        const pass2 = document.getElementById("pass2").value;

        if (pass1 !== pass2) {
            return mostrarMensaje("Las contraseñas no coinciden");
        }

        try {
            const res = await fetch(`${API_URL}/api/registrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password: pass1 }),
            });
            const data = await res.json();

            if (res.ok) {
                mostrarMensaje("Cuenta creada", "success");
                setTimeout(() => window.location.href = "index.html", 2000);
            } else {
                mostrarMensaje(data.error || "Error al registrar");
            }
        } catch (err) {
            mostrarMensaje("Error de conexión con el servidor");
        }
    });
}

// Lógica de Login 
const formLogin = document.getElementById("login-form");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = formLogin.querySelector('input[name="correo-log"]').value;
        const password = formLogin.querySelector('input[name="password-log"]').value;

        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("usuarioNombre", data.usuario.nombre);
                mostrarMensaje(`Bienvenido, ${data.usuario.nombre}`, "success");
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            } else {
                mostrarMensaje("Correo o contraseña incorrectos");
            }
        } catch (err) {
            mostrarMensaje("Error de conexión con el servidor");
        }
    });
}
