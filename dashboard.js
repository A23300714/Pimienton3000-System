// URL de tu servidor en Render
const API_URL = "https://pimienton3000-system.onrender.com";
const caja = document.getElementById('mensaje');

function mostrarMensaje(texto, tipo = 'success') {
    if (!caja) return;
    caja.textContent = texto;
    caja.classList.remove('mensaje-oculto', 'success-visible');
    caja.classList.add('success-visible');

    setTimeout(() => {
        caja.classList.remove('success-visible');
        caja.classList.add('mensaje-oculto');
    }, 3000);
}

async function analisis() {
    mostrarMensaje("Iniciando análisis de materiales...", "success");

    try {
  
        const res = await fetch(`${API_URL}/api/niveles`);
        const data = await res.json();
   
        actualizarBarra("Cs", data.cs);
        actualizarBarra("Cn", data.cn);
        actualizarBarra("Oc", data.oc);
      
        setTimeout(() => mostrarMensaje("Análisis completado", "success"), 1000);
    } catch (err) {
        mostrarMensaje("Error al conectar con los sensores", "error");
    }
}

function actualizarBarra(id, valor) {
    const barra = document.getElementById(id);
    if (!barra) return;
  
    const columna = barra.parentElement.parentElement;
    const textoPorcentaje = columna.querySelector('.percentage');
    
    const nivel = Math.min(Math.max(valor, -100), 200);

    barra.style.height = `${nivel}%`;
    textoPorcentaje.textContent = `${nivel}%`;
}

function conectar() {
    mostrarMensaje("Conectando", "success");
}
function mezclar() {
    mostrarMensaje("Proceso de mezcla iniciado correctamente", "success");
}

function llenar() {
    mostrarMensaje("Compuerta abierta", "success");
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
