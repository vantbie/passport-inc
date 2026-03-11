document.addEventListener('DOMContentLoaded', async () => {
    
    // Elementos del DOM que vamos a rellenar
    const welcomeHeader = document.getElementById('header-welcome');
    const inputName = document.getElementById('user-firstName');
    const inputLastName = document.getElementById('user-lastName');
    const inputEmail = document.getElementById('user-email');
    const btnLogout = document.getElementById('btn-logout');

    try {
        //Buscamos el token en el sessionStorage
        const token = sessionStorage.getItem('jwt_token');

        // Preparamos los encabezados
        const headers = {'Content-Type': 'application/json'};

        // Si existe un token suelto, lo inyectamos en el encabezado
        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Pedimos los datos al Backend
        const response = await fetch('/auth/perfil', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
            // Si el servidor dice "Error" (401/403), es que no hay sesión válida.
            const errorDelServidor = await response.json();
            console.error("EL SERVIDOR DIJO:", errorDelServidor);
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
                // Función auxiliar para leer una cookie específica por su nombre
                const getCookie = (name) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                    return null;
                };

                // Sacamos el token CSRF de la cookie
                const csrfToken = getCookie('csrf_token');

                // buscamos el jwt
                const jwtToken = sessionStorage.getItem('jwt_token');


                // Preparamos los encabezados de seguridad 
                const headersConfig = {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                };
                   
                // Si hay token en la memoria, lo metemos en el encabezado
                if (jwtToken && jwtToken !== 'undefined' && jwtToken !== 'null') {
                    headersConfig['Authorization'] = `Bearer ${jwtToken}`;
                }

                // Hacemos la peticion al servidor
                const response = await fetch('/auth/logout', {
                    method: 'POST', // Usamos POST como definimos en el backend
                    headers: headersConfig,
                    credentials: 'include'
                });

                if (response.ok) {
                    sessionStorage.removeItem('jwt_token');
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