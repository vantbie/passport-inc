import { Request } from "express";

//Definimos el módulo xss-clean para que deje de dar error
declare module 'xss-clean' {
    const value: any;
    export default value;
}

// Entramos al "espacio de nombres" global de Express
declare global {
    // Buscamos la interfaz 'Request' (que ya existe en la librería)
    namespace Express {
        // Le "pegamos" una propiedad extra opcional (?)
        interface Request {
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}