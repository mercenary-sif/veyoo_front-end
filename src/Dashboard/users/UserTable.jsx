import { useState } from 'react';
import { Eye,  Trash2, UserX, UserCheck, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const UserTable = ({ users, onViewUser,  onDeleteUser, onToggleStatus ,onChangeRole }) => {
  const [expandedRows, setExpandedRows] = useState({});
  
  const toggleRow = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table (visible on xl screens) */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                WhatsApp
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                    user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    user.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {user.role === 'Admin' ? 'Administrateur' : user.role === 'Manager' ? 'Manager' : 'Inspecteur'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.whatsapp_number || 'Non défini'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.status === 'Active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.registration_date}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onViewUser(user)} title="Voir" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      title={user.status === 'Active' ? 'Désactiver' : 'Activer'}
                      className={`text-gray-400 ${user.status === 'Active' ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-green-600 dark:hover:text-green-400'} p-2`}
                    >
                      {user.status === 'Active' ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                    </button>
                   <button
                      onClick={() => onChangeRole(user)}
                      title="Changer le rôle"
                      className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-2"
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDeleteUser(user)} title="Supprimer" className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View (lg screens - hide action column) */}
      <div className="hidden lg:block xl:hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                WhatsApp
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date d'inscription
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                    user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    user.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {user.role === 'Admin' ? 'Administrateur' : user.role === 'Manager' ? 'Manager' : 'Inspecteur'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.whatsapp_number || 'Non défini'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.status === 'Active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (md and below - show only names and expandable rows) */}
      <div className="lg:hidden">
        <div className="space-y-2 p-2">
          {users.map(user => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleRow(user.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {expandedRows[user.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {expandedRows[user.id] && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rôle</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        user.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {user.role === 'Admin' ? 'Administrateur' : user.role === 'Manager' ? 'Manager' : 'Inspecteur'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Statut</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.status === 'Active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">WhatsApp</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.whatsapp_number || 'Non défini'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date d'inscription</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-600">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onViewUser(user)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Voir"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                     
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onToggleStatus(user)}
                        title={user.status === 'Active' ? 'Désactiver' : 'Activer'}
                        className={`p-2 ${user.status === 'Active' ? 'text-gray-500 hover:text-red-600 dark:hover:text-red-400' : 'text-gray-500 hover:text-green-600 dark:hover:text-green-400'}`}
                      >
                        {user.status === 'Active' ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTable;