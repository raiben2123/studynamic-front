// src/config/constants.js
import { Capacitor } from '@capacitor/core';

export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Studynamic';
export const API_URL = process.env.REACT_APP_API_URL || '/api';

export const IS_NATIVE = Capacitor.isNativePlatform();
export const IS_ANDROID = Capacitor.getPlatform() === 'android';
export const IS_IOS = Capacitor.getPlatform() === 'ios';
export const IS_WEB = !IS_NATIVE;

export const THEMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  GREEN: 'green',
  PURPLE: 'purple'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'name',
  USERNAME: 'username',
  USER_THEME: 'userTheme',
  PASSWORD: 'password',
  PROFILE_PICTURE: 'profilePicture',
  LAST_SYNC: 'lastSync',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  STORAGE_MIGRATED: '_storage_migrated_'
};

export const TASK_STATUS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizada'
};

export const IMPORTANCE_LEVELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta'
};

export const FILE_TYPES = {
  SUBJECT_RESOURCE: 0,
  TASK_ATTACHMENT: 1,
  GROUP_RESOURCE: 2,
  PROFILE_PICTURE: 3
};

export const FOLDER_TYPES = {
  NOTES: 'Apuntes',
  EXAMS: 'Exámenes',
  ASSIGNMENTS: 'Trabajos',
  CUSTOM: 'Custom'
};

export const NOTIFICATION_CONFIG = {
  SMALL_ICON: 'ic_stat_icon_config_sample',
  ICON_COLOR: '#467BAA',
  SOUND: 'beep.wav'
};

export const ROUTES = {
  HOME: '/home',
  AUTH: '/',
  CALENDAR: '/calendar',
  TASKS: '/tasks',
  RESOURCES: '/resources',
  GROUPS: '/groups',
  GROUP_DETAILS: '/groups/:groupId',
  GROUP_JOIN: '/groups/join/:groupId',
  SETTINGS: '/settings'
};

export const COLORS = {
  PRIMARY: '#467BAA',
  SECONDARY: '#3B5998',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  BACKGROUND: {
    LIGHT: '#F8FAFC',
    DARK: '#121212'
  },
  TEXT: {
    LIGHT: '#333333',
    DARK: '#E6E6E6'
  },
  TASK: {
    PENDING: '#FF9800',
    IN_PROGRESS: '#2196F3',
    COMPLETED: '#4CAF50',
    OVERDUE: '#F44336'
  }
};

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 30 * 60 * 1000,
  LONG: 2 * 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000 
};

export const MESSAGES = {
  NETWORK: {
    OFFLINE: 'Sin conexión a Internet',
    ONLINE: 'Conexión a Internet restaurada'
  },
  ERROR: {
    DEFAULT: 'Ha ocurrido un error',
    NETWORK: 'Error de conexión',
    AUTH: 'Error de autenticación',
    SERVER: 'Error del servidor',
    NOT_FOUND: 'No encontrado',
    FORBIDDEN: 'Acceso denegado'
  },
  SUCCESS: {
    SAVE: 'Guardado con éxito',
    UPDATE: 'Actualizado con éxito',
    DELETE: 'Eliminado con éxito',
    UPLOAD: 'Subido con éxito'
  }
};

export const DATE_FORMATS = {
  FULL: 'DD/MM/YYYY HH:mm',
  DATE_ONLY: 'DD/MM/YYYY',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MMMM YYYY',
  DAY_MONTH: 'D MMMM',
  CALENDAR_HEADER: 'MMMM YYYY'
};

export const CAPACITOR_CONFIG = {
  SPLASH_SCREEN: {
    DURATION: 2000,
    FADE_OUT_DURATION: 300
  },
  STATUS_BAR: {
    DARK_MODE_COLOR: '#121212',
    LIGHT_MODE_COLOR: '#467BAA',
    GREEN_THEME_COLOR: '#4CAF50',
    PURPLE_THEME_COLOR: '#9C27B0'
  }
};
