document.addEventListener('DOMContentLoaded', async () => {
    
    // Elementos del DOM que vamos a rellenar
    const welcomeHeader = document.getElementById('header-welcome');
    const inputName = document.getElementById('user-firstName');
    const inputLastName = document.getElementById('user-lastName');
    const inputEmail = document.getElementById('user-email');
    const btnLogout = document.getElementById('btn-logout');

    try {
        // Pedimos los datos al Backend
        const response = await fetch('/auth/perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
            // Si el servidor dice "Error" (401/403), es que no hay sesión válida.
            // Redirigimos al usuario al login inmediatamente.
            throw new Error('No autorizado');
        }
        
        const respuestaServidor = await response.json();
        const user = respuestaServidor.data;
        // Rellenamos el HTML con los datos reales
        if (user) {
            welcomeHeader.textContent = `Hola, ${user.firstName}`;
            inputName.value = user.firstName;
            inputLastName.value = user.lastName;
            inputEmail.value = user.email;
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        // Si algo falla o no está logueado, lo mandamos al login
        window.location.href = '/index.html';
    }

    // --- LÓGICA DE CERRAR SESIÓN ---
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                const response = await fetch('/auth/logout', {
                    method: 'POST', // Usamos POST como definimos en el backend
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Si el servidor borró la cookie, nos vamos al login
                    window.location.href = '/index.html';
                } else {
                    alert('Error al cerrar sesión');
                }
            } catch (error) {
                console.error('Error en logout:', error);
            }
        });
    }
});