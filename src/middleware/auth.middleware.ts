import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Obtener el token de la cookie
    const token = req.cookies.access_token;

    // Si no hay token, no hay paso
    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        // Verificar si el token es válido y no ha expirado
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Guardar los datos del usuario dentro de 'req' para que la siguiente función los use
        req.user = decoded as { id: number; email: string};

        // Pasa a la siguiente función
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};