import React, { useState, useEffect, memo } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { FaWifi, FaBan } from 'react-icons/fa';

const NetworkStatusAlert = memo(function NetworkStatusAlert() {
  const [isConnected, setIsConnected] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const handleNetworkStatusChange = (status) => {
      const connected = status.connected;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        setShowAlert(true);
        
        if (connected) {
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        }
      }
    };

    const setupNetworkListener = async () => {
      try {
        const initialStatus = await Network.getStatus();
        setIsConnected(initialStatus.connected);
        
        Network.addListener('networkStatusChange', handleNetworkStatusChange);
      } catch (error) {
        console.error('Error al configurar el listener de red:', error);
      }
    };

    if (isNative || window.navigator.onLine !== undefined) {
      if (isNative) {
        setupNetworkListener();
      } else {
        const handleOnline = () => {
          setIsConnected(true);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
        };
        
        const handleOffline = () => {
          setIsConnected(false);
          setShowAlert(true);
        };
        
        setIsConnected(window.navigator.onLine);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    }

    return () => {
      if (isNative) {
        Network.removeAllListeners();
      }
    };
  }, [isConnected, isNative]);

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