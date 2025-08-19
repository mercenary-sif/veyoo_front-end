import { useState } from 'react';
import { X, Car, Upload, Fuel, Gauge, Wrench, Calendar, Palette } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Loading } from '../../components/export';

const CreateVehicleModal = ({ isOpen, onClose, onSubmit, editVehicle}) => {
  const [formData, setFormData] = useState({
    name: editVehicle ? editVehicle.name : '',
    license_plate: editVehicle ? editVehicle.license_plate : '',
    model: editVehicle ? editVehicle.model : '',
    brand: editVehicle ? editVehicle.brand : '',
    year_of_manufacture: editVehicle ? editVehicle.year_of_manufacture : new Date().getFullYear(),
    color: editVehicle ? editVehicle.color : '',
    current_mileage: editVehicle ? editVehicle.current_mileage : 0,
    fuel_level: editVehicle ? editVehicle.fuel_level : 100,
    oil_level: editVehicle ? editVehicle.oil_level : 100,
    tire_status: editVehicle ? editVehicle.tire_status : 'new',
    body_condition: editVehicle ? editVehicle.body_condition : 'good',
    engine_status: editVehicle ? editVehicle.engine_status : 'good',
    status: editVehicle ? editVehicle.status : 'good',
    fuelType: editVehicle ? editVehicle.fuelType : 'Diesel',
    location: editVehicle ? editVehicle.location : '',
    photo: editVehicle ? editVehicle.photo : '',
    last_maintenance_date: editVehicle ? editVehicle.last_maintenance_date : '',
    inspection_due_date: editVehicle ? editVehicle.inspection_due_date : '',
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
    if (!formData.license_plate.trim()) newErrors.license_plate = "La plaque d'immatriculation est requise";
    if (!formData.model.trim()) newErrors.model = 'Le modèle est requis';
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise';
    if (!formData.color.trim()) newErrors.color = 'La couleur est requise';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (
      formData.year_of_manufacture < 1900 ||
      formData.year_of_manufacture > new Date().getFullYear() + 1
    ) {
      newErrors.year_of_manufacture = 'Année invalide';
    }
    if (formData.current_mileage < 0) newErrors.current_mileage = 'Le kilométrage ne peut pas être négatif';
    if (formData.fuel_level < 0 || formData.fuel_level > 100)
      newErrors.fuel_level = 'Le niveau de carburant doit être entre 0 et 100%';
    if (formData.oil_level < 0 || formData.oil_level > 100)
      newErrors.oil_level = "Le niveau d'huile doit être entre 0 et 100%";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
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

      const response = await VeYooAxios.post('/material/vehicles/create-new-vehicle/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsLoading(false);
      setMessage(response.data.message || 'Véhicule créé avec succès');
      setIsSuccess(true);
      setShowMessage(true);
      // Transform response to match parent component expectations
      const vehicleData = {
        material_id: response.data.material_id,
        id: response.data.vehicle_id,
        name: formData.name.trim(),
        license_plate: formData.license_plate.trim(),
        model: formData.model.trim(),
        brand: formData.brand.trim(),
        year_of_manufacture: formData.year_of_manufacture,
        color: formData.color.trim(),
        current_mileage: formData.current_mileage,
        fuel_level: formData.fuel_level,
        oil_level: formData.oil_level,
        tire_status: formData.tire_status,
        body_condition: formData.body_condition,
        engine_status: formData.engine_status,
        status: formData.status,
        fuelType: formData.fuelType,
        location: formData.location.trim(),
        photo: formData.photo,
        last_maintenance_date: formData.last_maintenance_date,
        inspection_due_date: formData.inspection_due_date,
        is_active: true,
        type: 'vehicle',
      };

      
      setTimeout(() => {
        onSubmit(vehicleData);
      }, 5000);
    } catch (error) {
      setIsLoading(false);
      if (error.response) { 
      setMessage(
        error.response?.data.message || 'Erreur lors de la création du véhicule'
      );
    }else{
       setMessage('Une erreur réseau est survenue');
       setShowMessage(true);
    }
     setIsSuccess(false);
      setShowMessage(true);
    }
     setTimeout(() => {
        setShowMessage(false);
      }, 2000);
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
                {isLoading && <Loading loading_txt={'Création du véhicule en cours... ... cela prendra quelques instants !'}/>}
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editVehicle ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule'}
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
                  <span>Photo du véhicule</span>
                </label>
                <div className="flex items-center space-x-4">
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Véhicule"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Car className="h-4 w-4" />
                    <span>Nom du véhicule *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ford Ranger XLT"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plaque d'immatriculation *
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, license_plate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.license_plate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="AB-123-CD"
                  />
                  {errors.license_plate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.license_plate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ford"
                  />
                  {errors.brand && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ranger XLT"
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model}</p>}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Année de fabrication *</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year_of_manufacture}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, year_of_manufacture: parseInt(e.target.value) }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.year_of_manufacture ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year_of_manufacture && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year_of_manufacture}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Palette className="h-4 w-4" />
                    <span>Couleur *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Blanc"
                  />
                  {errors.color && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.color}</p>}
                </div>
              </div>

              {/* Technical Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Gauge className="h-4 w-4" />
                    <span>Kilométrage actuel</span>
                  </label>
                  <input
                    type="number"
                    value={formData.current_mileage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, current_mileage: parseInt(e.target.value) }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.current_mileage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="0"
                  />
                  {errors.current_mileage && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_mileage}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Fuel className="h-4 w-4" />
                    <span>Niveau de carburant (%)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.fuel_level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fuel_level: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.fuel_level ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="0"
                    max="100"
                  />
                  {errors.fuel_level && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fuel_level}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Wrench className="h-4 w-4" />
                    <span>Niveau d'huile (%)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.oil_level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, oil_level: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.oil_level ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="0"
                    max="100"
                  />
                  {errors.oil_level && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.oil_level}</p>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de carburant
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fuelType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Essence</option>
                    <option value="Electric">Électrique</option>
                    <option value="Hybrid">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Garage Principal"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    État des pneus
                  </label>
                  <select
                    value={formData.tire_status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tire_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="new">Neufs</option>
                    <option value="worn">Usés</option>
                    <option value="flat">Crevés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    État de la carrosserie
                  </label>
                  <select
                    value={formData.body_condition}
                    onChange={(e) => setFormData((prev) => ({ ...prev, body_condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="good">Bon</option>
                    <option value="damaged">Endommagé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    État du moteur
                  </label>
                  <select
                    value={formData.engine_status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, engine_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="good">Bon</option>
                    <option value="faulty">Défaillant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut général
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
              </div>

              {/* Maintenance Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
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
                  {editVehicle ? 'Modifier' : 'Ajouter'}
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
        message={`Êtes-vous sûr de vouloir ${editVehicle ? 'modifier' : 'ajouter'} ce véhicule ?`}
      />
    </>
  );
};

export default CreateVehicleModal;