import React, { useState, useEffect } from 'react';
import { X, HelpCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { Loading, Message } from '../../components/export';
import useVeYooAxios from '../../components/Context/useVeYooAxios';

const CreateSupportTicketModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const VeYooAxios = useVeYooAxios();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'complaint',
    priority: 'Medium',
    category: 'Other',
    userId: '',
    createdBy: '',
    assignedTo: null, // Changed to null for "None" option
    attachments: null,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]); // For assignedTo dropdown

  // Fetch users for assignedTo dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await VeYooAxios.get('/users/');
        if (response.status === 200) {
          setUsers([{ id: null, name: 'Aucun' }, ...response.data.users]); // Add "None" option
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    if (isOpen) fetchUsers();
  }, [VeYooAxios, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description.trim().length < 20) newErrors.description = 'La description doit contenir au moins 20 caractères';
    if (!formData.userId) newErrors.userId = 'Veuillez sélectionner un utilisateur';
    if (!formData.createdBy) newErrors.createdBy = 'Le créateur est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'complaint', priority: 'Medium', category: 'Other', userId: '', createdBy: '', assignedTo: null, attachments: null });
    setErrors({});
    setMessage('');
    setMsgSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('type', formData.type);
      payload.append('priority', formData.priority);
      payload.append('userId', formData.userId);
      payload.append('createdBy', formData.createdBy);
      if (formData.assignedTo) payload.append('assignedTo', formData.assignedTo); // Only append if not null
      if (formData.attachments) payload.append('attachments', formData.attachments);

      const response = await VeYooAxios.post('/support-ticket/', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (response.status === 201) {
        const newTicket = { id: response.data.id, ...formData, status: 'Open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        setMessage('Ticket créé avec succès');
        setMsgSuccess(true);
        setShowMessage(true);
        setTimeout(() => {
          onCreateSuccess(newTicket);
          onClose();
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de la création du ticket';
      setMessage(errorMsg.includes('Missing fields') ? errorMsg : 'Erreur lors de la création du ticket');
      setMsgSuccess(false);
      setShowMessage(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {isLoading && <Loading loading_txt="Création du ticket en cours..." />}
      {showMessage && <Message isSuccess={msgSuccess} message={message} />}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>
          <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Créer un nouveau ticket de support</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Type de demande</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'complaint', category: 'Complaint' }))} className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    formData.type === 'complaint' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                    <MessageSquare className="h-4 w-4" /><span>Plainte</span>
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'issue', category: 'Issue' }))} className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    formData.type === 'issue' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                    <AlertTriangle className="h-4 w-4" /><span>Problème</span>
                  </button>
                </div>
              </div>
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Utilisateur concerné *</label>
                <select value={formData.userId} onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.userId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <option value="">Sélectionner un utilisateur</option>
                  <option value="1">User1 (user1@example.com)</option>
                  <option value="2">User2 (user2@example.com)</option>
                </select>
                {errors.userId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userId}</p>}
              </div>
              {/* Creator Selection (mocked, replace with real data or auth user) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Créé par *</label>
                <input type="text" value={formData.createdBy} onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.createdBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`} placeholder="Nom du créateur" />
                {errors.createdBy && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.createdBy}</p>}
              </div>
              {/* Assigned To Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigné à</label>
                <select value={formData.assignedTo || ''} onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value || null }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              {/* Title, Description, Priority, Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`} placeholder="Titre du ticket" />
                {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={6} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`} placeholder="Description détaillée du problème ou de la plainte..." />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formData.description.length}/1000 caractères</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
                  <select value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="Low">Faible</option>
                    <option value="Medium">Moyenne</option>
                    <option value="High">Élevée</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pièces jointes</label>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFormData(prev => ({ ...prev, attachments: e.target.files[0] }))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600" />
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Annuler</button>
                <button type="submit" disabled={isLoading} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}>
                  {isLoading ? <span>Création en cours...</span> : <><HelpCircle className="h-4 w-4" /><span>Créer le ticket</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSupportTicketModal;