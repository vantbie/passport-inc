import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

export const generateToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const setTokenCookie = (res: Response, token: string) => {
    res.cookie('access_token', token, {
        httpOnly: true, // Seguridad: La cookie no es accesible por JavaScript del navegador
        secure: process.env.NODE_ENV === 'production', // Solo viaja por HTTPS en producción
        sameSite: 'strict', // Previene ataques CSRF
        maxAge: 3600000 // 1 hora en milisegundos
    });
};