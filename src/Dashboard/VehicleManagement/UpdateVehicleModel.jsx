import { useEffect, useState } from 'react';
import { X, Car, Upload, Fuel, Gauge, Wrench, Calendar, Palette, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UpdateVehicleModel = ({ isOpen, onClose, onSubmit, editVehicle }) => {
 
  const [formData, setFormData] = useState({
     name: "",
    license_plate: "",
    model: "",
    brand: "",
    year_of_manufacture: new Date().getFullYear(),
    color: "",
    current_mileage: 0,
    fuel_level: 100,
    oil_level: 100,
    tire_status: "new",
    body_condition: "good",
    engine_status: "good",
    status: "good",
    fuelType: "Diesel",
    location: "",
    photo: "",
    last_maintenance_date: "",
    inspection_due_date: "",
    notes: "",
    material_id: null,
  });
   useEffect(() => {
    if (!editVehicle) return;
    setFormData({
      name: editVehicle.name ?? "",
      license_plate: editVehicle.license_plate ?? "",
      model: editVehicle.model ?? "",
      brand: editVehicle.brand ?? "",
      year_of_manufacture: editVehicle.year_of_manufacture ?? new Date().getFullYear(),
      color: editVehicle.color ?? "",
      current_mileage: editVehicle.current_mileage ?? 0,
      fuel_level: editVehicle.fuel_level ?? 100,
      oil_level: editVehicle.oil_level ?? 100,
      tire_status: editVehicle.tire_status ?? "new",
      body_condition: editVehicle.body_condition ?? "good",
      engine_status: editVehicle.engine_status ?? "good",
      status: editVehicle.status ?? "good",
      fuelType: editVehicle.fuelType ?? "Diesel",
      location: editVehicle.location ?? "",
      photo: editVehicle.photo ?? "",
      last_maintenance_date: editVehicle?.last_maintenance_date  || null,
      inspection_due_date: editVehicle?.inspection_due_date || null,
      notes: editVehicle.notes ?? "",
      material_id: editVehicle.material_id ?? null,
      id: editVehicle.id ?? null,
    });
  }, [editVehicle]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const VeYooAxios = useVeYooAxios();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.license_plate.trim()) newErrors.license_plate = "La plaque d'immatriculation est requise";
    if (!formData.model.trim()) newErrors.model = 'Le modèle est requis';
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (
      formData.year_of_manufacture < 1900 ||
      formData.year_of_manufacture > new Date().getFullYear() + 1
    ) {
      newErrors.year_of_manufacture = 'Année invalide';
    }
    if (formData.current_mileage < 0) newErrors.current_mileage = 'Le kilométrage ne peut pas être négatif';
    if (formData.fuel_level < 0 || formData.fuel_level > 100)
      newErrors.fuel_level = 'Doit être entre 0 et 100%';
    if (formData.oil_level < 0 || formData.oil_level > 100) newErrors.oil_level = 'Doit être entre 0 et 100%';

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
      formDataToSend.append('license_plate', formData.license_plate.trim());
      formDataToSend.append('model', formData.model.trim());
      formDataToSend.append('brand', formData.brand.trim());
      formDataToSend.append('year_of_manufacture', formData.year_of_manufacture);
      formDataToSend.append('color', formData.color.trim());
      formDataToSend.append('current_mileage', formData.current_mileage);
      formDataToSend.append('fuel_level', formData.fuel_level);
      formDataToSend.append('oil_level', formData.oil_level);
      formDataToSend.append('tire_status', formData.tire_status);
      formDataToSend.append('body_condition', formData.body_condition);
      formDataToSend.append('engine_status', formData.engine_status);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('fuel_type', formData.fuelType);
      formDataToSend.append('location', formData.location.trim());
      if (formData.last_maintenance_date) {
        formDataToSend.append('last_maintenance_date', formData.last_maintenance_date);
      }
      if (formData.inspection_due_date) {
        formDataToSend.append('inspection_due_date', formData.inspection_due_date);
      }
      if (formData.photo && formData.photo.startsWith('data:image')) {
        const response = await fetch(formData.photo);
        const blob = await response.blob();
        formDataToSend.append('photo', blob, 'vehicle.jpg');
      }

      const response = await VeYooAxios.put(
        `/material/vehicles/update-vehicle/${formData.id}/`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setIsLoading(false);
      setMessage(response.data.message || 'Véhicule mis à jour avec succès');
      setIsSuccess(true);
      setShowMessage(true);

      const vehicleData = {
        ...formData,
        material_id: formData.material_id,
        id: formData.id || response.data.vehicle_id,
        type: 'vehicle',
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      setTimeout(() => {
        onSubmit(vehicleData);
        setShowMessage(false);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setMessage(
        error.response?.data.message || 'Erreur lors de la mise à jour du véhicule'
      );
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      license_plate: '',
      model: '',
      brand: '',
      year_of_manufacture: new Date().getFullYear(),
      color: '',
      current_mileage: 0,
      fuel_level: 100,
      oil_level: 100,
      tire_status: 'new',
      body_condition: 'good',
      engine_status: 'good',
      status: 'good',
      fuelType: 'Diesel',
      location: '',
      photo: '',
      last_maintenance_date: '',
      inspection_due_date: '',
      notes: '',
      material_id: null,
    });
    setErrors({});
    setMessage('');
    setIsSuccess(false);
    setShowMessage(false);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes('_level') || name.includes('mileage') || name.includes('year')
          ? parseInt(value) || 0
          : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && <Message isSuccess={isSuccess} message={message} />}
      {isLoading && <Loading loading_txt={'Mise à jour du véhicule en cours...'} />}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier le véhicule</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="h-4 w-4" />
                  <span>Photo du véhicule</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Véhicule"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                    />
                    {isUploading && (
                      <p className="mt-2 text-xs text-blue-500">Téléchargement en cours...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Informations du véhicule
                </h4>
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Nom du véhicule</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nom du véhicule"
                  />
                  {errors.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* License Plate */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Plaque d'immatriculation</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.license_plate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="XX-123-XX"
                  />
                  {errors.license_plate && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.license_plate && <p className="text-red-500 text-xs mt-1">{errors.license_plate}</p>}
              </div>

              {/* Brand */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Marque</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Toyota"
                  />
                  {errors.brand && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
              </div>

              {/* Model */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Modèle</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Corolla"
                  />
                  {errors.model && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>

              {/* Year of Manufacture */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Année de fabrication</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="year_of_manufacture"
                    value={formData.year_of_manufacture}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.year_of_manufacture ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="2023"
                  />
                  {errors.year_of_manufacture && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.year_of_manufacture && <p className="text-red-500 text-xs mt-1">{errors.year_of_manufacture}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="h-4 w-4" />
                  <span>Couleur</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bleu"
                />
              </div>

              {/* Technical Information Section */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Gauge className="h-5 w-5 mr-2" />
                  Informations techniques
                </h4>
              </div>

              {/* Current Mileage */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Gauge className="h-4 w-4" />
                  <span>Kilométrage actuel</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="current_mileage"
                    value={formData.current_mileage}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.current_mileage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="0"
                  />
                  {errors.current_mileage && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.current_mileage && <p className="text-red-500 text-xs mt-1">{errors.current_mileage}</p>}
              </div>

              {/* Fuel Level */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Fuel className="h-4 w-4" />
                  <span>Niveau de carburant (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fuel_level"
                    value={formData.fuel_level}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.fuel_level ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="100"
                    min="0"
                    max="100"
                  />
                  {errors.fuel_level && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.fuel_level && <p className="text-red-500 text-xs mt-1">{errors.fuel_level}</p>}
              </div>

              {/* Oil Level */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Fuel className="h-4 w-4" />
                  <span>Niveau d'huile (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="oil_level"
                    value={formData.oil_level}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.oil_level ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="100"
                    min="0"
                    max="100"
                  />
                  {errors.oil_level && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.oil_level && <p className="text-red-500 text-xs mt-1">{errors.oil_level}</p>}
              </div>

              {/* Status Section */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  État et maintenance
                </h4>
              </div>

              {/* Tire Status */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Wrench className="h-4 w-4" />
                  <span>État des pneus</span>
                </label>
                <select
                  name="tire_status"
                  value={formData.tire_status}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">Neufs</option>
                  <option value="worn">Usés</option>
                  <option value="flat">Crevés</option>
                </select>
              </div>

              {/* Body Condition */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Car className="h-4 w-4" />
                  <span>État de la carrosserie</span>
                </label>
                <select
                  name="body_condition"
                  value={formData.body_condition}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="good">Bon</option>
                  <option value="damaged">Endommagé</option>
                </select>
              </div>

              {/* Engine Status */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Wrench className="h-4 w-4" />
                  <span>État du moteur</span>
                </label>
                <select
                  name="engine_status"
                  value={formData.engine_status}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="good">Bon</option>
                  <option value="faulty">Défaillant</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Gauge className="h-4 w-4" />
                  <span>Statut</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="good">Bon</option>
                  <option value="under_maintenance">En maintenance</option>
                  <option value="pending_maintenance">Maintenance en attente</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Fuel className="h-4 w-4" />
                  <span>Type de carburant</span>
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Essence</option>
                  <option value="Electric">Électrique</option>
                  <option value="Hybrid">Hybride</option>
                </select>
              </div>

              {/* Location Section */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Localisation
                </h4>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Localisation</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Garage A"
                  />
                  {errors.location && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              {/* Maintenance Section */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Maintenance
                </h4>
              </div>

              {/* Last Maintenance Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Dernière maintenance</span>
                </label>
                <input
                  type="date"
                  name="last_maintenance_date"
                  value={formData.last_maintenance_date}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Inspection Due Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Prochaine inspection</span>
                </label>
                <input
                  type="date"
                  name="inspection_due_date"
                  value={formData.inspection_due_date}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Remarques supplémentaires..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmSubmit}
        message="Êtes-vous sûr de vouloir modifier ce véhicule ?"
      />
    </div>
    </>
  );
};

export default UpdateVehicleModel;