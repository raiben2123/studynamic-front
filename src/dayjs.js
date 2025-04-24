import _dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es'; // Si necesitas soporte para español

_dayjs.extend(utc);
_dayjs.extend(localizedFormat);
_dayjs.locale('es'); // Configurar local si es necesario

export const dayjs = _dayjs;
export default dayjs;