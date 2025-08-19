import React, { useState } from 'react';
import { X, User, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import useVeYooAxios from '../Context/useVeYooAxios';
import { Loading, Message } from '../export';

const CreateUser = ({ isOpen, onClose, onUserCreated , addCreatedUser}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Inspector',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const VeYooAxios = useVeYooAxios();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Le numéro WhatsApp est requis';
    } else if (!/^\+\d{10,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Format invalide. Utilisez +1234567890';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await VeYooAxios.post('auth/create-account/', {
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role.toLowerCase(),
        whatsapp_number: formData.whatsapp.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      
      const transformedData = {
        id:response.data.new_user.id,
        fullName: response.data.new_user.username, // Assuming username is full name
        email: response.data.new_user.email,
        role: response.data.new_user.role,
        whatsapp: response.data.new_user.whatsapp_number,
      };
     
      // Success case
      setIsLoading(false);
      setMessage(response.data.message || 'Compte créé avec succès');
      setIsSuccess(true);
      setShowMessage(true)
      setTimeout(() => {
        if (addCreatedUser){
          onUserCreated(transformedData);
        }
        handleClose();
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      // Error case
      if (error.response) {
        setMessage(error.response.data.message || 'Erreur lors de la création de l\'utilisateur');
      } else {
        setMessage('Une erreur réseau est survenue');
      }
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }finally{
    setTimeout(() => {
        handleClose();
      }, 2000);
      
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'Inspector',
      whatsapp: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50">
        {showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
        {isLoading && <Loading loading_txt={'Un nouveau compte est en cours de création ... cela prendra quelques instants !'}/>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Créer un nouvel utilisateur
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                Nom Complet *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Jean Dupont"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="jean.dupont@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Shield className="h-4 w-4" />
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              >
                <option value="Inspector">Inspecteur</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4" />
                Numéro WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="+33612345678"
              />
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.whatsapp}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className={`mt-1 w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className={`mt-1 w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUser;