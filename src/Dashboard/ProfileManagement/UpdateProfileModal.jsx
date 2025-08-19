import React, { useState, useRef, useEffect } from 'react';
import { X, User as UserIcon, Mail, Phone, Save, Upload, AlertCircle } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UpdateProfileModal = ({ isOpen, onClose, onProfileUpdated, user }) => {
  const fileInputRef = useRef(null);
  const VeYooAxios = useVeYooAxios();

  const toDataUrl = (base64) => (base64 ? `data:image/jpeg;base64,${base64}` : '');

  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    whatsapp_number: user?.whatsapp_number || '',
    profile_picture: null,
    // always keep a data-url string for preview
    profile_photo_base64: user?.profile_photo_base64 ? toDataUrl(user.profile_photo_base64) : ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    // when the modal opens with a new user, sync form state
    if (!user) return;
    setFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      whatsapp_number: user.whatsapp_number || '',
      profile_picture: null,
      profile_photo_base64: user.profile_photo_base64 ? toDataUrl(user.profile_photo_base64) : ''
    });
    setErrors({});
    setMessage('');
    setIsSuccess(false);
    setShowMessage(false);
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.whatsapp_number && !/^\+?[1-9]\d{1,14}$/.test(formData.whatsapp_number.replace(/\s/g, ''))) {
      newErrors.whatsapp_number = 'Format de numéro invalide';
    }

    if (formData.profile_picture && !['image/jpeg', 'image/png', 'image/gif'].includes(formData.profile_picture.type)) {
      newErrors.profile_picture = "Format d'image non supporté (JPEG, PNG, GIF uniquement)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = null;
      return;
    }

    // validate file type early
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setErrors(prev => ({ ...prev, profile_picture: "Format d'image non supporté (JPEG, PNG, GIF uniquement)" }));
      e.target.value = null;
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is a data URL (e.g. "data:image/png;base64,...")
      setFormData(prev => ({
        ...prev,
        profile_picture: file,
        profile_photo_base64: reader.result // immediate preview
      }));
      setErrors(prev => ({ ...prev, profile_picture: '' }));
      setIsUploading(false);
      // allow choosing same file next time
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrors(prev => ({ ...prev, profile_picture: 'Impossible de lire le fichier' }));
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profile_picture: null,
      profile_photo_base64: '' // remove preview (will show placeholder)
    }));
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsConfirmationOpen(true);
  };

  const confirmSubmit = async () => {
    setIsConfirmationOpen(false);
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullname', formData.fullname.trim());
      formDataToSend.append('email', formData.email.trim());
      if (formData.whatsapp_number) {
        formDataToSend.append('whatsapp_number', formData.whatsapp_number);
      }

      // If profile_picture is null but photo was cleared by user, send explicit flag
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      } else if (formData.profile_photo_base64 === '') {
        // optional: if backend supports a delete flag
        formDataToSend.append('remove_profile_picture', 'true');
      }

      const response = await VeYooAxios.put('/auth/update-my-profile/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsLoading(false);
      setMessage(response.data.message || 'Profil mis à jour avec succès');
      setIsSuccess(true);
      setShowMessage(true);

      // prefer returned profile from backend if provided, otherwise merge
      const returnedProfile = response.data.profile ?? {};
      const updatedUser = {
        ...user,
        ...returnedProfile,
        // if backend doesn't return base64, use the local preview (data URL) without prefix change
        profile_photo_base64: returnedProfile.profile_photo_base64
          ? returnedProfile.profile_photo_base64
          : // if preview is a data-url, strip prefix to store consistent raw base64 for app if you want
            // here we'll keep data-url for immediate UI
            (formData.profile_photo_base64 || user.profile_photo_base64 || '')
      };

      // Let parent update UI
      setTimeout(() => {
        onProfileUpdated(updatedUser);
        setShowMessage(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  const handleClose = () => {
    setFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      whatsapp_number: user.whatsapp_number || '',
      profile_picture: null,
      profile_photo_base64: user.profile_photo_base64 ? toDataUrl(user.profile_photo_base64) : ''
    });
    setErrors({});
    setMessage('');
    setIsSuccess(false);
    setShowMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  // compute preview src: prefer local preview (formData), fallback to user raw base64
  const previewSrc = formData.profile_photo_base64
    || (user?.profile_photo_base64 ? toDataUrl(user.profile_photo_base64) : '');

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {showMessage && <Message isSuccess={isSuccess} message={message} />}
        {isLoading && <Loading loading_txt={'Mise à jour du profil en cours...'} />}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Modifier le profil
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/20">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Image+indisponible';
                    }}
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
                {previewSrc && (
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10"
                    disabled={isLoading || isUploading}
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center space-x-2 mx-auto text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                disabled={isLoading || isUploading}
              >
                <Upload className="h-4 w-4" />
                <span>{previewSrc ? 'Changer la photo' : 'Ajouter une photo'}</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                disabled={isLoading || isUploading}
              />

              {isUploading && (
                <p className="mt-2 text-xs text-blue-500 text-center">Téléchargement en cours...</p>
              )}
              {errors.profile_picture && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-center">{errors.profile_picture}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                Modifiez vos informations personnelles
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Nom complet *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.fullname ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Votre nom complet"
                    disabled={isLoading}
                  />
                  {errors.fullname && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullname}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>Adresse email *</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="votre@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>Numéro WhatsApp</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.whatsapp_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="+33 6 12 34 56 78"
                    disabled={isLoading}
                  />
                  {errors.whatsapp_number && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.whatsapp_number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.whatsapp_number}</p>
                )}
              </div>

              {/* Role Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {user.role === 'admin' ? 'Administrateur' :
                     user.role === 'manager' ? 'Manager' : 'Inspecteur'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Le rôle ne peut pas être modifié
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Informations importantes
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      • Votre rôle et statut ne peuvent être modifiés que par un administrateur<br/>
                      • La modification de l'email nécessitera une nouvelle vérification<br/>
                      • La photo de profil doit être au format JPEG, PNG<br/>
                      • Ces changements prendront effet immédiatement
                    </p>
                  </div>
                </div>
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
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={confirmSubmit}
          message="Êtes-vous sûr de vouloir modifier votre profil ?"
        />
      </div>
    </>
  );
};

export default UpdateProfileModal;
