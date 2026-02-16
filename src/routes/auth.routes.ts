import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { login , register, profile, logout, updateProfile, deleteAccount} from '../controllers/auth.controller.js';
import { restrictTo } from '../middleware/auth.middleware.js'; // Asegúrate de importar esto

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

// Ruta para actualizar 
router.patch('/perfil', authenticateToken, updateProfile);

// Ruta para eliminar perfil
router.delete('/perfil', authenticateToken, deleteAccount);

export default router;