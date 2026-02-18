import { Router } from 'express';
import { deleteUser, getAllUsers } from '../controllers/admin.controller.js'; 
import { authenticateToken, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

//Protegemos las rutas
router.use(authenticateToken, restrictTo('ADMIN'));

// Ruta para ver todos los usuarios
router.get('/', getAllUsers)

// Ruta para eliminar usuario
router.delete('/:id', deleteUser);

export default router;