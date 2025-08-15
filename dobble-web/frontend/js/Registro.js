function getApiBaseUrl() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : "https://dobbleweb.onrender.com";
}

document.getElementById("btnVolverInicio").addEventListener("click", function () {
    window.location.href = "index.html";
});

document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const API_BASE_URL = getApiBaseUrl();

    const datos = {
        usuario: document.getElementById('usuario').value.trim(),
        clave: document.getElementById('clave').value,
        nombres: document.getElementById('nombres').value.trim(),
        apellidos: document.getElementById('apellidos').value.trim(),
        cedula: document.getElementById('cedula').value.trim(),
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
        nivel_escolaridad: document.getElementById('nivel_escolaridad').value.trim(),
        tipo_usuario: document.getElementById('tipo_usuario').value.trim()
    };

    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '';
    mensaje.className = 'text-sm text-blue-500 text-center';
    mensaje.textContent = 'Registrando usuario...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/usuario/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (response.ok) {
            mensaje.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
            mensaje.className = 'text-sm text-green-600 text-center';
            document.getElementById('formRegistro').reset();

            setTimeout(() => {
                if (confirm('¿Quieres ir al login ahora?')) {
                    window.location.href = 'index.html';
                }
            }, 2000);

        } else {
            mensaje.textContent = data.message || 'Error al registrar usuario.';
            mensaje.className = 'text-sm text-red-500 text-center';
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        mensaje.textContent = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
        mensaje.className = 'text-sm text-red-500 text-center';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const usuarioInput = document.getElementById('usuario');
    const cedulaInput = document.getElementById('cedula');

    if (usuarioInput) {
        usuarioInput.addEventListener('blur', async function () {
            const usuario = this.value.trim();
            if (usuario.length >= 3) {
                try {
                    const response = await fetch(`${getApiBaseUrl()}/api/usuario/verificar-usuario/${usuario}`);
                    const data = await response.json();

                    if (!response.ok && data.exists) {
                        this.setCustomValidity('Este nombre de usuario ya está en uso');
                        this.reportValidity();
                    } else {
                        this.setCustomValidity('');
                    }
                } catch (error) {
                    console.warn('No se pudo verificar la disponibilidad del usuario');
                }
            }
        });
    }

    if (cedulaInput) {
        cedulaInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
});
