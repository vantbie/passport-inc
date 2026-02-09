// src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { generateToken, setTokenCookie } from '../services/auth.services.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/perfil', authenticateToken, (req, res) => {
    // si entra aqui es por que el middleware lo dejo pasar
    res.json({
        message: "Este es tu perfil privado",
        user: (req as any).user
    });
});

// Ruta para visualizar perfil

// RUTA PARA REGISTRAR USUARIOS
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName} = req.body;

        // 1. Validar que vengan el email y password
        if (!email || !password || !firstName || !lastName) {
             return res.status(400).json({ message: "Email y password son requeridos" });
        }

            // 2. Hashear la contraseña usando bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. Usar prisma para crear el usuario
        const newUser = await prisma.user.create({ 
            data: { 
                email: email, 
                password: hashedPassword,
                firstName,
                lastName
            }
        });

        // 4. Responder con éxito
        res.status(201).json({ 
            message: `¡Hola ${newUser.firstName} ${newUser.lastName}! Te has registrado con éxito.`,
            user: {
                email: newUser.email,
                registeredAt: newUser.createdAt // Aquí verás la fecha
            }
        });

    } catch (error) {

        // Manejo de error específico: Si el email ya existe
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
            return res.status(400).json({ message: "El email ya está registrado" });
        }

        res.status(500).json({ message: "Error al registrar usuario" });
    }
});

// RUTA PARA VALIDAR USUARIOS
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. ¿Vienen los datos?
        if (!email || !password) {
            return res.status(400).json({ message: "Email y password requeridos" });
        }

        // 2. ¿El usuario existe?
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 3. ¿La contraseña es correcta?
        // bcrypt.compare toma la clave plana y la compara con el hash de la DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        else{
            const token = generateToken({id: user.id, email: user.email});
            setTokenCookie(res, token);

            return res.json({ message: "Login exitoso" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
});

export default router;