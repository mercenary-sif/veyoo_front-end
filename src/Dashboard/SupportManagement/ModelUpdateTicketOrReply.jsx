import React, { useState, useEffect, useRef } from 'react';
import { X, Edit, Upload, FileText } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';

const ModelUpdateTicketOrReply = ({ isOpen, onClose, ticket, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    attachments: [] // mixture of: { existing: true, id, file_name, url } OR File instances
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const VeYooAxios = useVeYooAxios();

  // When modal opens / ticket changes populate fields
  useEffect(() => {
    if (isOpen && ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'Medium',
        attachments: (ticket.attachments || []).map(att => ({
          existing: true,
          id: att.id,
          file_name: att.file_name,
          url: att.url
        }))
      });
      setErrors({});
      setShowMessage(false);
      setMessage('');
      setIsSuccess(false);
    }
    // When modal closed, reset local state (optional)
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        attachments: []
      });
      setErrors({});
      setShowMessage(false);
      setMessage('');
      setIsSuccess(false);
    }
  }, [isOpen, ticket]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || !formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description || !formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description && formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setShowMessage(false);
    setMessage('');
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('priority', formData.priority);

      // Determine attachment handling
      const existingAttachments = formData.attachments.filter(att => att.existing);
      const newAttachments = formData.attachments.filter(att => att instanceof File);
      const initialAttachments = (ticket.attachments || []).map(att => att.id); // IDs of original attachments
      const removedAttachmentIds = initialAttachments.filter(id => !existingAttachments.some(att => att.id === id));

      // Send new attachments
      if (newAttachments.length > 0) {
        newAttachments.forEach((att) => {
          body.append('attachments', att, att.name);
        });
      } else {
        // No new attachments, send null if no existing attachments remain
        if (existingAttachments.length === 0) {
          body.append('attachments', null);
        }
      }

      // Send IDs of existing attachments
      if (existingAttachments.length > 0) {
      const oldFileIds = existingAttachments.map(att => String(att.id)); // Convert to string
      body.append('oldFiles', JSON.stringify(oldFileIds));
    }

      // Add IDs of removed old files
      if (removedAttachmentIds.length > 0) {
        body.append('isDeletetheOledFiles', removedAttachmentIds);
      }

      const response = await VeYooAxios.patch(`/support/tickets/${ticket.id}/`, body, {
        // DO NOT set Content-Type; axios sets the boundary automatically
      });

      if (response.status === 200) {
        setMessage('Ticket mis à jour avec succès');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          onUpdate && onUpdate();
          onClose && onClose();
        }, 1200);
      } else {
        const msg = typeof response.data?.message === 'string'
          ? response.data.message
          : 'Réponse inattendue du serveur';
        setMessage(msg);
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      }
    } catch (err) {
      const resp = err.response;
      let userMsg = 'Une erreur est survenue';
      if (resp) {
        const m = resp.data?.message;
        if (typeof m === 'string') userMsg = m;
        else if (m && typeof m === 'object') userMsg = JSON.stringify(m);
        else userMsg = resp.data?.error || 'Erreur lors de la mise à jour du ticket';
      } else if (err.request) {
        userMsg = 'Erreur de connexion au serveur';
      }
      setIsSuccess(false);
      setMessage(userMsg);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {showMessage && <Message isSuccess={isSuccess} message={message} />}
        {isLoading && <Loading loading_txt={'Mise à jour en cours...'} />}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />
          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Modifier le ticket - {ticket?.title || ''}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Description détaillée *</h5>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={10}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{(formData.description || '').length}/1000 caractères</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Low">Faible</option>
                    <option value="Medium">Moyenne</option>
                    <option value="High">Élevée</option>
                  </select>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Pièces jointes (optionnel)</h5>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Uploader un fichier</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((attachment, index) => {
                        const name =
                          attachment instanceof File
                            ? attachment.name
                            : attachment.file_name || attachment.name || 'Fichier';
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{name}</span>
                            </div>
                            <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4" />
                  <span>Mettre à jour</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelUpdateTicketOrReply;