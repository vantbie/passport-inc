document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si es admin y cargar perfil propio
    try {
        const response = await fetch('/auth/perfil', { credentials: 'include' });
        if (!response.ok) throw new Error('No autorizado');
        const respuesta = await response.json();
        const user = respuesta.data || respuesta.user;
        
        // Si no es admin, lo sacamos de aquí
        if (user.role !== 'ADMIN') {
            alert("Acceso denegado. Área restringida.");
            window.location.href = '/perfil.html';
            return;
        }

        const nombreEl = document.getElementById('admin-name');
        const apellidoEl = document.getElementById('admin-lastname');
        const emailEl = document.getElementById('admin-email');

        if (nombreEl) nombreEl.textContent = user.firstName;
        if (apellidoEl) apellidoEl.textContent = user.lastName || ''; // Por si no tiene apellido
        if (emailEl) emailEl.textContent = user.email;

        // Cargar la lista de usuarios
        cargarUsuarios();

    } catch (error) {
        window.location.href = '/index.html';
    }

    // Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '/index.html';
    });
});

// Variable para controlar el mensaje
const mensajeDiv = document.getElementById('admin-message');

async function cargarUsuarios() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    try {
        const response = await fetch('/admin', { credentials: 'include' });
        const data = await response.json();
        
        tbody.innerHTML = ''; 

        const listaUsuarios = data.data || [];

        if(listaUsuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados</td></tr>';
            return;
        }
        
        listaUsuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.firstName} ${usuario.lastName || ''}</td>
                <td>${usuario.email}</td>
                <td>${usuario.role || 'user'}</td>
                <td>
                    ${usuario.role === 'ADMIN' ? 
                        '<span style="color:#aaa;">-</span>' : 
                        `<button class="btn-delete" onclick="preguntarEliminar('${usuario.id}', '${usuario.firstName}')">
                            <i class="fas fa-trash"></i>
                        </button>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error al cargar usuarios</td></tr>';
    }
}

// Paso 1: Preguntar (Muestra texto en el div de arriba)
window.preguntarEliminar = (id, nombre) => {
    // Usamos el estilo .error para que salga rojo (como alerta)
    mensajeDiv.className = 'message-box error'; 
    mensajeDiv.innerHTML = `
        ¿Estás seguro de eliminar a&nbsp;<b> ${ nombre } </b>? 
        <button class="btn-confirm-mini" onclick="ejecutarEliminacion('${id}')">SÍ</button> 
        <button class="btn-confirm-mini" onclick="cancelarEliminacion()">NO</button>
    `;
};

// Paso 2: Si dice que NO
window.cancelarEliminacion = () => {
    mensajeDiv.textContent = ''; // Borra el mensaje
    mensajeDiv.className = 'message-box';
};

// Paso 3: Si dice que SÍ (Ejecuta el fetch)
window.ejecutarEliminacion = async (id) => {
    mensajeDiv.innerHTML = 'Eliminando...'; // Feedback instantáneo

    try {
        const response = await fetch(`/admin/${id}`, { 
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok || response.status === 204) {
            // Éxito: Pone el mensaje en verde
            mensajeDiv.className = 'message-box success';
            mensajeDiv.textContent = 'Usuario eliminado correctamente.';
            cargarUsuarios(); // Recarga la tabla

            // Borra el mensaje verde a los 3 segundos
            setTimeout(() => { 
                mensajeDiv.textContent = ''; 
                mensajeDiv.className = 'message-box'; 
            }, 3000);
        } else {
            mensajeDiv.className = 'message-box error';
            mensajeDiv.textContent = 'Error al eliminar el usuario.';
        }
    } catch (error) {
        console.error(error);
        mensajeDiv.className = 'message-box error';
        mensajeDiv.textContent = 'Error de conexión.';
    }
};