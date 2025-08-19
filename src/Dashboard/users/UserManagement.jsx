import { useState, useEffect } from 'react';
import UserTable from './UserTable';
import UserModal from './UserModal';
import { Plus, Users, UserCheck, ShieldCheck, User } from 'lucide-react';
import { CreatUser, ErrorGetData, Message, UpdateUser ,ChangeUserRoleModal } from '../../components/export';
import { Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import useVeYooAxios from '../../components/Context/useVeYooAxios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({
    total_users: 0,
    active_users: 0,
    managers: 0,
    inspectors: 0,
  });
  const [error, setError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Chargement des utilisateurs ...');
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize the custom Axios instance with interceptor
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await VeYooAxios.get('/auth/user-list/');
        const data = response.data;
        const mappedUsers = data.users.map((user) => ({
          ...user,
          joinDate: user.registration_date,
          status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : user.status,
          role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : user.role,
        }));
        setUsers(mappedUsers);
        setCounts(data.counts || counts);
        setIsLoading(false);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            setError(error.response.data.message);
          } else {
            setError("Une erreur s'est produite lors de la récupération des utilisateurs.");
          }
        } else if (error.request) {
          setError('Impossible de se connecter au serveur.');
        } else {
          setError('Une erreur est survenue.');
        }
        setIsLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VeYooAxios]);

  const openModal = (mode, user = null) => {
    setSelectedUser(user);
    if (mode === 'view') {
      setIsViewModalOpen(true);
    } else if (mode === 'edit') {
      setIsUpdateModalOpen(true);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUser(null);
  };

  const handleCreateOrEdit = (userData) => {
    if (userData.fullName) {
      const newUser = {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
        whatsapp: userData.whatsapp,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      setUsers((prev) => [...prev, newUser]);
      setCounts((prev) => ({
        ...prev,
        total_users: prev.total_users + 1,
        active_users: prev.active_users + 1,
        inspectors: userData.role === 'Inspector' ? prev.inspectors + 1 : prev.inspectors,
        managers: userData.role === 'Manager' ? prev.managers + 1 : prev.managers,
      }));
      setIsCreateUserOpen(false);
    } else if (userData.full_name) {
      // From UpdateUserModal
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: userData.full_name,
                email: userData.email,
                role: userData.role,
                whatsapp: userData.whatsapp_number,
                ...(userData.password && { password: userData.password }),
                updatedAt: new Date().toISOString(),
              }
            : u
        )
      );
      closeUpdateModal();
    }
  };

  const showConfirmation = (message, action) => {
    setConfirmationMessage(message);
    setConfirmationAction(() => action);
    setIsConfirmationOpen(true);
  };

  const handleToggleStatus = (user) => {
    showConfirmation(
      `Êtes-vous sûr de vouloir ${user.status === 'Active' ? 'désactiver' : 'activer'} l'utilisateur ${user.name} ?`,
      async () => {
        setIsLoading(true);
        setLoadingMessage("L'opération prend quelques secondes ... veuillez patienter !");
        try {
          const response = await VeYooAxios.put(`/auth/update-account-status/${user.id}/`);
          setMessage(response.data.message);
          setIsSuccess(true);
          setIsLoading(false);

          // optimistic UI update for status
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
          );
        } catch (error) {
          setMessage(error.response?.data.message || 'Une erreur est survenue.');
          setIsLoading(false);
          setIsSuccess(false);
        }
      }
    );
  };

  const handleDelete = (user) => {
    showConfirmation(
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      async () => {
        setIsLoading(true);
        setLoadingMessage("L'opération prend quelques secondes ... veuillez patienter !");
        try {
          const response = await VeYooAxios.delete(`/auth/delete-account/${user.id}/`);
          setMessage(response.data.message);
          setIsSuccess(true);
          setIsLoading(false);

          // remove user locally and update counts
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          setCounts((prev) => ({
            ...prev,
            total_users: Math.max(0, prev.total_users - 1),
            active_users: user.status === 'Active' ? Math.max(0, prev.active_users - 1) : prev.active_users,
            inspectors: user.role === 'Inspector' ? Math.max(0, prev.inspectors - 1) : prev.inspectors,
            managers: user.role === 'Manager' ? Math.max(0, prev.managers - 1) : prev.managers,
          }));
        } catch (error) {
          setMessage(error.response?.data.message || 'Une erreur est survenue.');
          setIsLoading(false);
          setIsSuccess(false);
          setTimeout(() => {
            setMessage('');
          }, 3000);
        }
      }
    );
  };

  // open change-role modal
  const handleOpenChangeRole = (user) => {
    setSelectedUser(user);
    setIsChangeRoleOpen(true);
  };

  // called by ChangeUserRoleModal when it successfully updated role
  const handleRoleChanged = ({ id, old_role, new_role }) => {
    // Normalize casing for UI
    const normalizedNew = (new_role || '').toString();
    const uiNew = normalizedNew.charAt(0).toUpperCase() + normalizedNew.slice(1);

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: uiNew } : u))
    );

    // adjust counts for manager / inspector buckets
    setCounts((prev) => {
      const updated = { ...prev };
      const prevUser = users.find((u) => u.id === id);
      const prevRoleNormalized = (prevUser?.role || '').toLowerCase();
      const newRoleNormalized = (new_role || '').toLowerCase();

      if (prevUser) {
        if (prevRoleNormalized === 'inspector') updated.inspectors = Math.max(0, updated.inspectors - 1);
        if (prevRoleNormalized === 'manager') updated.managers = Math.max(0, updated.managers - 1);
        if (newRoleNormalized === 'inspector') updated.inspectors = (updated.inspectors || 0) + 1;
        if (newRoleNormalized === 'manager') updated.managers = (updated.managers || 0) + 1;
      }

      return updated;
    });

    setMessage(`Rôle mis à jour (${old_role} → ${new_role}).`);
    setIsSuccess(true);
    setTimeout(() => setMessage(''), 3000);
    // clear selected user/modal state done by modal itself onClose
  };

  return (
    <>
      {isLoading ? (
        <Loading loading_txt={loadingMessage} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          <div className="relative p-3 lg:p-[2rem] dark:bg-gray-900 min-h-screen">
            <div>
              {message && <Message message={message} isSuccess={isSuccess} isModel={true} />}
              <div className="flex justify-between items-center gap-[2rem] mb-8 flex-col lg:flex-row">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Administrez les comptes utilisateurs avec facilité</p>
                </div>
                <button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Ajouter Utilisateur
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{counts.total_users}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs Actifs</p>
                    <p className="text-2xl font-semibold text-green-600">{counts.active_users}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Managers</p>
                    <p className="text-2xl font-semibold text-blue-600">{counts.managers}</p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inspecteurs</p>
                    <p className="text-2xl font-semibold text-purple-600">{counts.inspectors}</p>
                  </div>
                  <User className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <UserTable
                users={users}
                onViewUser={(user) => openModal('view', user)}
                onEditUser={(user) => openModal('edit', user)}
                onDeleteUser={handleDelete}
                onToggleStatus={handleToggleStatus}
                onChangeRole={handleOpenChangeRole} // <-- pass handler to table (add button in table rows)
              />

              <UserModal
                isOpen={isViewModalOpen}
                onClose={closeViewModal}
                onSubmit={handleCreateOrEdit}
                mode="view"
                user={selectedUser}
              />

              <UpdateUser
                isOpen={isUpdateModalOpen}
                onClose={closeUpdateModal}
                onSubmit={handleCreateOrEdit}
                user={selectedUser}
              />

              <CreatUser
                isOpen={isCreateUserOpen}
                onClose={() => setIsCreateUserOpen(false)}
                onUserCreated={handleCreateOrEdit}
              />

              <ChangeUserRoleModal
                isOpen={isChangeRoleOpen}
                onClose={() => {
                  setIsChangeRoleOpen(false);
                  setSelectedUser(null);
                }}
                onRoleChanged={handleRoleChanged}
                user={selectedUser}
              />

              <ConfirmationModal
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirm={() => {
                  confirmationAction();
                  setIsConfirmationOpen(false);
                }}
                message={confirmationMessage}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserManagement;
