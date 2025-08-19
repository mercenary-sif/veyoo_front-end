import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import CreateVehicleModal from './CreateVehicleModal';
import UpdateVehicleModel from './UpdateVehicleModel';
import VehicleDetailsModal from './VehicleDetailsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal'; // Added for delete confirmation
import { ErrorGetData, Loading, Message } from '../../components/export';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import {
  Car,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Wrench,
  Shield,
  Plus,
  Gauge,
  Trash2,
} from 'lucide-react';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [counts, setCounts] = useState({ total: 0, good: 0, under_maintenance: 0, pending_maintenance: 0 });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation
  const [vehicleToDelete, setVehicleToDelete] = useState(null); // State for vehicle to delete
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [showMessage, setShowMessage] = useState(false); // State for success/error message
  const [message, setMessage] = useState(''); // Message content
  const [isSuccess, setIsSuccess] = useState(false); // Message type

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (showDetailModal || showCreateModal || showUpdateModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailModal, showCreateModal, showUpdateModal, showDeleteModal]);

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get('/material/vehicles/list-all-vehicles/');
        if (response.status === 200) {
          const data = response.data;
          const mappedVehicles = data.vehicles.map((vehicle) => ({
            ...vehicle,
            fuelType: vehicle.fuel_type,
            photo: vehicle.photo_base64 ? `data:image/jpeg;base64,${vehicle.photo_base64}` : null,
          }));
          setVehicles(mappedVehicles);
          setCounts(data.counts);
        } else if (response.status === 404) {
          setEmptyDataList('Aucun véhicule trouvé');
          setCounts(response.data.counts);
        } else {
          setError('Erreur lors de la récupération des données');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setEmptyDataList('Aucun véhicule trouvé');
          setCounts(error.response.data.counts);
        } else if (error.request) {
          setError('Erreur de connexion au serveur');
        } else {
          setError('Une erreur est survenue');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filter === 'all') return true;
    return vehicle.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'under_maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'pending_maintenance':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'under_maintenance':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'pending_maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    }
  };

  const getFuelTypeIcon = (fuelType) => {
    switch (fuelType) {
      case 'Electric':
        return '⚡';
      case 'Hybrid':
        return '🔋';
      default:
        return '⛽';
    }
  };

  const isInspectionDue = (nextInspection) => {
    if (!nextInspection) return false;
    const today = new Date();
    const inspectionDate = new Date(nextInspection);
    const daysUntilInspection = Math.ceil((inspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilInspection <= 30;
  };

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      sortable: false,
      render: (value, row) => (
        <div className=" w-24 lg:w-80 h-18 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {value ? (
            <img src={value} alt={row.name} className="w-full h-full object-fill" />
          ) : (
            <Car className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Véhicule',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.license_plate}</p>
        </div>
      ),
    },
    {
      key: 'brand',
      label: 'Marque/Modèle',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {row.model} ({row.year_of_manufacture})
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
            {value === 'good'
              ? 'Bon'
              : value === 'under_maintenance'
              ? 'En maintenance'
              : value === 'pending_maintenance'
              ? 'Maintenance en attente'
              : value}
          </span>
        </div>
      ),
    },
    {
      key: 'current_mileage',
      label: 'Kilométrage',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Gauge className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {value.toLocaleString('fr-FR')} km
          </span>
        </div>
      ),
    },
    {
      key: 'fuelType',
      label: 'Carburant',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <span>{getFuelTypeIcon(value)}</span>
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Localisation',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'inspection_due_date',
      label: 'Prochaine inspection',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span
            className={`text-sm ${
              isInspectionDue(value)
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {value ? new Date(value).toLocaleDateString('fr-FR') : 'Non définie'}
          </span>
          {value && isInspectionDue(value) && <AlertTriangle className="h-4 w-4 text-red-500" />}
        </div>
      ),
    },
  ];

  const handleCreateVehicle = (vehicleData) => {
    setVehicles((prev) => [vehicleData, ...prev]);
    setCounts((prev) => ({
      total: prev.total + 1,
      good: vehicleData.status === 'good' ? prev.good + 1 : prev.good,
      under_maintenance:
        vehicleData.status === 'under_maintenance' ? prev.under_maintenance + 1 : prev.under_maintenance,
      pending_maintenance:
        vehicleData.status === 'pending_maintenance' ? prev.pending_maintenance + 1 : prev.pending_maintenance,
    }));
    setShowCreateModal(false);
  };

  const handleUpdateVehicle = (vehicleData) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.material_id === vehicleData.material_id
          ? { ...vehicle, ...vehicleData, updated_at: new Date().toISOString() }
          : vehicle
      )
    );
    setCounts((prev) => {
      const oldVehicle = vehicles.find((v) => v.material_id === vehicleData.material_id);
      const oldStatus = oldVehicle?.status;
      const newStatus = vehicleData.status;
      return {
        total: prev.total,
        good:
          oldStatus === 'good' && newStatus !== 'good'
            ? prev.good - 1
            : oldStatus !== 'good' && newStatus === 'good'
            ? prev.good + 1
            : prev.good,
        under_maintenance:
          oldStatus === 'under_maintenance' && newStatus !== 'under_maintenance'
            ? prev.under_maintenance - 1
            : oldStatus !== 'under_maintenance' && newStatus === 'under_maintenance'
            ? prev.under_maintenance + 1
            : prev.under_maintenance,
        pending_maintenance:
          oldStatus === 'pending_maintenance' && newStatus !== 'pending_maintenance'
            ? prev.pending_maintenance - 1
            : oldStatus !== 'pending_maintenance' && newStatus === 'pending_maintenance'
            ? prev.pending_maintenance + 1
            : prev.pending_maintenance,
      };
    });
    setShowUpdateModal(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async () => {
    setIsLoading(true);
    try {
      const response = await VeYooAxios.delete(`/materials/delete/${vehicleToDelete.material_id}/`);
      if (response.status === 200) {
         // Prefer deleted_id if backend returned it
       const deletedId = response.data?.deleted_id ?? vehicleToDelete.material_id;
          // Remove the deleted vehicle from state by matching the id field you use
      setVehicles(prev => prev.filter(v => v.material_id !== deletedId));
        setCounts((prev) => ({
          total: prev.total - 1,
          good: vehicleToDelete.status === 'good' ? prev.good - 1 : prev.good,
          under_maintenance:
            vehicleToDelete.status === 'under_maintenance' ? prev.under_maintenance - 1 : prev.under_maintenance,
          pending_maintenance:
            vehicleToDelete.status === 'pending_maintenance' ? prev.pending_maintenance - 1 : prev.pending_maintenance,
        }));
        setMessage(response.data.message || 'Véhicule supprimé avec succès');
        setIsSuccess(true);
       
      
      } else {
        setMessage('Erreur lors de la suppression du véhicule');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage(error.response?.data.message || 'Une erreur est survenue lors de la suppression');
      if (error.response) { 
      setMessage(
        error.response?.data.message || 'Une erreur est survenue lors de la suppression'
      );
    }else{
       setMessage('Une erreur réseau est survenue');
    }
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  const handleEditVehicleClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowUpdateModal(true);
  };

  const handleDeleteVehicleClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDetailModalEdit = () => {
    setShowDetailModal(false);
    setEditingVehicle(selectedVehicle);
    setShowUpdateModal(true);
  };

  const actions = (vehicle) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewVehicle(vehicle)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEditVehicleClick(vehicle)}
        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteVehicleClick(vehicle)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer le véhicule"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusCounts = {
    all: counts.total,
    good: counts.good,
    under_maintenance: counts.under_maintenance,
    pending_maintenance: counts.pending_maintenance,
  };

  const inspectionsDue = vehicles.filter((v) => v.inspection_due_date && isInspectionDue(v.inspection_due_date)).length;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={'Chargement des véhicules...'} />
      ) : error ? (
        <div className="text-center py-8 flex flex-col justify-center h-[85vh]">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <>
          {showMessage && <Message isSuccess={isSuccess} message={message} />}
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des véhicules
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez la flotte de véhicules et suivez leur état
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un véhicule</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.all}</p>
                </div>
                <Car className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En bon état</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{statusCounts.good}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En maintenance</p>
                  <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{statusCounts.under_maintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance en attente</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{statusCounts.pending_maintenance}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inspections dues</p>
                  <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{inspectionsDue}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="grid grid-cols-2 gap-4 md:flex md:flex-row space-x-8 px-6 overflow-x-auto">
                {[
                  { key: 'all', label: 'Tous', count: statusCounts.all },
                  { key: 'good', label: 'En bon état', count: statusCounts.good },
                  { key: 'under_maintenance', label: 'En maintenance', count: statusCounts.under_maintenance },
                  {
                    key: 'pending_maintenance',
                    label: 'Maintenance en attente',
                    count: statusCounts.pending_maintenance,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
            {emptyDataList ? (
              <ErrorGetData error={emptyDataList} />
            ) : (
              <div className="p-6">
                <DataTable
                  data={filteredVehicles}
                  columns={columns}
                  onRowClick={handleViewVehicle}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* Create Vehicle Modal */}
          <CreateVehicleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateVehicle}
          />

          {/* Update Vehicle Modal */}
          <UpdateVehicleModel
            isOpen={showUpdateModal}
            onClose={() => {
              setShowUpdateModal(false);
              setEditingVehicle(null);
            }}
            onSubmit={handleUpdateVehicle}
            editVehicle={editingVehicle}
          />

          {/* Vehicle Detail Modal */}
          <VehicleDetailsModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            vehicle={selectedVehicle}
            onEdit={handleDetailModalEdit}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setVehicleToDelete(null);
            }}
            onConfirm={handleDeleteVehicle}
            message={`Êtes-vous sûr de vouloir supprimer le véhicule ${vehicleToDelete?.name || ''} ?`}
          />
        </>
      )}
    </div>
  );
};

export default VehicleManagement;