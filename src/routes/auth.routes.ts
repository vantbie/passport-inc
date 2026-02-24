import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { login , register, profile, logout} from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/auth.middleware.js';
import { verifyCsrfToken } from '../middleware/auth.middleware.js'; // Importa el guardia

const router = Router();

// zona publica
// Ruta para cerrar sesion
router.post('/logout',verifyCsrfToken, logout);

// RUTA PARA REGISTRAR USUARIOS
router.post('/register', register);

// RUTA PARA VALIDAR USUARIOS
router.post('/login', loginLimiter, login);


// Zona privada

// Ruta para visualizar perfil
router.get('/perfil', authenticateToken, profile);

export default router;