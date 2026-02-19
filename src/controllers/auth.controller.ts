import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import  prisma  from '../lib/prisma.js'; // Asegúrate de que la ruta a prisma sea correcta
import bcrypt from 'bcrypt';
import { generateToken, setTokenCookie } from '../services/auth.services.js';
import rateLimit from 'express-rate-limit'; // 1. IMPORTAMOS ESTO

// se envuelve todo con catchAsync

// Login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("Datos recibicos: ", req.body);
    const { email, password, rememberMe } = req.body;

    // Validación básica
    if (!email || !password) {
        // En lugar de res.status... lanzamos el Error y cortamos (return)
        return next(new AppError('Por favor ingrese email y contraseña', 400));
    }

    // Buscar usuario
    const user = await prisma.usuarios.findUnique({ where: { email } });

    // Verificar si existe y si la contraseña coincide
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Credenciales incorrectas', 401));
    }

    // Generar Token y Cookie
    const token = generateToken({ id: user.id, email: user.email, role: user.role});
    setTokenCookie(res, token, rememberMe);

    // Responder
    res.status(200).json({
        status: 'success',
        token,
        message: 'Login exitoso',
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    });
});


// Registro
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("Datos recibicos: ", req.body);
    const { email, password, firstName, lastName } = req.body;

    // Validar que lleguen los datos
    if (!email || !password || !firstName || !lastName) {
        return next(new AppError('Todos los campos son obligatorios', 400));
    }

    // Verificar si ya existe el email
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
        return next(new AppError('El email ya está registrado', 400));
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en Base de Datos
    const newUser = await prisma.usuarios.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName
        }
    });

    // Generar Token y Cookie (para que quede logueado al registrarse)
    const token = generateToken({ id: newUser.id, email: newUser.email });
    setTokenCookie(res, token, false); // false porque es registro, no "recordarme"

    // Responder
    res.status(201).json({
        status: 'success',
        token,
        message: 'Usuario registrado exitosamente',
        user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
        }
    });
});

// Perfil
export const profile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    // El middleware 'authenticateToken' ya verificó el token y puso los datos en req.user.
    const user = await prisma.usuarios.findUnique({
        where: { id: req.user!.id }
    });

    if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    });
});

// Logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie('access_token');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};

export const loginLimiter = rateLimit({
    windowMs: 30 * 1000, // Tiempo de castigo: 30 segundos
    max: 3, // Límite exacto: 3 intentos
    message: { 
        status: 'error', 
        message: 'Bloqueado' 
    }
});
