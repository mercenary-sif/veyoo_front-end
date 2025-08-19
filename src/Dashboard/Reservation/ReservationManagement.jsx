import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import CreateReservationModal from './CreateReservation';
import UpdateReservationModal from './UpdateReservation';
import { Loading, ErrorGetData, Message } from '../../components/export';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  X,
  ClipboardCheck,
} from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import ReservationDetailModal from './ReservationDetail';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    completed: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const axiosInstance = useVeYooAxios();

  // Map API status to component status
  const mapStatus = (apiStatus) => {
    switch ((apiStatus || '').toLowerCase()) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      default:
        return apiStatus || 'Unknown';
    }
  };

  // Combine date and time into ISO string
  const combineDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toISOString();
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch reservations
        const reservationsResponse = await axiosInstance.get('/reservations/reservation-all-list/');
        if (reservationsResponse.status === 200) {
          const data = reservationsResponse.data;
          console.log('API response:', data); // Debug log
          const mappedReservations = (data.reservations || []).map(res => ({
            id: res.id,
            assetName: res.material.name,
            assetId: res.material.id,
            assetType: res.material.type,
            userName: res.created_by?.username || '',
            userId: res.created_by?.id || null,
            assignedTo: res.assigned_to?.username || '',
            assignedToId: res.assigned_to?.id || null,
            startDate: combineDateTime(res.start_date, res.start_time),
            endDate: combineDateTime(res.end_date, res.end_time),
            purpose: res.purpose,
            notes: res.notes,
            reservationType: res.reservation_type,
            status: mapStatus(res.status),
            createdAt: res.created_at,
            updatedAt: res.updated_at,
          }));
          setReservations(mappedReservations);
          setSummary({
            total: data.total || mappedReservations.length,
            pending: data.pending || 0,
            accepted: data.accepted || 0,
            declined: data.declined || 0,
            completed: data.completed || 0,
          });
          setEmptyDataList(null);
        } else {
          setError('Erreur lors de la récupération des réservations');
        }

        // Fetch users
        const usersResponse = await axiosInstance.get('/auth/user-list/');
        if (usersResponse.status === 200) {
          setUsers(usersResponse.data.users || []);
        }

        // Fetch assets
        const assetsResponse = await axiosInstance.get('/materials/all/');
        if (assetsResponse.status === 200) {
          setAssets([...(assetsResponse.data.vehicles || []), ...(assetsResponse.data.tools || [])]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setEmptyDataList(err.response?.data?.message || 'Aucune réservation trouvée.');
          setReservations([]);
          setSummary({ total: 0, pending: 0, accepted: 0, declined: 0, completed: 0 });
        } else {
          setError(err.response?.data?.message || 'Une erreur est survenue');
        }
        // Fetch users and assets even if reservations fail
        try {
          const usersResponse = await axiosInstance.get('/auth/user-list/');
          if (usersResponse.status === 200) {
            setUsers(usersResponse.data.users || []);
          }
          const assetsResponse = await axiosInstance.get('/materials/all/');
          if (assetsResponse.status === 200) {
            setAssets([...(assetsResponse.data.vehicles || []), ...(assetsResponse.data.tools || [])]);
          }
        } catch (innerErr) {
          
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disable body scroll when modals are open
  useEffect(() => {
    if (showCreateModal || isUpdateModalOpen || selectedReservation || showConfirmDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCreateModal, isUpdateModalOpen, selectedReservation, showConfirmDelete]);

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return (reservation.status || '').toLowerCase() === filter.toLowerCase();
  });

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <ClipboardCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'declined':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'assetName',
      label: 'Actif',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {row.assetId} ({row.assetType})
          </p>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'Créé par',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {String(value || '').split(' ').map((n) => n[0] || '').join('')}
            </span>
          </div>
          <span className="text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigné à',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {String(value || '').split(' ').map((n) => n[0] || '').join('')}
            </span>
          </div>
          <span className="text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Période',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            Du {new Date(value).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Au {new Date(row.endDate).toLocaleDateString('fr-FR')}
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
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}
          >
            {value.toLowerCase() === 'pending'
              ? 'En attente'
              : value.toLowerCase() === 'accepted'
              ? 'Approuvée'
              : value.toLowerCase() === 'declined'
              ? 'Refusée'
              : value.toLowerCase() === 'completed'
              ? 'Terminée'
              : value || 'Inconnu'}
          </span>
        </div>
      ),
    },
    {
      key: 'purpose',
      label: 'Objet',
      sortable: false,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créée le',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const handleCreateReservation = (newReservation) => {
    setReservations((prev) => [newReservation, ...prev]);
    setSummary((prev) => ({
      ...prev,
      total: (prev.total || 0) + 1,
      pending: (prev.pending || 0) + 1,
    }));
    setShowCreateModal(false);
    setIsSuccess(true);
    setMessage('Réservation créée avec succès');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  const handleUpdateReservation = (updatedReservation) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === updatedReservation.id ? updatedReservation : r))
    );
    setIsUpdateModalOpen(false);
    setEditingReservation(null);
    setIsSuccess(true);
    setMessage('Réservation mise à jour avec succès');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };


 

  const handleDeleteReservation = async (reservation) => {
    setReservationToDelete(reservation);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/reservations/reservation-delete/${reservationToDelete.id}/`);
      if (response.status === 200) {
        const deletedStatus = (reservationToDelete.status || '').toLowerCase();
        setReservations((prev) => prev.filter((r) => r.id !== reservationToDelete.id));
        setSummary((prev) => ({
          ...prev,
          total: Math.max(0, (prev.total || 0) - 1),
          [deletedStatus]: Math.max(0, (prev[deletedStatus] || 0) - 1),
        }));
        setShowConfirmDelete(false);
        setReservationToDelete(null);
        setIsSuccess(true);
        setMessage(response.data.message || 'Réservation supprimée avec succès');
        setShowMessage(true);
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.message || 'Erreur lors de la suppression de la réservation');
      setShowMessage(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  const actions = (reservation) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setSelectedReservation(reservation)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setEditingReservation(reservation);
          setIsUpdateModalOpen(true);
        }}
        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </button>
     
      <button
        onClick={() => handleDeleteReservation(reservation)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={'Chargement des réservations...'} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          {showMessage && <Message isSuccess={isSuccess} message={message} />}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des réservations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez les réservations d'actifs et d'équipements
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle réservation</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{summary.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvées</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{summary.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Refusées</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{summary.declined}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{summary.completed}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="grid grid-cols-2 gap-4 md:flex md:flex-row space-x-8 px-6 overflow-x-auto">
                {[
                  { key: 'all', label: 'Toutes', count: summary.total },
                  { key: 'pending', label: 'En attente', count: summary.pending },
                  { key: 'accepted', label: 'Approuvées', count: summary.accepted },
                  { key: 'declined', label: 'Refusées', count: summary.declined },
                  { key: 'completed', label: 'Terminées', count: summary.completed },
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
                  data={filteredReservations}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* Modals */}
          {showCreateModal && (
            <CreateReservationModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateReservation}
              users={users}
              assets={assets}
              existingReservations={reservations}
            />
          )}
          {selectedReservation && (
            <ReservationDetailModal
              isOpen={!!selectedReservation}
              onClose={() => setSelectedReservation(null)}
              reservation={selectedReservation}
            />
          )}
          {isUpdateModalOpen && editingReservation && (
            <UpdateReservationModal
              isOpen={isUpdateModalOpen}
              onClose={() => {
                setIsUpdateModalOpen(false);
                setEditingReservation(null);
              }}
              onSubmit={handleUpdateReservation}
              reservation={editingReservation}
              users={users}
              assets={assets}
              existingReservations={reservations}
            />
          )}
          {showConfirmDelete && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none">
                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 rounded-t">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Confirmer la suppression
                      </h3>
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="relative p-6 flex-auto">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer la réservation{' '}
                        <strong>{reservationToDelete?.id}</strong> pour{' '}
                        <strong>{reservationToDelete?.assetName}</strong>?
                      </p>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 dark:border-gray-700 rounded-b space-x-3">
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={isLoading}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReservationManagement;