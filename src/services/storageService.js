// src/services/storageService.js
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Comprobar si estamos en una plataforma nativa
const isNative = Capacitor.isNativePlatform();

/**
 * Guarda un valor seguro en el almacenamiento
 * @param {string} key - Clave para identificar el valor
 * @param {any} value - Valor a guardar (se convertirá a JSON)
 * @returns {Promise<void>}
 */
export const setSecureValue = async (key, value) => {
  try {
    // Convertir valor a string
    const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (isNative) {
      // Usar Preferences de Capacitor para almacenamiento seguro
      await Preferences.set({
        key,
        value: jsonValue,
      });
    } else {
      // En web, usar localStorage como fallback
      localStorage.setItem(key, jsonValue);
    }
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);
    throw error;
  }
};

/**
 * Obtiene un valor seguro del almacenamiento
 * @param {string} key - Clave del valor a obtener
 * @param {any} defaultValue - Valor por defecto si no se encuentra
 * @returns {Promise<any>} - El valor almacenado
 */
export const getSecureValue = async (key, defaultValue = null) => {
  try {
    let result;
    
    if (isNative) {
      // Usar Preferences de Capacitor
      const { value } = await Preferences.get({ key });
      result = value;
    } else {
      // En web, usar localStorage
      result = localStorage.getItem(key);
    }
    
    // Si no hay valor, devolver el valor por defecto
    if (result === null) {
      return defaultValue;
    }
    
    // Intentar parsear JSON, si falla devolver el string
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

/**
 * Elimina un valor seguro del almacenamiento
 * @param {string} key - Clave del valor a eliminar
 * @returns {Promise<void>}
 */
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

/**
 * Obtiene todas las claves almacenadas
 * @returns {Promise<string[]>} - Lista de claves
 */
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

/**
 * Elimina todo el almacenamiento seguro
 * @returns {Promise<void>}
 */
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

// Migrar datos de localStorage a Preferences en plataformas nativas
export const migrateFromLocalStorage = async () => {
  if (!isNative) return;
  
  try {
    // Obtener todas las claves ya migradas
    const migratedFlag = await getSecureValue('_storage_migrated_');
    if (migratedFlag) return;
    
    // Obtener todas las claves de localStorage
    const keys = Object.keys(localStorage);
    
    // Migrar cada valor a Preferences
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        await setSecureValue(key, value);
      }
    }
    
    // Marcar la migración como completada
    await setSecureValue('_storage_migrated_', true);
    
    console.log('Migración de localStorage a Preferences completada');
  } catch (error) {
    console.error('Error en migración de almacenamiento:', error);
  }
};
