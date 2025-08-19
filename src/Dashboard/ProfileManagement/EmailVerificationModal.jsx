import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Mail, Send } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message } from '../../components/export';

const EmailVerificationModal = ({
  isOpen,
  onClose,
  onEmailVerified
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const VeYooAxios = useVeYooAxios();

  const validateForm = () => {
    const trimmedEmail = email.trim();
    const newErrors = {};

    if (!trimmedEmail) {
      newErrors.email = "L'adresse email est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Format d'email invalide";
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, trimmedEmail };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, trimmedEmail } = validateForm();
    if (!isValid) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await VeYooAxios.post('/auth/request-reset-code/', { email: trimmedEmail });
      setMessage(response.data.message);
      setIsSuccess(true);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        onEmailVerified(trimmedEmail);
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur lors de l\'envoi du code');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setErrors({});
    setShowMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && <Message isSuccess={isSuccess} message={message} />}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Vérification par email
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Pour changer votre mot de passe, nous devons d'abord vérifier votre identité.
              Entrez votre adresse email pour recevoir un code de vérification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => {
                      const { email, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder="votre@email.com"
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Code de vérification
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Un code à 6 chiffres sera envoyé à votre adresse email.
                    Ce code expirera dans 10 minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Envoyer le code</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EmailVerificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEmailVerified: PropTypes.func.isRequired
};

export default EmailVerificationModal;