import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extender dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar la zona horaria por defecto
dayjs.tz.setDefault('Europe/Madrid');

export default dayjs;