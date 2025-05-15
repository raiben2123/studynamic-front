
const DEFAULT_DATE = 'Sin fecha';
const INVALID_DATE = 'Fecha inválida';
const ERROR_DATE = 'Error de fecha';

const isValidDate = (date) => {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
};

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

export const convertDisplayDateToIsoDate = (displayDate) => {
    if (!displayDate || [DEFAULT_DATE, INVALID_DATE, ERROR_DATE].includes(displayDate)) {
        return '';
    }
    
    try {
        const parts = displayDate.split('/');
        if (parts.length !== 3) return '';
        
        const [day, month, year] = parts;
        
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

export const prepareDateForApi = (dateString) => {
    if (!dateString) return null;
    
    try {
        if (dateString.includes('T')) {
            const date = safeParseDateString(dateString);
            return date ? date.toISOString() : null;
        }
        
        const date = safeParseDateString(`${dateString}T00:00:00`);
        return date ? date.toISOString() : null;
    } catch (error) {
        console.error('Error al preparar fecha para API:', error);
        return null;
    }
};

export const extractDateFromIso = (isoString) => {
    if (!isoString) return '';
    
    try {
        if (isoString.includes('T')) {
            const date = safeParseDateString(isoString);
            return date ? date.toISOString().split('T')[0] : '';
        }
        
        const date = safeParseDateString(isoString);
        return date ? isoString : '';
    } catch (error) {
        console.error('Error al extraer fecha de ISO:', error);
        return '';
    }
};

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