import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import rateLimit, {ipKeyGenerator } from 'express-rate-limit'; // 1. IMPORTAMOS ESTO

// Verifica el token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => { 
  const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_muy_segura';

  // Obtener el token de la cookie
    let token = req.cookies.access_token;

    // Si no hay cookie, Buscar el toquen en el encabezado
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ message: "Acceso denegado. No hay un token válido." });
    }

    // si no hay por ningun lado, lo regresa
    if(!token){
      return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        // Verificar si el token es válido y no ha expirado
        const decoded = jwt.verify(token, JWT_SECRET) as { payload_seguro: string };
        
        const bytes = CryptoJS.AES.decrypt(decoded.payload_seguro, process.env.JWT_SECRET as string);
        
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        const decryptedData = JSON.parse(decryptedString);
        
        // Guardar los datos del usuario dentro de 'req' para que la siguiente función los use
        req.user = decryptedData;

        // Pasa a la siguiente función
        next();
    } catch (error) {
        console.error("ERROR EN EL MIDDLEWARE:", error);
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};

// Verifica el rol
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Obtenemos el usuario (que authenticateToken ya puso en la request)
    const user = req.user;

    // Verificamos si existe el usuario y si tiene rol
    if (!user || !user.role) {
       return res.status(403).json({ 
         status: 'fail', 
         message: 'El usuario no tiene un rol asignado o no está autenticado correctly.' 
       });
    }

    // Verificamos si el rol del usuario está en la lista de permitidos
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para realizar esta acción (Requiere: ' + allowedRoles.join(', ') + ')'
      });
    }

    // Si pasó los filtros, adelante
    next();
  };
};

export const loginLimiter = rateLimit({
    windowMs: 30 * 1000, // Tiempo de castigo: 30 segundos
    max: 3, // Límite exacto: 3 intentos

    // llave personalizada
    keyGenerator: (req: Request, res: Response) => {
        // Obtenemos el email
        const email = req.body.email ? req.body.email.toLowerCase() : 'unknown';
        
        // Obtenemos la IP usando la herramienta segura de la librería
        const clientIp = req.ip ? ipKeyGenerator(req.ip) : 'unknown-ip';
        
        // Creamos un identificador único combinando la IP y el Email.
        return `${clientIp}_${email}`;
    },

    message: { 
        status: 'error', 
        message: 'Bloqueado' 
    }
});

// Verifica el token CSRF
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Si la petición trae el token manual (Mochila/Bearer), es INMUNE al CSRF.
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return next(); // Lo dejamos pasar sin pedir el escudo
    }
  
    // Buscamos el token en los encabezados (lo que manda perfil.js)
    const csrfHeader = req.headers['x-csrf-token'];
    
    // Buscamos el token en las cookies (lo que guardó el navegador)
    const csrfCookie = req.cookies['csrf_token'];

    // Si falta alguno, o si son diferentes, es un intento de ataque
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        console.warn(" Intento de ataque CSRF bloqueado");
        return res.status(403).json({ message: "Error de seguridad: Token CSRF inválido." });
    }

    // Si coinciden, todo está en orden
    next();
};