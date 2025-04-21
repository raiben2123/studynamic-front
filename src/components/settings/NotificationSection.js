// src/components/settings/NotificationSection.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NotificationSection = ({ 
    initialSettings,
    onNotificationSettingsChange 
}) => {
    const [settings, setSettings] = useState(initialSettings || {
        emailNotifications: false,
        pushNotifications: true,
        taskReminders: true
    });
    
    const handleToggle = (settingName) => {
        const updatedSettings = {
            ...settings,
            [settingName]: !settings[settingName]
        };
        
        setSettings(updatedSettings);
        onNotificationSettingsChange(updatedSettings);
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
            <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones por correo electrónico</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#467BAA]"></div>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notificaciones push</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings.pushNotifications}
                            onChange={() => handleToggle('pushNotifications')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#467BAA]"></div>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Recordatorios de tareas</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings.taskReminders}
                            onChange={() => handleToggle('taskReminders')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#467BAA]"></div>
                    </label>
                </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                <p>Configura cómo quieres recibir notificaciones sobre tus eventos, tareas y actividades en grupos.</p>
            </div>
        </div>
    );
};

NotificationSection.propTypes = {
    initialSettings: PropTypes.shape({
        emailNotifications: PropTypes.bool,
        pushNotifications: PropTypes.bool,
        taskReminders: PropTypes.bool
    }),
    onNotificationSettingsChange: PropTypes.func.isRequired
};

export default NotificationSection;