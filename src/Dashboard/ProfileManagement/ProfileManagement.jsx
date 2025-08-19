import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Key,
  Clock,
  CheckCircle
} from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import EmailVerificationModal from './EmailVerificationModal';
import CodeVerificationModal from './CodeVerificationModal';
import ChangePasswordModal from './ChangePasswordModal';
import UpdateProfileModal from './UpdateProfileModal';
import { Loading, Message } from '../../components/export';
import EmailCodeConfirmationModal from './EmailCodeConfirmationModal'; // New modal

const ProfileManagement = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showEmailCodeConfirmation, setShowEmailCodeConfirmation] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    setIsLoading(true);

    VeYooAxios.get('/auth/my-profile/')
      .then(res => {
        setUser(res.data.user);
        setIsLoading(false);
      })
      .catch(err => {
       
        setError(err.response?.data?.message || 'Erreur lors de la récupération du profil');
        setIsLoading(false);
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailVerified = (email) => {
    setVerificationEmail(email);
    setShowEmailVerification(false);
    setShowCodeVerification(true);
  };

  const handleCodeVerified = () => {
    setShowCodeVerification(false);
    setShowChangePassword(true);
  };

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    setVerificationEmail('');
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    setShowUpdateProfile(false);
    setMessage('Profil mis à jour avec succès');
    setIsSuccess(true);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const handleEmailCodeConfirmed = () => {
    setShowEmailCodeConfirmation(false);
    setUser(prevUser => ({ ...prevUser, email_verified: true }));
    setMessage('Email confirmé avec succès');
    setIsSuccess(true);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  return (
    <>
      {showMessage && <Message isSuccess={isSuccess} message={message} />}
      {isLoading ? (
        <Loading loading_txt={'Chargement du profil...'} />
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 text-center p-4">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mon Profil
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos informations personnelles et paramètres de sécurité
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.profile_photo_base64 ? (
                    <img
                      src={user.profile_photo_base64 ? `data:image/jpeg;base64,${user.profile_photo_base64}` : null}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Image+indisponible';
                      }}
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user.fullname.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.fullname}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                      user.role === 'manager' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    }`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'manager' ? 'Manager' : 'Inspecteur'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowUpdateProfile(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier le profil</span>
                  </button>
                  <button
                    onClick={() => setShowEmailVerification(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    <span>Changer le mot de passe</span>
                  </button>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                    Informations personnelles
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Adresse email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" title="Email vérifié" />
                    </div>

                    {user.whatsapp_number && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.whatsapp_number}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Rôle</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.role === 'admin' ? 'Administrateur' : 
                           user.role === 'manager' ? 'Manager' : 'Inspecteur'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Date d'inscription</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.registration_date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Activity */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                    Activité du compte
                  </h3>
                  
                  <div className="space-y-4">
                    {user.last_login && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière connexion</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.last_login}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Statut du compte</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.status === 'active' ? 'Compte actif' : 'Compte inactif'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>

                    {user.created_at && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Compte créé le</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.updated_at && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Edit className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière modification</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2 mb-6">
                Sécurité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Key className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Mot de passe</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Changez votre mot de passe pour sécuriser votre compte
                  </p>
                  <button
                    onClick={() => setShowEmailVerification(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Mail className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Email vérifié</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Votre adresse email est {user.email_verified ? 'vérifiée et sécurisée' : 'non vérifiée'}
                  </p>
                  {!user.email_verified && (
                    <button
                      onClick={() => setShowEmailCodeConfirmation(true)}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Confirmer l'email
                    </button>
                  )}
                  {user.email_verified && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>Vérifié</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {showEmailVerification && (
            <EmailVerificationModal
              isOpen={showEmailVerification}
              onClose={() => setShowEmailVerification(false)}
              onEmailVerified={handleEmailVerified}
            />
          )}

          {showCodeVerification && (
            <CodeVerificationModal
              isOpen={showCodeVerification}
              onClose={() => setShowCodeVerification(false)}
              onCodeVerified={handleCodeVerified}
              email={verificationEmail}
            />
          )}

          {showChangePassword && (
            <ChangePasswordModal
              isOpen={showChangePassword}
              onClose={() => setShowChangePassword(false)}
              onPasswordChanged={handlePasswordChanged}
              email = {user.email}
            />
          )}

          {showUpdateProfile && (
            <UpdateProfileModal
              isOpen={showUpdateProfile}
              onClose={() => setShowUpdateProfile(false)}
              onProfileUpdated={handleProfileUpdated}
              user={user}
            />
          )}
          {showEmailCodeConfirmation && (
            <EmailCodeConfirmationModal
              isOpen={showEmailCodeConfirmation}
              onClose={() => setShowEmailCodeConfirmation(false)}
              onCodeConfirmed={handleEmailCodeConfirmed}
              email={user.email}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ProfileManagement;