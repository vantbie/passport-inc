import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import  prisma  from '../lib/prisma.js'; // Asegúrate de que la ruta a prisma sea correcta
import bcrypt from 'bcrypt';
import { generateToken, setTokenCookie } from '../services/auth.services.js';

// se envuelve todo con catchAsync

// Login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
        where: { id: (req as any).user.id }
    });

    if (!user) {
        return next(new AppError('Usuario no encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        }
    });
});

// Logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie('access_token');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};


// Actualizar perfil
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email } = req.body;
    const userId = (req as any).user.id; // Obtenido del token

    // SEGURIDAD: No permitir cambiar contraseña por aquí
    // Si intentan enviar password, lanzamos error. Eso requiere otro proceso más seguro.
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Esta ruta no es para cambiar contraseñas. Por favor usa /update-password', 400));
    }

    // VALIDACIÓN: Si quiere cambiar el email, verificamos que no esté ocupado
    if (email) {
        const existingUser = await prisma.usuarios.findUnique({ 
            where: { email } 
        });
        // Si existe alguien con ese email Y ese alguien NO soy yo (es otro usuario)
        if (existingUser && existingUser.id !== userId) {
            return next(new AppError('El email ya está en uso', 400));
        }
    }

    // ACTUALIZAR: Prisma solo tocará los campos que le pasemos
    const updatedUser = await prisma.usuarios.update({
        where: { id: userId },
        data: {
            firstName,
            lastName,
            email
        }
    });

    // RESPONDER
    res.status(200).json({
        status: 'success',
        message: 'Perfil actualizado',
        user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName
        }
    });
});

// Eliminar cuenta
export const deleteAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;

    // Borrado Físico (Hard Delete): Elimina el registro de la DB.
    await prisma.usuarios.delete({
        where: { id: userId }
    });

    // En REST, cuando borras algo, devuelves 204 (No Content) y null
    res.status(204).json({
        status: 'success',
        data: null
    });
});