import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { login , register, profile, logout} from '../controllers/auth.controller.js';

const router = Router();

// zona publica
// Ruta para cerrar sesion
router.post('/logout', logout);

// RUTA PARA REGISTRAR USUARIOS
router.post('/register', register);

// RUTA PARA VALIDAR USUARIOS
router.post('/login', login);


// Zona privada

// Ruta para visualizar perfil
router.get('/perfil', authenticateToken, profile);

export default router;