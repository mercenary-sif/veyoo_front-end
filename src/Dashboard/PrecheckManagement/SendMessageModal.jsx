import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertTriangle } from 'lucide-react';

const SendMessageModal = ({
  isOpen,
  onClose,
  precheck,
  onSend
}) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('remark');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSend(message.trim(), messageType);
    handleClose();
  };

  const handleClose = () => {
    setMessage('');
    setMessageType('remark');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>
        
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Envoyer un message
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Precheck Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contrôle concerné</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500 dark:text-gray-400">ID:</span> {precheck.id}</p>
              <p><span className="text-gray-500 dark:text-gray-400">Matériel:</span> {precheck.materialName}</p>
              <p><span className="text-gray-500 dark:text-gray-400">Inspecteur:</span> {precheck.inspectorName}</p>
              <p><span className="text-gray-500 dark:text-gray-400">Date:</span> {new Date(precheck.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Type de message
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMessageType('remark')}
                  className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    messageType === 'remark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Remarque</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('warning')}
                  className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    messageType === 'warning'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Avertissement</span>
                </button>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                  errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={
                  messageType === 'remark' 
                    ? "Votre remarque concernant ce contrôle..."
                    : "Votre avertissement concernant ce contrôle..."
                }
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {message.length}/500 caractères
              </p>
            </div>

            {/* Message Preview */}
            {message.trim() && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Aperçu du message</h5>
                <div className={`p-3 rounded-lg border-l-4 ${
                  messageType === 'warning' 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex items-start space-x-2">
                    {messageType === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        messageType === 'warning' 
                          ? 'text-orange-800 dark:text-orange-300' 
                          : 'text-blue-800 dark:text-blue-300'
                      }`}>
                        {messageType === 'warning' ? 'Avertissement' : 'Remarque'} - Contrôle {precheck.id}
                      </p>
                      <p className={`text-sm mt-1 ${
                        messageType === 'warning' 
                          ? 'text-orange-700 dark:text-orange-400' 
                          : 'text-blue-700 dark:text-blue-400'
                      }`}>
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  messageType === 'warning'
                    ? 'bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Envoyer {messageType === 'warning' ? 'l\'avertissement' : 'la remarque'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;