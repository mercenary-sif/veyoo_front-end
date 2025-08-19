import  { useState } from 'react';
import { X,  Mail, Phone, Calendar, Clock } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSubmit, mode, user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Inspector',
    whatsapp: user?.whatsapp || ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Le numéro WhatsApp est requis';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = 'Numéro invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }
    if (validateForm()) {
      onSubmit({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        whatsapp: formData.whatsapp.trim()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Nouvel Utilisateur' : mode === 'edit' ? 'Modifier Utilisateur' : 'Profil Utilisateur'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {mode === 'view' && user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  user.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {user.role === 'Admin' ? 'Administrateur' : user.role === 'Manager' ? 'Manager' : 'Inspecteur'}
                </span>
                <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                  user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {user.status === 'Active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.whatsapp || 'Non défini'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Date d'inscription</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{(user.registration_date)}</p>
                </div>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière connexion</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.lastLogin).toLocaleDateString('fr-FR')} à {new Date(user.lastLogin).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Jean Dupont"
              />
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="jean.dupont@example.com"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              >
                <option value="Inspector">Inspecteur</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro WhatsApp *</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="+33612345678"
              />
              {errors.whatsapp && <p className="text-sm text-red-600">{errors.whatsapp}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {mode === 'create' ? 'Créer' : 'Modifier'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserModal;