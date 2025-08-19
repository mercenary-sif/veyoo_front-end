import { useState, useEffect, useRef } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const MalfunctionUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  editMalfunction,
  vehicles,
  tools,
}) => {
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const fileInputRef = useRef(null);

  const VeYooAxios = useVeYooAxios();

  const formatPhotos = (photos) => {
    if (!Array.isArray(photos)) return [];
    return photos
      .filter((photo) => photo && typeof photo === 'string' && photo.trim() !== '')
      .map((photo) => {
        if (photo.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(photo)) {
          return photo.startsWith('data:image/') ? photo : `data:image/jpeg;base64,${photo}`;
        }
        return photo;
      });
  };

  // Fixed material selection initialization
  useEffect(() => {
    if (editMalfunction) {
      // Find the actual material object
      const allMaterials = [
        ...(Array.isArray(vehicles) ? vehicles : []),
        ...(Array.isArray(tools) ? tools : []),
      ];
      
      const selectedMaterial = allMaterials.find(
        m => m.id.toString() === editMalfunction.materialId.toString()
      );
      
      // Determine material type from material object
      const materialType = selectedMaterial?.type?.toLowerCase() === 'outil' 
        ? 'tool' 
        : 'vehicle';

      setFormData({
        materialType: materialType,
        materialId: editMalfunction.materialId?.toString() || '',
        materialName: selectedMaterial?.name || editMalfunction.materialName,
        description: editMalfunction.description || '',
        severity: editMalfunction.severity || 'Medium',
        status: editMalfunction.status || 'Reported',
        reportedBy: editMalfunction.reportedBy || 'Système',
        notes: editMalfunction.notes || '',
        photos: [],
        existingPhotos: formatPhotos(editMalfunction.photos || []),
      });
    } else {
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
    }
  }, [editMalfunction, vehicles, tools]);

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

  const showTemporaryMessage = (msg, success = true, duration = 2000) => {
    setMessage(msg);
    setIsSuccess(success);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), duration);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Fixed material type change handler
  const handleMaterialTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      materialType: type,
      materialId: '',
      materialName: '',
    }));
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
    e.target.value = null;
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

  const validate = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsConfirmationOpen(true);
  };

  // Fixed photo handling - keep existing photos unless deleted
  const confirmSubmit = async () => {
    setIsConfirmationOpen(false);
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add existing photos that haven't been deleted
      formData.existingPhotos.forEach(photo => {
        // Extract base64 string if needed
        const base64Data = photo.split(',')[1] || photo;
        formDataToSend.append('existing_photos', base64Data);
      });

      // Add new photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo, `malfunction_photo_${index}.jpg`);
      });

      // Add other fields
      formDataToSend.append('materialId', formData.materialId);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('severity', formData.severity);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('reported_by', formData.reportedBy.trim());
      if (formData.notes.trim()) {
        formDataToSend.append('notes', formData.notes.trim());
      }

      const response = await VeYooAxios.put(
        `/material/malfunctions/update/${editMalfunction.id}/`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setIsLoading(false);
      showTemporaryMessage(response.data.message || 'Dysfonctionnement mis à jour avec succès', true);

      const allMaterials = [
        ...(Array.isArray(vehicles) ? vehicles : []),
        ...(Array.isArray(tools) ? tools : []),
      ];
      const selectedMaterial = allMaterials.find((m) => m.id.toString() === formData.materialId);
      
      // Combine existing and new photos for display
      const allPhotos = [
        ...formData.existingPhotos,
        ...formData.photos.map((photo) => URL.createObjectURL(photo))
      ];
      
      const malfunctionData = {
        id: editMalfunction.id,
        materialName: formData.materialName,
        materialType: formData.materialType,
        materialId: parseInt(formData.materialId),
        materialStatus: selectedMaterial?.status || 'unknown',
        description: formData.description.trim(),
        severity: formData.severity,
        status: formData.status,
        reportedBy: formData.reportedBy.trim(),
        reportedAt: editMalfunction.reportedAt,
        notes: formData.notes.trim() || '',
        photos: allPhotos,
      };

      setTimeout(() => {
        onSubmit(malfunctionData);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erreur lors de la mise à jour du dysfonctionnement';
      showTemporaryMessage(errorMsg, false);
    } finally {
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

  const availableMaterials = formData.materialType === 'vehicle'
    ? Array.isArray(vehicles) ? vehicles : []
    : Array.isArray(tools) ? tools : [];

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
        {showMessage && <Message isSuccess={isSuccess} message={message} />}
        {isLoading && (
          <Loading loading_txt={'Mise à jour du dysfonctionnement en cours... cela prendra quelques instants !'} />
        )}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          ></div>

          <div className="relative inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-xl flex-col">
            <div className="bg-blue-600 p-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-white text-xl font-bold">
                Modifier le dysfonctionnement
              </h3>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200"
                disabled={isLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Material Type - Fixed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de matériel *
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleMaterialTypeChange('vehicle')}
                      className={`px-4 py-2 rounded-lg ${
                        formData.materialType === 'vehicle'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      Véhicule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMaterialTypeChange('tool')}
                      className={`px-4 py-2 rounded-lg ${
                        formData.materialType === 'tool'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      Outil
                    </button>
                  </div>
                </div>

                {/* Material Selection - Fixed */}
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
                        <option key={material.id} value={material.id.toString()}>
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
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Décrivez en détail le problème rencontré..."
                    disabled={isLoading}
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.description.length}/500 caractères
                  </p>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gravité *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
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

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
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

                {/* Reported By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signalé par *
                  </label>
                  <input
                    type="text"
                    name="reportedBy"
                    value={formData.reportedBy}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.reportedBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Nom de la personne qui signale"
                    disabled={isLoading}
                  />
                  {errors.reportedBy && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reportedBy}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Informations complémentaires..."
                    disabled={isLoading}
                  ></textarea>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photos du dysfonctionnement
                  </label>
                  {formData.existingPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
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
                    <span>Modifier</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmSubmit}
        message="Êtes-vous sûr de vouloir modifier ce dysfonctionnement ?"
      />
    </>
  );
};

export default MalfunctionUpdateModal;