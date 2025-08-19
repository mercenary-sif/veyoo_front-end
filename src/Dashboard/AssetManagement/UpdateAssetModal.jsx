// src/components/tools/UpdateAssetModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UpdateAssetModal = ({ 
  isOpen, 
  onClose, 
  editTool,
  onSuccess // callback(updatedTool)
}) => {
  const getInitialFormState = () => ({
    name: '',
    category: '',
    manufacturer: '',
    status: 'good',
    photo: null,
    description: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    last_maintenance_date: '',
    inspection_due_date: '',
  });

  const [formData, setFormData] = useState(getInitialFormState());
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (isOpen) {
      const initialData = editTool || getInitialFormState();
      // Map fields from editTool to our form shape
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        manufacturer: initialData.manufacturer || '',
        status: initialData.status || 'good',
        photo: initialData.photo || null, // could be data URL
        description: initialData.description || '',
        serial_number: initialData.serial_number || '',
        purchase_date: initialData.purchase_date || '',
        warranty_expiry: initialData.warranty_expiry || '',
        last_maintenance_date: initialData.last_maintenance_date || '',
        inspection_due_date: initialData.inspection_due_date || '',
      });

      if (initialData.photo) {
        setPreviewUrl(initialData.photo);
      } else {
        setPreviewUrl(null);
      }

      setErrors({});
      setMessage('');
      setIsSuccess(false);
      setShowMessage(false);
    }
  }, [isOpen, editTool]);

  // cleanup object URLs if any
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // create blob preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const removePhoto = () => {
    // revoke if blob
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.category.trim()) newErrors.category = 'La catégorie est requise';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Le fabricant est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim() || '');
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('serial_number', formData.serial_number.trim() || '');
      formDataToSend.append('manufacturer', formData.manufacturer.trim());
      formDataToSend.append('status', formData.status);

      if (formData.purchase_date) formDataToSend.append('purchase_date', formData.purchase_date);
      if (formData.warranty_expiry) formDataToSend.append('warranty_expiry', formData.warranty_expiry);
      if (formData.last_maintenance_date) formDataToSend.append('last_maintenance_date', formData.last_maintenance_date);
      if (formData.inspection_due_date) formDataToSend.append('inspection_due_date', formData.inspection_due_date);

      // photo handling:
      // if photo is a File (user selected new file) -> append
      // if photo is a data url or existing url and unchanged -> don't append (backend will keep current)
      if (formData.photo && formData.photo instanceof File) {
        formDataToSend.append('photo', formData.photo);
      } else if (typeof formData.photo === 'string' && formData.photo.startsWith('data:image')) {
        // convert dataURL to blob
        const res = await fetch(formData.photo);
        const blob = await res.blob();
        formDataToSend.append('photo', blob, 'tool.jpg');
      }

      // call update endpoint
      const toolId = editTool.id;
      const response = await VeYooAxios.put(`/material/tools/update-tool/${toolId}/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // if success
      setIsLoading(false);
      setMessage(response.data?.message || "Outil mis à jour avec succès");
      setIsSuccess(true);
      setShowMessage(true);

      // Build updatedTool to pass to parent. Prefer response data if returned.
      // If API doesn't return updated object, merge formData into editTool.
      let updatedTool = {};
      if (response.data && response.data.updated_tool) {
        updatedTool = response.data.updated_tool;
      } else {
        updatedTool = {
          ...editTool,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          serial_number: formData.serial_number,
          manufacturer: formData.manufacturer,
          status: formData.status,
          purchase_date: formData.purchase_date,
          warranty_expiry: formData.warranty_expiry,
          last_maintenance_date: formData.last_maintenance_date,
          inspection_due_date: formData.inspection_due_date,
          // photo: keep previewUrl if user uploaded new one, or existing url
          photo: formData.photo instanceof File ? previewUrl : formData.photo || editTool.photo,
          updated_at: new Date().toISOString()
        };
      }

     

      // close after short delay to let user see message
      setTimeout(() => {
        setShowMessage(false);
        onSuccess(updatedTool);
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      setMessage(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la mise à jour');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  const handleClose = () => {
    // reset state
    setFormData(getInitialFormState());
    setErrors({});
    setPreviewUrl(null);
    setMessage('');
    setShowMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
        {isLoading && <Loading loading_txt={'Mise à jour de l\'outil en cours...'} />}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

          <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Modifier l'outil
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Modifiez les détails de l'outil ci-dessous
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom de l'outil *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie *
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                  </div>

                  <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fabricant *
                    </label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.manufacturer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {errors.manufacturer && <p className="mt-1 text-sm text-red-500">{errors.manufacturer}</p>}
                  </div>

                  <div>
                    <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Numéro de série
                    </label>
                    <input
                      type="text"
                      id="serial_number"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Statut
                    </label>
                    <div className="flex space-x-2">
                      {['good', 'under_maintenance', 'pending_maintenance'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status }))}
                          className={`px-3 py-1.5 text-xs rounded-full ${
                            formData.status === status
                              ? status === 'good'
                                ? 'bg-green-500 text-white'
                                : status === 'under_maintenance'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {status === 'good' && 'Bon'}
                          {status === 'under_maintenance' && 'En maintenance'}
                          {status === 'pending_maintenance' && 'Maintenance en attente'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                      />

                      {previewUrl ? (
                        <div className="flex items-center space-x-2">
                          <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded border border-gray-300" />
                          <button type="button" onClick={removePhoto} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                            Supprimer la photo
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">Aucune photo</div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                    </p>
                  </div>
                </div>

                {/* Dates & Description */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date d'achat
                    </label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fin de garantie
                    </label>
                    <input
                      type="date"
                      name="warranty_expiry"
                      value={formData.warranty_expiry || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dernière maintenance
                    </label>
                    <input
                      type="date"
                      name="last_maintenance_date"
                      value={formData.last_maintenance_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prochaine inspection
                    </label>
                    <input
                      type="date"
                      name="inspection_due_date"
                      value={formData.inspection_due_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmSubmit}
        message={`Êtes-vous sûr de vouloir modifier cet outil ?`}
      />
    </>
  );
};

export default UpdateAssetModal;
