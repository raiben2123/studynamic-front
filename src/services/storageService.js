import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const setSecureValue = async (key, value) => {
  try {
    const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (isNative) {
      await Preferences.set({
        key,
        value: jsonValue,
      });
    } else {
      localStorage.setItem(key, jsonValue);
    }
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);
    throw error;
  }
};

export const getSecureValue = async (key, defaultValue = null) => {
  try {
    let result;
    
    if (isNative) {
      const { value } = await Preferences.get({ key });
      result = value;
    } else {
      result = localStorage.getItem(key);
    }
    
    if (result === null) {
      return defaultValue;
    }
    
    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  } catch (error) {
    console.error(`Error obteniendo ${key}:`, error);
    return defaultValue;
  }
};

export const removeSecureValue = async (key) => {
  try {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error eliminando ${key}:`, error);
    throw error;
  }
};

export const getAllKeys = async () => {
  try {
    if (isNative) {
      const { keys } = await Preferences.keys();
      return keys;
    } else {
      return Object.keys(localStorage);
    }
  } catch (error) {
    console.error('Error obteniendo todas las claves:', error);
    return [];
  }
};

export const clearStorage = async () => {
  try {
    if (isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error al limpiar almacenamiento:', error);
    throw error;
  }
};

export const migrateFromLocalStorage = async () => {
  if (!isNative) return;
  
  try {
    const migratedFlag = await getSecureValue('_storage_migrated_');
    if (migratedFlag) return;

    const keys = Object.keys(localStorage);

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        await setSecureValue(key, value);
      }
    }

    await setSecureValue('_storage_migrated_', true);
    
    console.log('Migración de localStorage a Preferences completada');
  } catch (error) {
    console.error('Error en migración de almacenamiento:', error);
  }
};
