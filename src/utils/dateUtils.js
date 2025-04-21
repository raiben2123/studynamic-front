// src/utils/dateUtils.js

/**
 * Formatea una fecha para mostrar en la UI (DD/MM/YYYY)
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Error de fecha';
    }
};

/**
 * 
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateTimeForDisplay = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Error al formatear fecha y hora:', error);
        return 'Error de fecha';
    }
};

/**
 * 
 * @param {string} displayDate
 * @returns {string}
 */
export const convertDisplayDateToIsoDate = (displayDate) => {
    if (!displayDate || displayDate === 'Sin fecha' || displayDate === 'Fecha inválida') {
        return '';
    }
    
    try {
        const [day, month, year] = displayDate.split('/');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error al convertir fecha de visualización a ISO:', error);
        return '';
    }
};

/**
 * 
 * @param {string} dateString
 * @returns {string}
 */
export const prepareDateForApi = (dateString) => {
    if (!dateString) return null;
    
    if (dateString.includes('T')) {
        return dateString;
    }
    
    return `${dateString}T00:00:00`;
};

/**
 *
 * @param {string} isoString
 * @returns {string}
 */
export const extractDateFromIso = (isoString) => {
    if (!isoString) return '';
    
    if (isoString.includes('T')) {
        return isoString.split('T')[0];
    }
    
    return isoString;
};