import { useState, useEffect } from 'react';
import { X, Shield, User as UserIcon, Mail } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';

const ChangeUserRoleModal = ({ isOpen, onClose, onRoleChanged, user }) => {
  const [role, setRole] = useState('Inspector');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (user) {
      // keep user.role if present, normalize capitalized values
      const r = user.role ? (typeof user.role === 'string' ? user.role : '') : '';
      // prefer the stored UI-friendly role (Inspector/Manager/Admin)
      setRole(r || 'Inspector');
    } else {
      setRole('Inspector');
    }
    setMessage('');
    setIsSuccess(false);
    setShowMessage(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // If role unchanged: short-circuit
    if ((user.role || '').toLowerCase() === role.toLowerCase()) {
      setMessage('Le rôle est déjà défini sur la valeur demandée.');
      setIsSuccess(true);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        onClose();
      }, 1200);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setShowMessage(false);

    try {
      // endpoint from your backend
      const resp = await VeYooAxios.put(`accounts/change-role/${user.id}/`, {
        role: role.toLowerCase(),
      });

      const payload = resp.data || {};
      const newRole = payload.new_role || payload.role || role;
      const oldRole = payload.old_role || user.role || '';

      setMessage(payload.message || `Rôle mis à jour (${oldRole} → ${newRole}).`);
      setIsSuccess(true);
      setShowMessage(true);

      // notify parent so it can update list and counts
      if (typeof onRoleChanged === 'function') {
        onRoleChanged({
          id: user.id,
          old_role: oldRole,
          new_role: newRole,
        });
      }

      setIsLoading(false);
      // keep message briefly then close
      setTimeout(() => {
        setShowMessage(false);
        onClose();
      }, 1400);
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || 'Échec lors de la mise à jour du rôle.';
      setMessage(errMsg);
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
        {/* backdrop */}
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50"
          onClick={() => {
            if (!isLoading) onClose();
          }}
        ></div>

        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 z-10">
          {/* messages & loading */}
          {showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
          {isLoading && <Loading loading_txt={'Mise à jour du rôle...'} />}

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Modifier le rôle de l'utilisateur
            </h3>
            <button
              onClick={() => {
                if (!isLoading) onClose();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* show a bit of the selected user's current info */}
          {user && (
            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{user.name || user.username || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{user.email || '—'}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Rôle actuel : <span className="font-medium">{user.role || '—'}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Shield className="h-4 w-4" />
                <span>Rôle *</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              >
                <option value="Inspector">Inspecteur</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  if (!isLoading) onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                Modifier
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangeUserRoleModal;
