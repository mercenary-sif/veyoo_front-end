// src/pages/AssetManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import CreateToolModal from './CreateToolModal';
import UpdateAssetModal from './UpdateAssetModal';
import ToolReservationsModal from './ToolReservationsModal';
import AssetDetails from './AssetDetails';
import { mockReservations } from '../../containers/data/mockData';
import { ErrorGetData, Loading, Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Plus,
  Package,
  Users,
  Shield,
  Trash2,
} from 'lucide-react';

const AssetManagement = () => {
  const [tools, setTools] = useState([]);
  const [summary, setSummary] = useState({ total_tools: 0, good: 0, under_maintenance: 0, pending_maintenance: 0 });
  const [selectedTool, setSelectedTool] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [emptyDataList, setEmptyDataList] = useState(null);

  // Delete flow states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTool, setDeletingTool] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (showDetailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailModal]);

  useEffect(() => {
  const controller = new AbortController();

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await VeYooAxios.get('/material/tools/list-all-tool/', {
        // axios supports signal in recent versions
        signal: controller.signal,
      });

      if (response.status === 200) {
        const data = response.data;
        const mappedTools = (data.tools || []).map(tool => ({
          ...tool,
          photo: tool.photo_base64 ? `data:image/jpeg;base64,${tool.photo_base64}` : null
        }));
        setTools(mappedTools);
        setSummary(data.summary || { total_tools: mappedTools.length, good: 0, under_maintenance: 0, pending_maintenance: 0 });
        setError(null);
        setEmptyDataList(null);
      } else if (response.status === 404) {
        setEmptyDataList("Aucun outil trouvé");
        setSummary(response.data?.summary || { total_tools: 0, good: 0, under_maintenance: 0, pending_maintenance: 0 });
      } else {
        setError("Erreur lors de la récupération des données");
      }
    } catch (err) {
      // request cancelled (component unmounted)
      if (axios.isCancel?.(err) || err.name === 'CanceledError') {
        return;
      }

      if (err.response && err.response.status === 404) {
        setEmptyDataList("Aucun outil trouvé");
        setSummary(err.response.data?.summary || { total_tools: 0, good: 0, under_maintenance: 0, pending_maintenance: 0 });
      } else if (err.request) {
        setError('Erreur de connexion au serveur');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchTools();

  return () => {
    // abort axios request if component unmounts
    try { controller.abort(); } catch (e) {}
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const filteredTools = tools.filter(tool => {
    if (filter === 'all') return true;
    return tool.status === filter;
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

  const isInspectionDue = (nextInspection) => {
    if (!nextInspection) return false;
    const today = new Date();
    const inspectionDate = new Date(nextInspection);
    const daysUntilInspection = Math.ceil((inspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilInspection <= 30;
  };

  const getToolReservations = (toolId) => {
    return mockReservations.filter(reservation => 
      reservation.materialId === toolId && reservation.materialType === 'tool'
    );
  };

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      sortable: false,
      render: (value, row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {value ? (
            <img 
              src={value} 
              alt={row.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Wrench className="h-6 w-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Outil',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.category}</p>
        </div>
      )
    },
    {
      key: 'manufacturer',
      label: 'Fabricant',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.serial_number}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
            {value === 'good' ? 'Bon' :
             value === 'under_maintenance' ? 'En maintenance' :
             value === 'pending_maintenance' ? 'Maintenance en attente' : value}
          </span>
        </div>
      )
    },
    {
      key: 'inspection_due_date',
      label: 'Prochaine inspection',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={`text-sm ${
            isInspectionDue(value) 
              ? 'text-red-600 dark:text-red-400 font-medium' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {value ? new Date(value).toLocaleDateString('fr-FR') : 'Non définie'}
          </span>
          {value && isInspectionDue(value) && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      )
    },
    {
      key: 'reservations',
      label: 'Réservations',
      sortable: false,
      render: (value, row) => {
        const reservations = getToolReservations(row.id);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTool(row);
              setShowReservationsModal(true);
            }}
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm">{reservations.length}</span>
          </button>
        );
      }
    }
  ];

  // Called when creation modal calls onSubmit(toolData)
  const handleCreateTool = (toolData) => {
    // Build with unique temporary id if not provided
    const newId = toolData.id || (tools.length ? Math.max(...tools.map(t => t.id)) + 1 : Date.now());
    const newTool = {
      ...toolData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTools(prev => [newTool, ...prev]);
    // update summary locally
    setSummary(prev => ({
      ...prev,
      total_tools: (prev.total_tools || 0) + 1,
      [newTool.status === 'good' ? 'good' : newTool.status === 'under_maintenance' ? 'under_maintenance' : 'pending_maintenance']:
        (prev[newTool.status] || prev.pending_maintenance || 0) + 1
    }));
    setShowCreateModal(false);
    setEditingTool(null);
  };

  // Called when UpdateAssetModal reports success
  const handleApplyUpdate = (updatedToolFromModal, previousTool) => {
    // update tools list
    setTools(prev => prev.map(t => t.id === previousTool.id ? { ...t, ...updatedToolFromModal } : t));
    // adjust summary if status changed
    if (previousTool.status !== updatedToolFromModal.status) {
      setSummary(prev => {
        const copy = { ...prev };
        // decrement old
        if (previousTool.status === 'good') copy.good = Math.max(0, (copy.good || 0) - 1);
        else if (previousTool.status === 'under_maintenance') copy.under_maintenance = Math.max(0, (copy.under_maintenance || 0) - 1);
        else copy.pending_maintenance = Math.max(0, (copy.pending_maintenance || 0) - 1);

        // increment new
        if (updatedToolFromModal.status === 'good') copy.good = (copy.good || 0) + 1;
        else if (updatedToolFromModal.status === 'under_maintenance') copy.under_maintenance = (copy.under_maintenance || 0) + 1;
        else copy.pending_maintenance = (copy.pending_maintenance || 0) + 1;

        return copy;
      });
    }
    setShowUpdateModal(false);
    setEditingTool(null);
  };

  const handleViewTool = (tool) => {
    setSelectedTool(tool);
    setShowDetailModal(true);
  };

  const handleEditToolClick = (tool) => {
    setEditingTool(tool);
    setShowUpdateModal(true);
  };

  const requestDeleteTool = (tool) => {
    setDeletingTool(tool);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTool) return;
    setIsDeleteConfirmOpen(false);
    setActionLoading(true);

    try {
      const response = await VeYooAxios.delete(`/materials/delete/${deletingTool.material_id}/`);
      setMessage(response.data?.message || `${deletingTool.name} supprimé.`);
      setMsgSuccess(true);
      setShowMessage(true);

      // remove from list
      setTools(prev => prev.filter(t => t.id !== deletingTool.id));
      // update summary counts locally
      setSummary(prev => {
        const copy = { ...prev };
        copy.total_tools = Math.max(0, (copy.total_tools || 1) - 1);
        if (deletingTool.status === 'good') copy.good = Math.max(0, (copy.good || 0) - 1);
        else if (deletingTool.status === 'under_maintenance') copy.under_maintenance = Math.max(0, (copy.under_maintenance || 0) - 1);
        else copy.pending_maintenance = Math.max(0, (copy.pending_maintenance || 0) - 1);
        return copy;
      });
      setDeletingTool(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la suppression');
      setMsgSuccess(false);
      setShowMessage(true);
    } finally {
      setActionLoading(false);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  const actions = (tool) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewTool(tool)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEditToolClick(tool)}
        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTool(tool);
          setShowReservationsModal(true);
        }}
        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
        title="Voir les réservations"
      >
        <Users className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          requestDeleteTool(tool);
        }}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer l'actif"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusCounts = {
    all: summary.total_tools,
    good: summary.good,
    under_maintenance: summary.under_maintenance,
    pending_maintenance: summary.pending_maintenance
  };

  const inspectionsDue = tools.filter(t => t.inspection_due_date && isInspectionDue(t.inspection_due_date)).length;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={'Chargement des outils...'}/>
      ) : error ? (
        <ErrorGetData error={error}/>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des actifs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez les outils et équipements de l'entreprise
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setEditingTool(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un outil</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.all}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
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
                  { key: 'pending_maintenance', label: 'Maintenance en attente', count: statusCounts.pending_maintenance }
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
             {
              emptyDataList ?
              ( <ErrorGetData error={emptyDataList} />)
              :
              <>
                {/* Tools Table */}
              <div className="p-6">
                <DataTable
                  data={filteredTools}
                  columns={columns}
                  onRowClick={handleViewTool}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
            </div>
              </>
             }
            
          </div>

          {/* Create Tool Modal */}
          {showCreateModal && (
            <CreateToolModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateTool}
              editTool={null}
            />
          )}

          {/* Update Tool Modal */}
          {showUpdateModal && editingTool && (
            <UpdateAssetModal
              isOpen={showUpdateModal}
              onClose={() => { setShowUpdateModal(false); setEditingTool(null); }}
              editTool={editingTool}
              onSuccess={(updatedTool) => handleApplyUpdate(updatedTool, editingTool)}
            />
          )}

          {/* Tool Reservations Modal */}
        {showReservationsModal && selectedTool && (
          <ToolReservationsModal
            isOpen={showReservationsModal}
            onClose={() => setShowReservationsModal(false)}
            tool={selectedTool}
          />
        )}

          {/* Tool Detail Modal */}
          {showDetailModal && selectedTool && (
            <AssetDetails
              tool={selectedTool}
              onClose={() => setShowDetailModal(false)}
              onEdit={() => {
                setShowDetailModal(false);
                handleEditToolClick(selectedTool);
              }}
              onViewReservations={() => {
                setShowDetailModal(false);
                setShowReservationsModal(true);
              }}
              reservationCount={getToolReservations(selectedTool.id).length}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              isInspectionDue={isInspectionDue}
            />
          )}

          {/* Delete confirmation */}
          <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
            message={`Êtes-vous sûr de vouloir supprimer l'actif '${deletingTool?.name || ''}' ?`}
          />

          {/* Action loading & messages */}
          {actionLoading && <Loading loading_txt={'Opération en cours...'} />}
          {showMessage && <Message isSuccess={msgSuccess} message={message} isModal={false} />}

        </>
      )}
    </div>
  );
};

export default AssetManagement;
