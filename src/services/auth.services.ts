import jwt from 'jsonwebtoken';
import { Response } from 'express';
import CryptoJS from 'crypto-js';
import { userInfo } from 'node:os';

// Generamos el token JWT
export const generateToken = (user: any) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_muy_segura';

    // Preparamos los datos sencibles que queremos ocultar
    const datosSencibles = JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role
    });

    // Ciframos
    const datosCifrados = CryptoJS.AES.encrypt(datosSencibles, JWT_SECRET).toString();

    // Creamos el token
    const token = jwt.sign({ payload_seguro: datosCifrados}, JWT_SECRET, {expiresIn: '1h'});

    return token;
};

// Guardamos ese token en una cookie


// Limpiamos cuando se cierre la sesion
export const clearTokenCookie = (res: Response) => {
    // Para borrar una cookie, necesitamos pasarle el nombre exacto
    res.clearCookie( 'access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

