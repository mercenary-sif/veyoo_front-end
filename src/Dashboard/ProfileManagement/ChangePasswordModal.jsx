import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message } from '../../components/export';

const ChangePasswordModal = ({
  isOpen,
  onClose,
  onPasswordChanged,
  email
}) => {
  const [formData, setFormData] = useState({
    password: '',
    confirm_password: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const VeYooAxios = useVeYooAxios();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Au moins 8 caractères');
    if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule');
    if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule');
    if (!/[0-9]/.test(password)) errors.push('Un chiffre');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Un caractère spécial');
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Le nouveau mot de passe est requis';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Le mot de passe doit contenir: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await VeYooAxios.post('/auth/change-password/', {
        password: formData.password,
        confirm_password: formData.confirm_password,
        email:email
      });
      setMessage(response.data.message);
      setIsSuccess(true);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        onPasswordChanged();
        handleClose();
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      password: '',
      confirm_password: ''
    });
    setErrors({});
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowMessage(false);
    onClose();
  };

  const getPasswordStrength = (password) => {
    const errors = validatePassword(password);
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (errors.length === 0) return { strength: 100, label: 'Fort', color: 'bg-green-500' };
    if (errors.length <= 2) return { strength: 75, label: 'Moyen', color: 'bg-yellow-500' };
    if (errors.length <= 3) return { strength: 50, label: 'Faible', color: 'bg-orange-500' };
    return { strength: 25, label: 'Très faible', color: 'bg-red-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && <Message isSuccess={isSuccess} message={message} />}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Changer le mot de passe
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Créez un nouveau mot de passe sécurisé pour votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength >= 75 ? 'text-green-600 dark:text-green-400' :
                      passwordStrength.strength >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirm_password}</p>
              )}
              
              {/* Password Match Indicator */}
              {formData.confirm_password && formData.password && (
                <div className="mt-1 flex items-center space-x-2">
                  {formData.password === formData.confirm_password ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Exigences du mot de passe:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span>Au moins 8 caractères</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span>Une lettre majuscule</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span>Une lettre minuscule</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span>Un chiffre</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span>Un caractère spécial</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || passwordStrength.strength < 100}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changement...</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    <span>Changer le mot de passe</span>
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

export default ChangePasswordModal;