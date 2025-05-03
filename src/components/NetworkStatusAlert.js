// src/components/NetworkStatusAlert.js
import React, { useState, useEffect, memo } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
// Importamos solo los íconos específicos que necesitamos
import { FaWifi, FaBan } from 'react-icons/fa';

const NetworkStatusAlert = memo(function NetworkStatusAlert() {
  const [isConnected, setIsConnected] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Función para manejar los cambios de estado de la red
    const handleNetworkStatusChange = (status) => {
      const connected = status.connected;
      
      // Si el estado de conexión cambia, actualizarlo y mostrar la alerta
      if (connected !== isConnected) {
        setIsConnected(connected);
        setShowAlert(true);
        
        // Ocultar la alerta después de 5 segundos si estamos conectados
        if (connected) {
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        }
      }
    };

    const setupNetworkListener = async () => {
      try {
        // Obtener el estado inicial de la red
        const initialStatus = await Network.getStatus();
        setIsConnected(initialStatus.connected);
        
        // Registrar el listener para cambios en la red
        Network.addListener('networkStatusChange', handleNetworkStatusChange);
      } catch (error) {
        console.error('Error al configurar el listener de red:', error);
      }
    };

    // Configurar el listener solo en dispositivos nativos o permitir comprobación web
    if (isNative || window.navigator.onLine !== undefined) {
      if (isNative) {
        setupNetworkListener();
      } else {
        // Para la web, usamos los eventos estándar de navegador
        const handleOnline = () => {
          setIsConnected(true);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
        };
        
        const handleOffline = () => {
          setIsConnected(false);
          setShowAlert(true);
        };
        
        // Estado inicial
        setIsConnected(window.navigator.onLine);
        
        // Añadir listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Limpieza
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    }

    // Función de limpieza para eliminar el listener de red
    return () => {
      if (isNative) {
        Network.removeAllListeners();
      }
    };
  }, [isConnected, isNative]);

  // No mostrar nada si no hay alerta o si estamos en simulador/navegador sin soporte
  if (!showAlert) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-0 right-0 mx-auto w-11/12 max-w-md p-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${isConnected ? 'bg-task-finalizada text-white' : 'bg-task-vencida text-white'}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {isConnected ? (
            <FaWifi className="text-white text-xl" />
          ) : (
            <FaBan className="text-white text-xl" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {isConnected
              ? 'Conexión a Internet restaurada'
              : 'Sin conexión a Internet'
            }
          </p>
          <p className="text-sm opacity-80">
            {isConnected
              ? 'La aplicación está sincronizando datos'
              : 'Algunas funciones no estarán disponibles'
            }
          </p>
        </div>
        {isConnected && (
          <button
            onClick={() => setShowAlert(false)}
            className="ml-2 text-white opacity-80 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
});

export default NetworkStatusAlert;