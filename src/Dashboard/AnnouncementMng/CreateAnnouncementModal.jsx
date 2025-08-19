// src/pages/announcements/CreateAnnouncementModal.jsx
import React, { useState } from 'react';
import { X, MessageSquare, FileText, Calendar } from 'lucide-react';
import { Message, Loading } from '../../components/export';
import useVeYooAxios from '../../components/Context/useVeYooAxios';

const CreateAnnouncementModal = ({
  isOpen,
  onClose,
  onCreateSuccess, // <-- parent callback to add created announcement to list
}) => {
  const VeYooAxios = useVeYooAxios();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    createdBy: 'Admin',
    cover: null,
    coverFile: null,
    pdfFile: null,
    pdfUrl: null,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.content.trim()) newErrors.content = 'Le contenu est requis';
    if (formData.content.trim().length < 20) {
      newErrors.content = 'Le contenu doit contenir au moins 20 caractères';
    }
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (!formData.endDate) newErrors.endDate = 'La date de fin est requise';
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      createdBy: 'Admin',
      cover: null,
      coverFile: null,
      pdfFile: null,
      pdfUrl: null,
    });
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
      payload.append('content', formData.content);
      payload.append('priority', formData.priority);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
      payload.append('created_by', formData.createdBy);

      if (formData.coverFile) payload.append('coverFile', formData.coverFile);
      if (formData.pdfFile) payload.append('pdfFile', formData.pdfFile);

      const response = await VeYooAxios.post(
        '/advertisements/advertisements-create/',
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Build object compatible with parent mapping
      const d = response.data;
      const newAnnouncement = {
        id: d.id,
        dbId: d.id,
        title: d.title,
        content: d.content,
        priority: d.priority,
        startDate: d.start_date,
        endDate: d.end_date,
        createdBy: d.created_by,
        updatedBy: d.updated_by,
        cover: d.cover_base64 ? `data:image/jpeg;base64,${d.cover_base64}` : null,
        pdfUrl: d.pdf_base64 ? `data:application/pdf;base64,${d.pdf_base64}` : null,
        targetRoles: ['All'],
        status: (() => {
          const now = new Date();
          const s = new Date(d.start_date);
          const e = new Date(d.end_date);
          if (now < s) return 'Scheduled';
          if (now >= s && now <= e) return 'Active';
          return 'Expired';
        })(),
        createdAt: new Date().toISOString(),
      };

      setMessage('Annonce créée avec succès');
      setMsgSuccess(true);
      setShowMessage(true)
    

      // small delay to show success then close
      setTimeout(() => {
        onCreateSuccess(newAnnouncement);
        onClose();
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la création de l\'annonce');
      setMsgSuccess(false);
      setShowMessage(true)
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowMessage(false)
      }, 2000);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
        
               {isLoading && <Loading loading_txt={'Création du actif en cours... ... cela prendra quelques instants !'}/>}
  
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && (<Message isSuccess={msgSuccess} message={message}/>)}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Créer une nouvelle annonce
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* title, content, files, dates, preview same as your code */}
            {/* I'll keep your existing inputs — copy paste from your original component */}
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Titre de l'annonce"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                  errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Contenu détaillé de l'annonce..."
              />
              {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.content.length}/1000 caractères
              </p>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image de couverture
              </label>
              <div className="flex items-center space-x-4">
                {formData.cover && (
                  <img src={formData.cover} alt="Couverture" className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, coverFile: file }));
                      const reader = new FileReader();
                      reader.onload = () => setFormData(prev => ({ ...prev, cover: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                />
              </div>
            </div>

            {/* PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document PDF (optionnel)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, pdfFile: file, pdfUrl: file.name }));
                    }
                  }}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                />
              </div>
              {formData.pdfUrl && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <FileText className="h-4 w-4" />
                  <span>PDF ajouté</span>
                </div>
              )}
            </div>

            {/* Priority & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priorité
                </label>
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

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de début *</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  min={today}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de fin *</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
              </div>
            </div>

            {/* Preview (same as your previous preview) */}
            {(formData.title || formData.content) && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Aperçu de l'annonce</h5>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-start space-x-4">
                    {formData.cover && (
                      <img src={formData.cover} alt="Couverture" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h6 className="font-semibold text-gray-900 dark:text-white">{formData.title}</h6>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          formData.priority === 'High' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                          formData.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                          'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        }`}>
                          {formData.priority === 'High' ? 'Élevée' : formData.priority === 'Medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formData.content.substring(0, 150)}...</p>
                      {formData.pdfUrl && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <FileText className="h-3 w-3" />
                          <span>PDF joint</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {isLoading ? (
                  <span>Création en cours...</span>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span>Publier</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
      </>
  );
};

export default CreateAnnouncementModal;
