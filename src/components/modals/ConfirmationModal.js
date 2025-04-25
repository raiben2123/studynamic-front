// src/components/modals/ConfirmationModal.js
import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * Modal de confirmación reutilizable para acciones importantes
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto o no
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje de confirmación
 * @param {function} props.onConfirm - Función a ejecutar al confirmar
 * @param {string} props.confirmText - Texto del botón de confirmación (opcional)
 * @param {string} props.cancelText - Texto del botón de cancelación (opcional)
 * @param {string} props.type - Tipo de confirmación: 'danger', 'warning', 'info', 'success' (opcional)
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    // Configurar colores según el tipo
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <FaExclamationTriangle className="text-error text-2xl" />,
                    confirmClass: 'bg-error hover:bg-error/80',
                    titleClass: 'text-error'
                };
            case 'warning':
                return {
                    icon: <FaExclamationTriangle className="text-task-media text-2xl" />,
                    confirmClass: 'bg-task-media hover:bg-task-media/80',
                    titleClass: 'text-task-media'
                };
            case 'success':
                return {
                    icon: <FaCheckCircle className="text-task-finalizada text-2xl" />,
                    confirmClass: 'bg-task-finalizada hover:bg-task-finalizada/80',
                    titleClass: 'text-task-finalizada'
                };
            case 'info':
                return {
                    icon: <FaInfoCircle className="text-primary text-2xl" />,
                    confirmClass: 'bg-primary hover:bg-accent',
                    titleClass: 'text-primary'
                };
            default:
                return {
                    icon: <FaQuestionCircle className="text-primary text-2xl" />,
                    confirmClass: 'bg-primary hover:bg-accent',
                    titleClass: 'text-primary'
                };
        }
    };

    const typeConfig = getTypeConfig();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div className="flex flex-col items-center mb-4">
                {typeConfig.icon}
                <h3 className={`text-lg font-medium mt-2 ${typeConfig.titleClass}`}>{title}</h3>
            </div>

            <div className="my-4 text-center">
                <p className="text-gray-600">{message}</p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    {cancelText}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${typeConfig.confirmClass}`}
                >
                    {confirmText}
                </motion.button>
            </div>
        </Modal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    type: PropTypes.oneOf(['danger', 'warning', 'info', 'success'])
};

export default ConfirmationModal;