import { Router } from 'express';
import { deleteUser } from '../controllers/admin.controller.js'; 
import { authenticateToken, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// Ruta para eliminar usuario
router.delete(
  '/users/:id',             // La URL
  authenticateToken,        // El Portero (¿Tienes ticket?)
  restrictTo('ADMIN'),      // El VIP (¿Eres Admin?)
  deleteUser                // La lógica 
);

export default router;