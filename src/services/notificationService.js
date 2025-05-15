import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNative = Capacitor.isNativePlatform();


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


export const scheduleNotification = async ({ title, body, scheduleDate, id = null }) => {
  if (!isNative) {
    console.log('Programando notificación (web):', { title, body, scheduleDate });
    return -1;
  }

  try {
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

export const scheduleTaskNotification = async (task) => {
  if (!task.notificationDate || !['Pendiente', 'En curso'].includes(task.status)) {
    return null;
  }

  try {
    const notificationDate = new Date(task.notificationDate);
    
    if (notificationDate < new Date()) {
      return null;
    }
    
    const notificationId = task.id;
    
    const title = `Recordatorio: ${task.title}`;
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const body = `Tienes una tarea para entregar el ${dueDate}. Asignatura: ${task.subject}`;
    
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
