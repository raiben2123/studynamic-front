import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

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

    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <FaExclamationTriangle className="text-error text-3xl" />,
                    confirmClass: 'bg-error hover:bg-error/80',
                    titleClass: 'text-error'
                };
            case 'warning':
                return {
                    icon: <FaExclamationTriangle className="text-orange-500 text-3xl" />,
                    confirmClass: 'bg-orange-500 hover:bg-orange-600',
                    titleClass: 'text-orange-500'
                };
            case 'success':
                return {
                    icon: <FaCheckCircle className="text-task-finalizada text-3xl" />,
                    confirmClass: 'bg-task-finalizada hover:bg-task-finalizada/80',
                    titleClass: 'text-task-finalizada'
                };
            case 'info':
                return {
                    icon: <FaInfoCircle className="text-primary text-3xl" />,
                    confirmClass: 'bg-primary hover:bg-accent',
                    titleClass: 'text-primary'
                };
            default:
                return {
                    icon: <FaQuestionCircle className="text-primary text-3xl" />,
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
            title=""
            size="sm"
        >
            <div className="flex flex-col items-center mb-4">
                {typeConfig.icon}
                <h3 className={`text-xl font-semibold mt-3 ${typeConfig.titleClass}`}>{title}</h3>
            </div>

            <div className="my-4 text-center">
                <p className="text-text">{message}</p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-input-bg text-text rounded-lg hover:bg-border transition-colors"
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