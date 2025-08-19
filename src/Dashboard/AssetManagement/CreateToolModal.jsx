import React, { useState } from 'react';
import { X, Wrench, Upload, Calendar, Shield, Package } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';


const CreateToolModal = ({ isOpen, onClose, onSubmit, editTool}) => {
  const [formData, setFormData] = useState({
    name: editTool?.name || '',
    description: editTool?.description || '',
    category: editTool?.category || '',
    serial_number: editTool?.serial_number || '',
    manufacturer: editTool?.manufacturer || '',
    status: editTool?.status || 'good',
    photo: editTool?.photo || '',
    purchase_date: editTool?.purchase_date || '',
    warranty_expiry: editTool?.warranty_expiry || '',
    last_maintenance_date: editTool?.last_maintenance_date || '',
    inspection_due_date: editTool?.inspection_due_date || '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const VeYooAxios = useVeYooAxios();

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
      if (formData.purchase_date) {
        formDataToSend.append('purchase_date', formData.purchase_date);
      }
      if (formData.warranty_expiry) {
        formDataToSend.append('warranty_expiry', formData.warranty_expiry);
      }
      if (formData.last_maintenance_date) {
        formDataToSend.append('last_maintenance_date', formData.last_maintenance_date);
      }
      if (formData.inspection_due_date) {
        formDataToSend.append('inspection_due_date', formData.inspection_due_date);
      }
      if (formData.photo && formData.photo.startsWith('data:image')) {
        const response = await fetch(formData.photo);
        const blob = await response.blob();
        formDataToSend.append('photo', blob, 'tool.jpg');
      }

      const response = await VeYooAxios.post('/material/tools/create-new-tool/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsLoading(false);
      setMessage(response.data.message || 'Outil créé avec succès');
      setIsSuccess(true);
      setShowMessage(true);
      // Transform data to match parent component expectations
      const toolData = {
        id: Date.now(), // Generate temporary ID since endpoint doesn't return one
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        category: formData.category.trim(),
        serial_number: formData.serial_number.trim() || '',
        manufacturer: formData.manufacturer.trim(),
        status: formData.status,
        photo: formData.photo,
        purchase_date: formData.purchase_date,
        warranty_expiry: formData.warranty_expiry,
        last_maintenance_date: formData.last_maintenance_date,
        inspection_due_date: formData.inspection_due_date,
        type: 'tool',
        is_active: true,
      };

     
      setTimeout(() => {
         onSubmit(toolData);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setMessage(
        error.response?.data.error || 'Erreur lors de la création de l\'outil'
      );
      setShowMessage(true);
      setIsSuccess(false);
    }
    setTimeout(() => {
        setShowMessage(false);
      }, 2000);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      serial_number: '',
      manufacturer: '',
      status: 'good',
      photo: '',
      purchase_date: '',
      warranty_expiry: '',
      last_maintenance_date: '',
      inspection_due_date: '',
    });
    setErrors({});
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
{showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
           {isLoading && <Loading loading_txt={'Création du actif en cours... ... cela prendra quelques instants !'}/>}           
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

          <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editTool ? 'Modifier l\'outil' : 'Ajouter un nouvel outil'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="h-4 w-4" />
                  <span>Photo de l'outil</span>
                </label>
                <div className="flex items-center space-x-4">
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Outil"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                  />
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Supprimer la photo
                    </button>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Informations de base</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Wrench className="h-4 w-4" />
                      <span>Nom de l'outil *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Extincteur SRI"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Package className="h-4 w-4" />
                      <span>Catégorie *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Sécurité incendie"
                    />
                    {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fabricant *
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.manufacturer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="SRI Safety"
                    />
                    {errors.manufacturer && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.manufacturer}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numéro de série
                    </label>
                    <input
                      type="text"
                      value={formData.serial_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, serial_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="EXT-2023-001"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Description</h4>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description détaillée de l'outil..."
                />
              </div>

              {/* Status and Dates */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Statut et Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="good">Bon</option>
                      <option value="under_maintenance">En maintenance</option>
                      <option value="pending_maintenance">Maintenance en attente</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date d'achat</span>
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Shield className="h-4 w-4" />
                      <span>Fin de garantie</span>
                    </label>
                    <input
                      type="date"
                      value={formData.warranty_expiry}
                      onChange={(e) => setFormData((prev) => ({ ...prev, warranty_expiry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dernière maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.last_maintenance_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, last_maintenance_date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prochaine inspection
                    </label>
                    <input
                      type="date"
                      value={formData.inspection_due_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, inspection_due_date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  {editTool ? 'Modifier' : 'Ajouter'}
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
        message={`Êtes-vous sûr de vouloir ${editTool ? 'modifier' : 'ajouter'} cet outil ?`}
      />
    </>
  );
};

export default CreateToolModal;