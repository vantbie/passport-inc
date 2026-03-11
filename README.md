# PassPort - Sistema de Autenticación y Administración Seguro

Este proyecto es una aplicación Full-Stack que implementa un sistema robusto de registro, autenticación de usuarios y un panel de control para administradores. Está diseñado con un fuerte enfoque en la seguridad backend, aplicando las mejores prácticas de la industria para proteger las sesiones y rutas de la API.

## Características Principales

* **Autenticación con JWT:** Manejo de sesiones seguras a través de JSON Web Tokens (JWT) almacenados en cookies HTTP-only (y fallback vía Bearer Header).
* **Control de Acceso Basado en Roles (RBAC):** Diferenciación estricta entre usuarios estándar (`USER`) y administradores (`ADMIN`).
* **Protección contra ataques CSRF:** Implementación del patrón *Double-Submit Cookie* para validar el origen de las peticiones críticas.
* **Prevención de Ataques de Fuerza Bruta:** Sistema de *Rate Limiting* personalizado que bloquea temporalmente los intentos de inicio de sesión fallidos basándose en la combinación de IP y correo electrónico.
* **Validación Estricta de Datos:** Verificación de formatos y longitudes (ej. correos y contraseñas) tanto en el cliente (Frontend) como en el servidor (Backend).
* **Panel de Administración:** Interfaz gráfica para que los administradores puedan visualizar el listado completo de usuarios y eliminar cuentas (con protección para evitar la auto-eliminación).

## Tecnologías Utilizadas

**Backend:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [TypeScript](https://www.typescriptlang.org/) para tipado estático
* [Prisma ORM](https://www.prisma.io/) para la gestión de la base de datos
* SQLite (Base de datos de desarrollo)

**Seguridad:**
* `jsonwebtoken` (Generación y validación de tokens)
* `crypto-js` (Encriptación de payloads)
* `express-rate-limit` (Limitación de peticiones)
* Implementación manual de middlewares de seguridad (CSRF, autenticación de rutas).

**Frontend:**
* HTML5, CSS3, y JavaScript (Vanilla)
* Fetch API para el consumo asíncrono de la API REST.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en componentes:

```text
passport-inc/
├── prisma/               # Esquemas de base de datos y migraciones
├── public/               # Archivos estáticos del Frontend (HTML, CSS, JS)
├── src/
│   ├── controllers/      # Lógica de procesamiento de las peticiones (Auth & Admin)
│   ├── lib/              # Instancia de conexión a la base de datos (Prisma)
│   ├── middleware/       # Barreras de seguridad (JWT, CSRF, Roles, Rate Limiter)
│   ├── routes/           # Definición de los endpoints de la API
│   ├── utils/            # Herramientas globales (Manejo de errores, catchAsync)
│   └── app.ts            # Configuración principal del servidor Express
└── package.json          # Dependencias y scripts de ejecución
