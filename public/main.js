// --- ANIMACIÓN VISUAL (TOGGLE) ---
const loginHero = document.querySelector(".hero.login");
const loginForm = document.querySelector(".form.login");
const registerHero = document.querySelector(".hero.register");
const registerForm = document.querySelector(".form.register");
const cardBg = document.querySelector(".card-bg");

const toggleView = () => {
    const isRegisterActive = registerForm.classList.contains("active");
    
    // Limpiar mensajes al cambiar de vista para que no se queden pegados
    showMessage('register', '', 'none');
    showMessage('login', '', 'none');

    if (isRegisterActive) {
        cardBg.classList.add("login");
        registerForm.classList.remove("active");
        registerHero.classList.remove("active");
        loginForm.classList.add("active");
        loginHero.classList.add("active");
    } else {
        cardBg.classList.remove("login");
        loginForm.classList.remove("active");
        loginHero.classList.remove("active");
        registerForm.classList.add("active");
        registerHero.classList.add("active");
    }
};

// FUNCIÓN AUXILIAR PARA MOSTRAR MENSAJES 
const showMessage = (context, message, type) => {
    const messageBox = document.getElementById(`${context}-message`);
    messageBox.textContent = message;
    // Reiniciamos las clases y añadimos la base y el tipo
    messageBox.className = `message-box ${type}`;
    
};


// ---FUNCIONES DE CONEXIÓN ---
// Funcion para registrar usuario
async function registerUser() {
    const firstNameInput = document.getElementById('reg-firstname');
    const lastNameInput = document.getElementById('reg-lastname');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-pass');

    // Evitamos errores si el elemento no existe en el HTML
    if (!firstNameInput || !lastNameInput || !emailInput || !passwordInput) {
        console.error(" Error: No encuentro uno de los inputs en el HTML. Revisa los IDs.");
        return;
    }

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    // Validamos que no estén vacíos
    if (!firstName || !lastName || !email || !password) {
        showMessage('register', " Por favor completa todos los campos.", 'error');
        return;
    }

    try {
        const response = await fetch('/auth/register', { // Asegúrate de que la ruta sea correcta (/api/auth o /auth)
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password }) // serializacion
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('register', " ¡Registro exitoso! Redirigiendo...", 'success');
            
            // Limpiar formulario
            firstNameInput.value = ''; 
            lastNameInput.value = '';
            emailInput.value = ''; 
            passwordInput.value = '';
            
            // Esperar 2 segundos para que lean el mensaje y cambiar de vista
            setTimeout(() => {
                toggleView(); // Cambiar a vista de login
            }, 2000);
            
        } else {
            // Reemplaza alert por:
            showMessage('register', ` Error: ${data.message}`, 'error');
        }

    } catch (error) {
        console.error("Error de red:", error);
        showMessage('register', "Hubo un problema de conexión.", 'error');
    }
}

// Funcion de login
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    if (!email || !password) {
         showMessage('login', " Ingresa tu correo y contraseña.", 'error');
         return;
    }

    try {
        const response = await fetch('/auth/login', { // Asegúrate de que la ruta sea correcta
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // demasiado intentos
        if (response.status === 429) {
            iniciarCuentaRegresiva(30);
            return; // Cortamos la ejecución aquí
        }

        if (response.ok) {
            const user = data.user;
            const userName = data.user ? data.user.firstName : "Usuario";
            
            showMessage('login', `¡Hola de nuevo ${userName}!`, 'success');
            
            setTimeout(() => {
                console.log("Redirigiendo al perfil...");
                
                const role = user.role;

                if ( role === 'ADMIN') {
                    window.location.href = '/admin.html'
                
                } else { 
                    window.location.href = '/perfil.html'
                }
            }, 1000);

        } else {
            showMessage('login', ` Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error(error);
        showMessage('login', "Error al conectar con el servidor", 'error');
    }
}

function iniciarCuentaRegresiva(segundosRestantes) {
    //  Capturamos el botón y el div de los mensajes
    const btnLogin = document.getElementById('btn-login'); // Tu botón de submit
    const mensajeDiv = document.getElementById('login-message'); // Donde muestras los errores

    // Desactivamos el botón para que no puedan seguir clickeando
    btnLogin.disabled = true;
    btnLogin.style.opacity = '0.5'; // Lo hacemos ver apagado
    btnLogin.style.cursor = 'not-allowed';

    // Creamos el cronómetro que se ejecuta cada 1000ms (1 segundo)
    const intervalo = setInterval(() => {
        
        // Actualizamos el texto en pantalla
        mensajeDiv.style.color = '#ff4d4d'; // Usamos tu clase roja de error
        mensajeDiv.textContent = `Por seguridad, no puedes iniciar sesión por ${segundosRestantes} segundos.`;
        
        segundosRestantes--; // Restamos 1 segundo

        // Cuando llega a cero, restauramos todo
        if (segundosRestantes < 0) {
            clearInterval(intervalo); // Detenemos el reloj
            
            // Volvemos a encender el botón
            btnLogin.disabled = false;
            btnLogin.style.opacity = '1';
            btnLogin.style.cursor = 'pointer';
            
            // Limpiamos el mensaje
            mensajeDiv.textContent = '';
            mensajeDiv.style.color = '';
        }

    }, 1000); // 1000 milisegundos = 1 segundo
}