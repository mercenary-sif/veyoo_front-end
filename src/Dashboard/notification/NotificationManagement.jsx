// src/pages/NotificationManagement.jsx
import { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import NotificationDetailsModal from './NotificationDetailsModal';
import { 
  Bell, 
  Eye, 
  Trash,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  User,
  X,
  Trash2
} from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, ErrorGetData, Message } from '../../components/export';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    read: 0,
    unread: 0,
  });

  // confirmation modal states (NEW)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const axiosInstance = useVeYooAxios();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/notifications/my/');
        if (response.status === 200) {
          const data = response.data;
          setNotifications(data.notifications || []);
          setSummary({
            total: data.count || (data.notifications || []).length,
            read: data.counts?.read || 0,
            unread: data.counts?.unread || 0,
          });
          setEmptyDataList(null);
        } else {
          setError('Erreur lors de la récupération des notifications');
        }
      } catch (err) {
        if (err.response?.status === 400) {
          setEmptyDataList(err.response?.data?.message || 'Aucune notification trouvée.');
          setNotifications([]);
          setSummary({ total: 0, read: 0, unread: 0 });
        } else {
          setError(err.response?.data?.message || 'Une erreur est survenue');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (showDetailsModal || showConfirmDelete || showConfirmDeleteAll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailsModal, showConfirmDelete, showConfirmDeleteAll]);

  const recalcSummaryFromList = (list = []) => {
    const total = list.length;
    const read = list.filter(n => n.isRead || (n.notification_status && n.notification_status === 'read')).length;
    const unread = total - read;
    setSummary({ total, read, unread });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !(notification.isRead || notification.notification_status === 'read');
    if (filter === 'read') return (notification.isRead || notification.notification_status === 'read');
    return true;
  });

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'Alert':
        return <AlertTriangle className={`h-4 w-4 ${priority === 'High' ? 'text-red-500' : 'text-orange-500'}`} />;
      case 'Reservation':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'System':
        return <Info className="h-4 w-4 text-gray-500" />;
      case 'Announcement':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Il y a moins d'une heure";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  const columns = [
    {
      key: 'title',
      label: 'Notification',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(row.type, row.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className={`text-sm font-medium ${
                !(row.isRead || row.notification_status === 'read') 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {value}
              </p>
              {!(row.isRead || row.notification_status === 'read') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {row.message || row.content || ''}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: () => (
        <span className="text-sm text-gray-900 dark:text-white">
          Système
        </span>
      )
    },
    {
      key: 'recipient',
      label: 'Destinataire',
      sortable: false,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            Utilisateur: {value}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <p className="text-gray-900 dark:text-white">
              {new Date(value).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {formatTime(value)}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'isRead',
      label: 'Statut',
      sortable: true,
      render: (_, row) => {
        const isRead = row.isRead || row.notification_status === 'read';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            isRead 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
          }`}>
            {isRead ? 'Lue' : 'Non lue'}
          </span>
        );
      }
    }
  ];

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  // OPEN confirm modal for single delete (NEW)
  const handleDeleteNotification = (notification) => {
    if (!notification || !notification.id) return;
    setNotificationToDelete(notification);
    setShowConfirmDelete(true);
  };

  // Confirm single delete (NEW)
  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/notifications/my/${notificationToDelete.id}/`);
      if (response.status === 200) {
        // remove locally
        setNotifications(prev => {
          const next = prev.filter(n => String(n.id) !== String(notificationToDelete.id));
          recalcSummaryFromList(next);
          return next;
        });

        // update summary from server counts if provided
        if (response.data?.counts) {
          setSummary({
            total: response.data.counts.total ?? Math.max(0, summary.total - 1),
            read: response.data.counts.read ?? summary.read,
            unread: response.data.counts.unread ?? Math.max(0, summary.unread - 1)
          });
        }

        setMessage(response.data?.message || 'Notification supprimée avec succès');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      } else {
        setMessage('Erreur lors de la suppression de la notification');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la suppression de la notification');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
      setShowConfirmDelete(false);
      setNotificationToDelete(null);
    }
  };

  // OPEN confirm modal for delete all (NEW)
  const handleDeleteAllNotifications = () => {
    if (!notifications.length) {
      setMessage('Aucune notification à supprimer.');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }
    setShowConfirmDeleteAll(true);
  };

  // Confirm delete all (NEW)
  const confirmDeleteAll = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/notifications/my/?all=true`);
      if (response.status === 200) {
        setNotifications([]);
        setSummary({ total: 0, read: 0, unread: 0 });
        setMessage(response.data?.message || 'Toutes les notifications ont été supprimées');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      } else {
        setMessage('Erreur lors de la suppression des notifications');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la suppression des notifications');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
      setShowConfirmDeleteAll(false);
    }
  };

  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === updatedNotification.id ? updatedNotification : n);
      recalcSummaryFromList(next);
      return next;
    });
  };

  const actions = (notification) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewNotification(notification)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
       <button
        onClick={() => handleDeleteNotification(notification)}
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
        <Loading loading_txt={'Chargement des notifications...'} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          {showMessage && <Message isSuccess={isSuccess} message={message} />}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez les notifications pour les utilisateurs
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Delete all button: red bg + icon + text (UPDATED) */}
             {!emptyDataList && <button
                onClick={handleDeleteAllNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                title="Supprimer toutes les notifications"
              >
                <Trash className="h-4 w-4" />
                <span>Supprimer tout</span>
              </button>}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non lues</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{summary.unread}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lues</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{summary.read}</p>
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
                  { key: 'all', label: 'Toutes', count: summary.total },
                  { key: 'unread', label: 'Non lues', count: summary.unread },
                  { key: 'read', label: 'Lues', count: summary.read }
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

            {/* Notifications Table */}
            {emptyDataList ? (
              <ErrorGetData error={emptyDataList} />
            ) : (
              <div className="p-6">
                <DataTable
                  data={filteredNotifications}
                  columns={columns}
                  onRowClick={handleViewNotification}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* Notification Details Modal */}
          {showDetailsModal && selectedNotification && (
            <NotificationDetailsModal
              notification={selectedNotification}
              onClose={() => setShowDetailsModal(false)}
              onUpdate={handleNotificationUpdate}
            />
          )}

          {/* Confirm Delete Single Modal (NEW) */}
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
                        Êtes-vous sûr de vouloir supprimer la notification{' '}
                        <strong>{notificationToDelete?.title || notificationToDelete?.id}</strong> ?
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

          {/* Confirm Delete All Modal (NEW) */}
          {showConfirmDeleteAll && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none">
                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 rounded-t">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Confirmer la suppression de toutes les notifications
                      </h3>
                      <button
                        onClick={() => setShowConfirmDeleteAll(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="relative p-6 flex-auto">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cette action supprimera définitivement toutes vos notifications. Voulez-vous continuer ?
                      </p>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 dark:border-gray-700 rounded-b space-x-3">
                      <button
                        onClick={() => setShowConfirmDeleteAll(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={isLoading}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={confirmDeleteAll}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Suppression...' : 'Supprimer tout'}
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

export default NotificationManagement;
