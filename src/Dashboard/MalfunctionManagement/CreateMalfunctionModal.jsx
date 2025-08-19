import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, Car, Wrench, Upload, FileText } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const CreateMalfunctionModal = ({ isOpen, onClose, onSubmit, editMalfunction, vehicles, tools }) => {
  const [formData, setFormData] = useState({
    materialType: editMalfunction?.materialType?.toLowerCase() || 'vehicle',
    materialId: editMalfunction?.materialId?.toString() || '',
    materialName: editMalfunction?.materialName || '',
    description: editMalfunction?.description || '',
    severity: editMalfunction?.severity || 'Medium',
    status: editMalfunction?.status || 'Reported',
    reportedBy: editMalfunction?.reportedBy || 'Système',
    notes: editMalfunction?.notes || '',
    photos: [], // New uploads (File objects)
    existingPhotos: editMalfunction?.photos || [], // Existing photo URLs
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const fileInputRef = useRef(null);

  const VeYooAxios = useVeYooAxios();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Show temporary message
  const showTemporaryMessage = (msg, success = true, duration = 2000) => {
    setMessage(msg);
    setIsSuccess(success);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), duration);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.materialId) newErrors.materialId = 'Veuillez sélectionner un matériel';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    if (!formData.reportedBy.trim()) newErrors.reportedBy = 'Le nom du déclarant est requis';
    if (!['Low', 'Medium', 'High', 'Critical'].includes(formData.severity)) {
      newErrors.severity = 'Gravité invalide';
    }
    if (!['Reported', 'In Progress', 'Resolved'].includes(formData.status)) {
      newErrors.status = 'Statut invalide';
    }

    // Validate materialId exists in available materials
    const allMaterials = [
      ...(Array.isArray(vehicles) ? vehicles : []),
      ...(Array.isArray(tools) ? tools : []),
    ];
    if (formData.materialId && !allMaterials.find((m) => m.id.toString() === formData.materialId)) {
      newErrors.materialId = 'Matériel sélectionné invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMaterialChange = (materialId) => {
    const allMaterials = [
      ...(Array.isArray(vehicles) ? vehicles : []),
      ...(Array.isArray(tools) ? tools : []),
    ];
    const selectedMaterial = allMaterials.find((m) => m.id.toString() === materialId);

    if (selectedMaterial) {
      setFormData((prev) => ({
        ...prev,
        materialId: selectedMaterial.id.toString(),
        materialName: selectedMaterial.name,
        materialType: selectedMaterial.type.toLowerCase() === 'véhicule' ? 'vehicle' : 'tool',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        materialId: '',
        materialName: '',
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
    }));
    e.target.value = null; // Reset to allow re-selecting same files
  };

  const removeNewPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const removeExistingPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((_, i) => i !== index),
    }));
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
      formDataToSend.append('material_id', formData.materialId);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('severity', formData.severity);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('reported_by', formData.reportedBy.trim());
      if (formData.notes.trim()) {
        formDataToSend.append('notes', formData.notes.trim());
      }
      // Append photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo, `malfunction_photo_${index}.jpg`);
      });

      const response = await VeYooAxios.post('/material/malfunctions/add-material/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsLoading(false);
      showTemporaryMessage(response.data.message || 'Dysfonctionnement signalé avec succès', true);

      // Transform response to match parent component expectations
      const allMaterials = [
        ...(Array.isArray(vehicles) ? vehicles : []),
        ...(Array.isArray(tools) ? tools : []),
      ];
      const selectedMaterial = allMaterials.find((m) => m.id.toString() === formData.materialId);
      const malfunctionData = {
        id: response.data.id,
        materialName: formData.materialName,
        materialType: formData.materialType,
        materialId: parseInt(formData.materialId),
        materialStatus: selectedMaterial?.status || 'unknown',
        description: formData.description.trim(),
        severity: formData.severity,
        status: formData.status,
        reportedBy: formData.reportedBy.trim(),
        reportedAt: new Date().toISOString(), // Approximate, as API sets server time
        notes: formData.notes.trim() || '',
        photos: formData.photos.map((photo) => URL.createObjectURL(photo)), // Preview URLs for new photos
      };

      setTimeout(() => {
        onSubmit(malfunctionData);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.message || 'Erreur lors de la création du dysfonctionnement';
      showTemporaryMessage(errorMsg, false);
    }finally{
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      materialType: 'vehicle',
      materialId: '',
      materialName: '',
      description: '',
      severity: 'Medium',
      status: 'Reported',
      reportedBy: 'Système',
      notes: '',
      photos: [],
      existingPhotos: [],
    });
    setErrors({});
    setMessage('');
    setIsSuccess(false);
    setShowMessage(false);
    setIsConfirmationOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  // Determine available materials, handling string case
  const availableMaterials = formData.materialType === 'vehicle'
    ? Array.isArray(vehicles) ? vehicles : []
    : Array.isArray(tools) ? tools : [];

  // Check if there are no materials available for the selected type
  const noMaterialsMessage = formData.materialType === 'vehicle'
    ? Array.isArray(vehicles) && vehicles.length === 0
      ? 'Aucun véhicule disponible.'
      : !Array.isArray(vehicles)
      ? vehicles
      : null
    : Array.isArray(tools) && tools.length === 0
    ? 'Aucun outil disponible.'
    : !Array.isArray(tools)
    ? tools
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {showMessage && <Message isSuccess={isSuccess} message={message}/>}
        {isLoading && (
          <Loading loading_txt={'Création du dysfonctionnement en cours... cela prendra quelques instants !'} />
        )}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

          <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editMalfunction ? 'Modifier le dysfonctionnement' : 'Signaler un dysfonctionnement'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                disabled={isLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Material Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Type de matériel *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, materialType: 'vehicle', materialId: '', materialName: '' }))
                    }
                    className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                      formData.materialType === 'vehicle'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={isLoading}
                  >
                    <Car className="h-4 w-4" />
                    <span>Véhicule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, materialType: 'tool', materialId: '', materialName: '' }))
                    }
                    className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                      formData.materialType === 'tool'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={isLoading}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Outil</span>
                  </button>
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.materialType === 'vehicle' ? 'Véhicule' : 'Outil'} concerné *
                </label>
                {noMaterialsMessage ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{noMaterialsMessage}</p>
                ) : (
                  <select
                    value={formData.materialId}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.materialId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner un {formData.materialType === 'vehicle' ? 'véhicule' : 'outil'}</option>
                    {availableMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}{' '}
                        {formData.materialType === 'vehicle' && material.license_plate && `(${material.license_plate})`}
                      </option>
                    ))}
                  </select>
                )}
                {errors.materialId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.materialId}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description du dysfonctionnement *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Décrivez en détail le problème rencontré..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.description.length}/500 caractères
                </p>
              </div>

              {/* Severity and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gravité *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, severity: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.severity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="Low">Faible</option>
                    <option value="Medium">Moyenne</option>
                    <option value="High">Élevée</option>
                    <option value="Critical">Critique</option>
                  </select>
                  {errors.severity && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.severity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="Reported">Signalé</option>
                    <option value="In Progress">En cours</option>
                    <option value="Resolved">Résolu</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                  )}
                </div>
              </div>

             

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photos du dysfonctionnement
                </label>
                <div className="space-y-3">
                  {/* Existing Photos (URLs from editMalfunction) */}
                  {formData.existingPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {formData.existingPhotos.map((photo, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={photo}
                            alt={`ph ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=Image+indisponible';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            disabled={isLoading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* New Photos (File uploads) */}
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {formData.photos.map((photo, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Nouvelle ph ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            disabled={isLoading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* File Input Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Ajouter des photos</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Notes complémentaires</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Informations complémentaires..."
                  disabled={isLoading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || noMaterialsMessage}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>{editMalfunction ? 'Modifier' : 'Signaler'}</span>
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
        message={`Êtes-vous sûr de vouloir ${editMalfunction ? 'modifier' : 'signaler'} ce dysfonctionnement ?`}
      />
    </>
  );
};

export default CreateMalfunctionModal;