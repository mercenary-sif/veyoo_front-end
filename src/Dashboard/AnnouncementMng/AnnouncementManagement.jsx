import React, { useState, useEffect } from "react";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import DataTable from "../../components/common/DataTable";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import UpdateAnnouncementModal from "./UpdateAnnouncementModal";
import AnnouncementDetailsModal from "./AnnouncementDetailsModal";
import { Loading, ErrorGetData, Message } from "../../components/export";
import ConfirmationModal from "../../components/common/ConfirmationModal";

import { 
  MessageSquare, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  
  // Delete flow states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [summary, setSummary] = useState({ total: 0, active: 0, expired: 0 });
  const VeYooAxios = useVeYooAxios();

  // Fetch announcements
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/advertisements/advertisements-list-all/", {
          signal: controller.signal,
        });

        if (response.status === 200) {
          const res = response.data;
          if (res.advertisement && res.advertisement.length > 0) {
            const mappedAnnouncements = res.advertisement.map((ad) => ({
              id: ad.id,
              dbId: ad.id,
              title: ad.title,
              content: ad.content,
              priority: ad.priority,
              startDate: ad.start_date,
              endDate: ad.end_date,
              createdBy: ad.created_by,
              updatedBy: ad.updated_by,
              cover: ad.cover_base64 ? `data:image/jpeg;base64,${ad.cover_base64}` : null,
              pdfUrl: ad.pdf_base64 ? `data:application/pdf;base64,${ad.pdf_base64}` : null,
              targetRoles: ["All"],
              status: ad.status, // Use server-provided status (lowercase: "active", "expired")
              createdAt: new Date().toISOString(),
            }));
            setAnnouncements(mappedAnnouncements);
            setSummary({ total: res.total || 0, active: res.active || 0, expired: res.expired || 0 });
            setError(null);
            setEmptyDataList(null);
          } else {
            setAnnouncements([]);
            setEmptyDataList(res.message || "Aucune annonce trouvée.");
          }
        } else {
          setError("Erreur lors de la récupération des annonces");
        }
      } catch (err) {
        if (err.name === "CanceledError") {
          return;
        }

        if (err.response && err.response.status === 404) {
          setEmptyDataList("Aucune annonce trouvée.");
          setAnnouncements([]);
        } else if (err.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      try {
        controller.abort();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disable body scroll when modals are open
  useEffect(() => {
    if (showCreateModal || showUpdateModal || showDetailsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCreateModal, showUpdateModal, showDetailsModal]);

  // Filter announcements with case-insensitive comparison
  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === "all") return true;
    return (announcement.status || '').toLowerCase() === filter.toLowerCase();
  });

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case "expired":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case "high":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
      case "low":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const columns = [
    {
      key: "cover",
      label: "Couverture",
      sortable: false,
      render: (value, row) => (
        <div className="w-24 lg:w-80 h-18 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt={row?.title || ''}
              className="w-full h-full object-cover"
            />
          ) : (
            <MessageSquare className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Annonce",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {(row?.content || '').substring(0, 60)}...
          </p>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priorité",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(value)}`}
        >
          {value.toLowerCase() === "high"
            ? "Élevée"
            : value.toLowerCase() === "medium"
            ? "Moyenne"
            : value.toLowerCase() === "low"
            ? "Faible"
            : value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}
          >
            {value.toLowerCase() === "active"
              ? "Actif"
              : value.toLowerCase() === "expired"
              ? "Expirée"
              : value || '-'}
          </span>
        </div>
      ),
    },
    {
      key: "targetRoles",
      label: "Destinataires",
      sortable: false,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {(value || []).map((role) =>
              role.toLowerCase() === "admin"
                ? "Admin"
                : role.toLowerCase() === "manager"
                ? "Manager"
                : role.toLowerCase() === "inspector"
                ? "Inspecteur"
                : role
            ).join(", ")}
          </span>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Période",
      sortable: true,
      render: (value, row) => {
        const start = value ? new Date(value) : null;
        const end = row?.endDate ? new Date(row.endDate) : null;
        return (
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <p className="text-gray-900 dark:text-white">
                {start && !isNaN(start) ? start.toLocaleDateString("fr-FR") : "-"}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                au {end && !isNaN(end) ? end.toLocaleDateString("fr-FR") : "-"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "createdBy",
      label: "Créée par",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">{value || '-'}</span>
      ),
    },
    {
      key: "pdfUrl",
      label: "PDF",
      sortable: false,
      render: (value, row) => (
        value ? (
          <a 
            href={value} 
            download={`${row?.title || 'announcement'}.pdf`}
            className="flex items-center justify-center"
          >
            <FileText className="h-4 w-4 text-blue-500" title="PDF disponible" />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
  ];

  // Add announcement handler
  const handleAddAnnouncement = (newAnnouncement) => {
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setMessage('Annonce créée avec succès');
    setMsgSuccess(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  // Update announcement handler
  const handleApplyUpdate = (updatedAnnouncement) => {
    if (!updatedAnnouncement) return;
    setAnnouncements(prev =>
      prev.map(a => (a.dbId === updatedAnnouncement.dbId ? {
        ...a,
        ...updatedAnnouncement,
        // Use server-provided status directly
        status: updatedAnnouncement.status
      } : a))
    );
    setMessage('Annonce mise à jour avec succès');
    setMsgSuccess(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
    setShowUpdateModal(false);
    setEditingAnnouncement(null);
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailsModal(true);
  };

  const handleEditAnnouncementClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowUpdateModal(true);
  };

  const requestDeleteAnnouncement = (announcement) => {
    setDeletingAnnouncement(announcement);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingAnnouncement) return;
    setIsDeleteConfirmOpen(false);
    setActionLoading(true);

    try {
      const response = await VeYooAxios.delete(
        `/advertisements/advertisement-delete/${deletingAnnouncement.dbId}/`
      );
      
      if (response.status === 200) {
        setAnnouncements((prev) => 
          prev.filter((a) => a.dbId !== deletingAnnouncement.dbId)
        );
        setMessage("Annonce supprimée avec succès");
        setMsgSuccess(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de la suppression de l'annonce");
      setMsgSuccess(false);
    } finally {
      setActionLoading(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      setDeletingAnnouncement(null);
    }
  };

  const actions = (announcement) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewAnnouncement(announcement)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEditAnnouncementClick(announcement)}
        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => requestDeleteAnnouncement(announcement)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusCounts = {
    all: summary.total,
    active: summary.active,
    expired: summary.expired,
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={"Chargement des annonces..."} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des annonces
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Créez et gérez les annonces pour les utilisateurs
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une annonce</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {statusCounts.all}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actives</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {statusCounts.active}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expirées</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                    {statusCounts.expired}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */} 
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {[
                  { key: "all", label: "Toutes", count: statusCounts.all },
                  { key: "active", label: "Actives", count: statusCounts.active },
                  { key: "expired", label: "Expirées", count: statusCounts.expired },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      filter === tab.key
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
              <>
                {/* Announcements Table */}
                <div className="p-6">
                  <DataTable
                    data={filteredAnnouncements}
                    columns={columns}
                    onRowClick={handleViewAnnouncement}
                    actions={actions}
                    searchable={true}
                    pageSize={10}
                  />
                </div>
              </>
            )}
          </div>

          {/* Create Announcement Modal */}
          {showCreateModal && (
            <CreateAnnouncementModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onCreateSuccess={handleAddAnnouncement}
            />
          )}

          {/* Update Announcement Modal */}
          {showUpdateModal && editingAnnouncement && (
            <UpdateAnnouncementModal
              isOpen={showUpdateModal}
              onClose={() => { setShowUpdateModal(false); setEditingAnnouncement(null); }}
              announcement={editingAnnouncement}
              onUpdateSuccess={handleApplyUpdate}
            />
          )}

          {/* Announcement Details Modal */}
          {showDetailsModal && selectedAnnouncement && (
            <AnnouncementDetailsModal
              announcement={selectedAnnouncement}
              onClose={() => setShowDetailsModal(false)}
            />
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
            message={`Êtes-vous sûr de vouloir supprimer l'annonce "${deletingAnnouncement?.title}" ?`}
          />

          {/* Action loading & messages */}
          {actionLoading && <Loading loading_txt={'Opération en cours...'} />}
          {showMessage && <Message isSuccess={msgSuccess} message={message} isModal={false} />}
        </>
      )}
    </div>
  );
};

export default AnnouncementManagement;