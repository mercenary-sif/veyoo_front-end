import React, { useState, useEffect } from 'react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import DataTable from '../../components/common/DataTable';
import CreateMalfunctionModal from './CreateMalfunctionModal';
import MalfunctionUpdateModal from './MalfunctionUpdateModal';
import MalfunctionDetailsModal from './MalfunctionDetailsModal';
import { Loading, ErrorGetData, Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Wrench,
  Calendar,
} from 'lucide-react';

// Utility function to format photo URLs or Base64 strings for display
const formatPhotoURLs = (photos) => {
  if (!Array.isArray(photos)) return [];
  return photos
    .filter((photo) => photo && typeof photo === 'string' && photo.trim() !== '')
    .map((photo) => {
      // Check if the photo is a Base64 string
      if (photo.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(photo)) {
        // If it's a plain Base64 string, add the MIME prefix
        return photo.startsWith('data:image/') ? photo : `data:image/jpeg;base64,${photo}`;
      }
      // Assume it's a URL if not Base64
      return photo;
    });
};

const MalfunctionManagement = () => {
  const [malfunctions, setMalfunctions] = useState([]);
  const [materials, setMaterials] = useState({ vehicles: [], tools: [] });
  const [summary, setSummary] = useState({
    total_malfunctions: 0,
    Reported: 0,
    'In Progress': 0,
    Resolved: 0,
  });
  const [selectedMalfunction, setSelectedMalfunction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingMalfunction, setEditingMalfunction] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [malfunctionToDelete, setMalfunctionToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [emptyDataList, setEmptyDataList] = useState(null);

  const VeYooAxios = useVeYooAxios();

  // Fetch malfunctions and materials from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch malfunctions
        const malfunctionsResponse = await VeYooAxios.get('/material/malfunctions/all-list/');
        if (malfunctionsResponse.status === 200) {
          const data = malfunctionsResponse.data;
          const mappedMalfunctions = data.materials.flatMap((material) =>
            material.malfunctions.map((malfunction) => ({
              id: malfunction.id,
              materialName: material.name,
              materialType: material.type.toLowerCase() === 'véhicule' ? 'vehicle' : 'tool',
              materialId: material.id,
              materialStatus: material.status,
              description: malfunction.description,
              severity: malfunction.severity,
              status: malfunction.status,
              reportedBy: malfunction.reported_by,
              reportedAt: malfunction.created_at,
              notes: malfunction.notes,
              photos: formatPhotoURLs(malfunction.photos),
            }))
          );
          setMalfunctions(mappedMalfunctions);
          setSummary(data.summary);
        } else if (malfunctionsResponse.status === 404) {
          setEmptyDataList(malfunctionsResponse.data.message);
          setSummary(malfunctionsResponse.data.summary);
        } else {
          setError('Erreur lors de la récupération des dysfonctionnements');
        }

        // Fetch materials for modals
        const materialsResponse = await VeYooAxios.get('/materials/all/');
        if (materialsResponse.status === 200) {
          const { vehicles, tools } = materialsResponse.data;
          setMaterials({
            vehicles: Array.isArray(vehicles) ? vehicles : [],
            tools: Array.isArray(tools) ? tools : [],
          });
        } else {
          setError('Erreur lors de la récupération des matériels');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setEmptyDataList(err.response.data.message);
          setSummary(err.response?.data?.summary || summary);

          // Fetch materials for modals
           const materialsResponse = await VeYooAxios.get('/materials/all/');
            if (materialsResponse.status === 200) {
              const { vehicles, tools } = materialsResponse.data;
              setMaterials({
                vehicles: Array.isArray(vehicles) ? vehicles : [],
                tools: Array.isArray(tools) ? tools : [],
              });
            } else {
             setError('Erreur lors de la récupération des matériels');
            }
        } else if (err.request) {
          setError('Erreur de connexion au serveur');
        } else {
          setError('Une erreur est survenue');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disable body scroll when any modal is open
  useEffect(() => {
    if (showCreateModal || showUpdateModal || showDetailsModal || deleteConfirmationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCreateModal, showUpdateModal, showDetailsModal, deleteConfirmationOpen]);

  const filteredMalfunctions = malfunctions.filter((malfunction) => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return malfunction.status === 'In Progress';
    return malfunction.status.toLowerCase().replace(' ', '-') === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Reported':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Reported':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'High':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'materialName',
      label: 'Matériel',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {row.materialType === 'vehicle' ? (
            <Car className="h-4 w-4 text-gray-400" />
          ) : (
            <Wrench className="h-4 w-4 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.materialType === 'vehicle' ? 'Véhicule' : 'Outil'} - ID: {row.materialId}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {value}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Gravité',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(value)}`}
        >
          {value === 'Critical'
            ? 'Critique'
            : value === 'High'
            ? 'Élevée'
            : value === 'Medium'
            ? 'Moyenne'
            : value === 'Low'
            ? 'Faible'
            : value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}
          >
            {value === 'Reported'
              ? 'Signalé'
              : value === 'In Progress'
              ? 'En cours'
              : value === 'Resolved'
              ? 'Résolu'
              : value}
          </span>
        </div>
      ),
    },
    {
      key: 'reportedBy',
      label: 'Signalé par',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'reportedAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
    },
  ];

  const handleCreateMalfunction = (malfunctionData) => {
    setMalfunctions((prev) => [malfunctionData, ...prev]);
    setSummary((prev) => ({
      ...prev,
      total_malfunctions: prev.total_malfunctions + 1,
      Reported: prev.Reported + 1,
    }));
    setShowCreateModal(false);
  };

  const handleEditMalfunction = (malfunctionData) => {
    setMalfunctions((prev) =>
      prev.map((malfunction) =>
        malfunction.id === editingMalfunction.id ? malfunctionData : malfunction
      )
    );
    setShowUpdateModal(false);
    setEditingMalfunction(null);
  };

  const handleDeleteMalfunction = (malfunction) => {
    setMalfunctionToDelete(malfunction);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteConfirmationOpen(false);
    setMalfunctionToDelete(null);
    if (!malfunctionToDelete) return;
    setIsLoading(true);
   
    try {
      const response = await VeYooAxios.delete(`/material/malfunctions/delete/${malfunctionToDelete.id}/`);
      setIsLoading(false);
      
      
      showTemporaryDeleteMessage(response.data.message || 'Dysfonctionnement supprimé avec succès', true);

      setMalfunctions((prev) => prev.filter((m) => m.id !== malfunctionToDelete.id));
      setSummary((prev) => ({
        ...prev,
        total_malfunctions: prev.total_malfunctions - 1,
        [malfunctionToDelete.status]: prev[malfunctionToDelete.status] - 1,
      }));
      
       
    } catch (err) {
      setIsLoading(false);
      const errorMsg =
        err.response?.data?.message || 'Erreur lors de la suppression du dysfonctionnement';
      showTemporaryDeleteMessage(errorMsg, false);
    }
  };

  const showTemporaryDeleteMessage = (msg, success = true, duration = 2000) => {
    setDeleteMessage(msg);
    setIsDeleteSuccess(success);
    setShowDeleteMessage(true);
    setTimeout(() => setShowDeleteMessage(false), duration);
  };

  const handleViewMalfunction = (malfunction) => {
    setSelectedMalfunction(malfunction);
    setShowDetailsModal(true);
  };

  const handleEditMalfunctionClick = (malfunction) => {
    setEditingMalfunction(malfunction);
    setShowUpdateModal(true);
  };

  const actions = (malfunction) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewMalfunction(malfunction)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEditMalfunctionClick(malfunction)}
        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteMalfunction(malfunction)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusCounts = {
    all: summary.total_malfunctions,
    reported: summary.Reported,
    'in-progress': summary['In Progress'],
    resolved: summary.Resolved,
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={'Chargement des dysfonctionnements...'} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          {/* Delete Message */}
          {showDeleteMessage && <Message isSuccess={isDeleteSuccess} message={deleteMessage} />}
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des dysfonctionnements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Suivez et gérez les dysfonctionnements des matériels
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Signaler un dysfonctionnement</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.all}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Signalés</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{statusCounts.reported}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{statusCounts['in-progress']}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résolus</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{statusCounts.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {[
                  { key: 'all', label: 'Tous', count: statusCounts.all },
                  { key: 'reported', label: 'Signalés', count: statusCounts.reported },
                  { key: 'in-progress', label: 'En cours', count: statusCounts['in-progress'] },
                  { key: 'resolved', label: 'Résolus', count: statusCounts.resolved },
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
                  data={filteredMalfunctions}
                  columns={columns}
                  onRowClick={handleViewMalfunction}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* Create Malfunction Modal */}
          {showCreateModal && (
            <CreateMalfunctionModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateMalfunction}
              vehicles={materials.vehicles}
              tools={materials.tools}
            />
          )}

          {/* Update Malfunction Modal */}
          {showUpdateModal && editingMalfunction && (
            <MalfunctionUpdateModal
              isOpen={showUpdateModal}
              onClose={() => {
                setShowUpdateModal(false);
                setEditingMalfunction(null);
              }}
              onSubmit={handleEditMalfunction}
              editMalfunction={editingMalfunction}
              vehicles={materials.vehicles}
              tools={materials.tools}
            />
          )}

          {/* Malfunction Details Modal */}
          {showDetailsModal && selectedMalfunction && (
            <MalfunctionDetailsModal
              malfunction={selectedMalfunction}
              onClose={() => setShowDetailsModal(false)}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmationOpen && malfunctionToDelete && (
            <ConfirmationModal
              isOpen={deleteConfirmationOpen}
              onClose={() => setDeleteConfirmationOpen(false)}
              onConfirm={confirmDelete}
              message={`Êtes-vous sûr de vouloir supprimer le dysfonctionnement pour ${malfunctionToDelete.materialName}?`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MalfunctionManagement;
