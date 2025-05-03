// src/services/notificationService.js
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Comprobar si el dispositivo es nativo (Android o iOS)
const isNative = Capacitor.isNativePlatform();

/**
 * Solicita permisos para enviar notificaciones
 * @returns {Promise<boolean>} - Devuelve true si los permisos fueron concedidos
 */
export const requestNotificationPermission = async () => {
  if (!isNative) {
    return false;
  }

  try {
    const permResult = await LocalNotifications.requestPermissions();
    return permResult.display === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
};

/**
 * Programa una notificación local
 * @param {Object} notificationData - Datos de la notificación
 * @param {string} notificationData.title - Título de la notificación
 * @param {string} notificationData.body - Cuerpo de la notificación
 * @param {Date} notificationData.scheduleDate - Fecha programada para la notificación
 * @param {string} [notificationData.id] - ID opcional de la notificación
 * @returns {Promise<number>} - ID de la notificación programada
 */
export const scheduleNotification = async ({ title, body, scheduleDate, id = null }) => {
  if (!isNative) {
    console.log('Programando notificación (web):', { title, body, scheduleDate });
    return -1;
  }

  try {
    // Generar un ID único para la notificación si no se proporciona uno
    const notificationId = id || new Date().getTime();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title,
          body,
          schedule: { at: scheduleDate },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#467BAA',
          actionTypeId: '',
        },
      ],
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error al programar la notificación:', error);
    throw error;
  }
};

/**
 * Cancela una notificación programada
 * @param {number} notificationId - ID de la notificación a cancelar
 * @returns {Promise<void>}
 */
export const cancelNotification = async (notificationId) => {
  if (!isNative) {
    console.log('Cancelando notificación (web):', notificationId);
    return;
  }

  try {
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch (error) {
    console.error('Error al cancelar la notificación:', error);
    throw error;
  }
};

/**
 * Cancela todas las notificaciones programadas
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  if (!isNative) {
    console.log('Cancelando todas las notificaciones (web)');
    return;
  }

  try {
    await LocalNotifications.cancelAll();
  } catch (error) {
    console.error('Error al cancelar todas las notificaciones:', error);
    throw error;
  }
};

/**
 * Obtiene todas las notificaciones programadas pendientes
 * @returns {Promise<Array>} - Lista de notificaciones pendientes
 */
export const getPendingNotifications = async () => {
  if (!isNative) {
    return [];
  }

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('Error al obtener notificaciones pendientes:', error);
    return [];
  }
};

/**
 * Programa o actualiza una notificación para una tarea
 * @param {Object} task - Datos de la tarea
 * @returns {Promise<number>} - ID de la notificación
 */
export const scheduleTaskNotification = async (task) => {
  // Solo programa notificaciones si la tarea tiene fecha de notificación y está pendiente o en curso
  if (!task.notificationDate || !['Pendiente', 'En curso'].includes(task.status)) {
    return null;
  }

  try {
    const notificationDate = new Date(task.notificationDate);
    
    // No programar si la fecha ya pasó
    if (notificationDate < new Date()) {
      return null;
    }
    
    // Usar el ID de la tarea para evitar duplicados
    const notificationId = task.id;
    
    // Preparar el título y cuerpo de la notificación
    const title = `Recordatorio: ${task.title}`;
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const body = `Tienes una tarea para entregar el ${dueDate}. Asignatura: ${task.subject}`;
    
    // Programar la notificación
    return await scheduleNotification({
      id: notificationId,
      title,
      body,
      scheduleDate: notificationDate
    });
  } catch (error) {
    console.error('Error al programar notificación para tarea:', error);
    return null;
  }
};
