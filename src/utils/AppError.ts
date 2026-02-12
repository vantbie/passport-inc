export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        // Llamamos al padre (Error de JS) para que guarde el mensaje
        super(message); 

        this.statusCode = statusCode;
        
        // Si es 4xx es un error del cliente ('fail'), si es 5xx es del servidor ('error')
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Esto sirve para saber si el error lo creamos nosotros (true) o si explotó una librería (false)
        this.isOperational = true;

        // Captura la línea exacta donde ocurrió el error (para que no la pierdas al debuggear)
        Error.captureStackTrace(this, this.constructor);
    }
}