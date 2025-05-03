// src/utils/dateUtils.js

const DEFAULT_DATE = 'Sin fecha';
const INVALID_DATE = 'Fecha inválida';
const ERROR_DATE = 'Error de fecha';

/**
 * Verifica si una fecha es válida
 * @param {Date|string} date
 * @returns {boolean}
 */
const isValidDate = (date) => {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Parsea una fecha de forma segura
 * @param {string} dateString
 * @returns {Date|null}
 */
const safeParseDateString = (dateString) => {
    if (!dateString) return null;
    
    try {
        const date = new Date(dateString);
        return isValidDate(date) ? date : null;
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
};

/**
 * Formatea una fecha para mostrar en la UI (DD/MM/YYYY)
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateForDisplay = (dateString) => {
    if (!dateString) return DEFAULT_DATE;
    
    try {
        const date = safeParseDateString(dateString);
        if (!date) return INVALID_DATE;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return ERROR_DATE;
    }
};

/**
 * Formatea fecha y hora para mostrar en la UI (DD/MM/YYYY HH:mm)
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateTimeForDisplay = (dateString) => {
    if (!dateString) return DEFAULT_DATE;
    
    try {
        const date = safeParseDateString(dateString);
        if (!date) return INVALID_DATE;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Error al formatear fecha y hora:', error);
        return ERROR_DATE;
    }
};

/**
 * Convierte una fecha en formato display (DD/MM/YYYY) a formato ISO (YYYY-MM-DD)
 * @param {string} displayDate
 * @returns {string}
 */
export const convertDisplayDateToIsoDate = (displayDate) => {
    if (!displayDate || [DEFAULT_DATE, INVALID_DATE, ERROR_DATE].includes(displayDate)) {
        return '';
    }
    
    try {
        const parts = displayDate.split('/');
        if (parts.length !== 3) return '';
        
        const [day, month, year] = parts;
        
        // Verificar que los componentes sean números válidos
        if (!day || !month || !year || 
            isNaN(Number(day)) || 
            isNaN(Number(month)) || 
            isNaN(Number(year))) {
            return '';
        }
        
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
        console.error('Error al convertir fecha de visualización a ISO:', error);
        return '';
    }
};

/**
 * Prepara una fecha para enviar a la API
 * @param {string} dateString
 * @returns {string|null}
 */
export const prepareDateForApi = (dateString) => {
    if (!dateString) return null;
    
    try {
        // Si ya tiene formato ISO con tiempo
        if (dateString.includes('T')) {
            const date = safeParseDateString(dateString);
            return date ? date.toISOString() : null;
        }
        
        // Si es una fecha simple, añadir el tiempo
        const date = safeParseDateString(`${dateString}T00:00:00`);
        return date ? date.toISOString() : null;
    } catch (error) {
        console.error('Error al preparar fecha para API:', error);
        return null;
    }
};

/**
 * Extrae la fecha de una cadena ISO
 * @param {string} isoString
 * @returns {string}
 */
export const extractDateFromIso = (isoString) => {
    if (!isoString) return '';
    
    try {
        if (isoString.includes('T')) {
            const date = safeParseDateString(isoString);
            return date ? date.toISOString().split('T')[0] : '';
        }
        
        // Verificar si es una fecha válida
        const date = safeParseDateString(isoString);
        return date ? isoString : '';
    } catch (error) {
        console.error('Error al extraer fecha de ISO:', error);
        return '';
    }
};

/**
 * Valida si una fecha está en el pasado
 * @param {string} dateString
 * @returns {boolean}
 */
export const isDateInPast = (dateString) => {
    if (!dateString) return false;
    
    try {
        const date = safeParseDateString(dateString);
        if (!date) return false;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        return date < now;
    } catch (error) {
        console.error('Error al verificar si la fecha está en el pasado:', error);
        return false;
    }
};

/**
 * Compara dos fechas para ordenamiento
 * @param {string} dateA
 * @param {string} dateB
 * @returns {number}
 */
export const compareDates = (dateA, dateB) => {
    try {
        const dateObjA = safeParseDateString(dateA);
        const dateObjB = safeParseDateString(dateB);
        
        if (!dateObjA && !dateObjB) return 0;
        if (!dateObjA) return 1;
        if (!dateObjB) return -1;
        
        return dateObjA.getTime() - dateObjB.getTime();
    } catch (error) {
        console.error('Error al comparar fechas:', error);
        return 0;
    }
};