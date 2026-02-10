import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

// Generamos el token JWT
export const generateToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Guardamos ese token en una cookie
export const setTokenCookie = (res: Response, token: string, remember: boolean) => {
    const cookieOption: any = {
        httpOnly: true, // Seguridad: La cookie no es accesible por JavaScript del navegador
        secure: process.env.NODE_ENV === 'production', // Solo viaja por HTTPS en producción
        sameSite: 'strict', // Previene ataques CSRF
        maxAge: 3600000 // 1 hora en milisegundos
    };

    // Si 'remember' es true, le damos una vida de 1 hora (3,600,000 milisegundos)
    if (remember) {
        cookieOption.maxAge = 1 * 60 * 60 * 1000;
    }

    // Si 'remember' es false, el navegador la combierte en una cookie de sesion
    res.cookie('access_token', token, cookieOption);
};

// Limpiamos cuando se cierre la sesion
export const clearTokenCookie = (res: Response) => {
    // Para borrar una cookie, necesitamos pasarle el nombre exacto
    res.clearCookie( 'access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

