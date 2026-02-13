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
router.use(authenticateToken);

// Ruta para visualizar perfil
router.get('/perfil', profile);

// Ruta para actualizar 
router.patch('/perfil', updateProfile);

// Ruta para eliminar perfil
router.delete('/perfil', deleteAccount);

router.delete('/delete-admin-test', restrictTo('ADMIN'), (req, res) => {
    res.status(200).json({ status: 'success', message: '¡Si ves esto, eres ADMIN!' });
});

export default router;