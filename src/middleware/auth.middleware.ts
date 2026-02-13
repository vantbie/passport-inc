import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

// Verifica el token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Obtener el token de la cookie
    const token = req.cookies.access_token;

    // Si no hay token, no hay paso
    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        // Verificar si el token es válido y no ha expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        
        // Guardar los datos del usuario dentro de 'req' para que la siguiente función los use
        req.user = decoded as { id: number; email: string, role: string};

        // Pasa a la siguiente función
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};

// Verifica el rol
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Obtenemos el usuario (que authenticateToken ya puso en la request)
    // Usamos 'as any' porque TypeScript es muy estricto y a veces se queja de que 'user' no existe en Request
    const user = req.user;

    // Verificamos si existe el usuario y si tiene rol
    if (!user || !user.role) {
       return res.status(403).json({ 
         status: 'fail', 
         message: 'El usuario no tiene un rol asignado o no está autenticado correctly.' 
       });
    }

    // 3. Verificamos si el rol del usuario está en la lista de permitidos
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para realizar esta acción (Requiere: ' + allowedRoles.join(', ') + ')'
      });
    }

    // 4. Si pasó los filtros, adelante
    next();
  };
};