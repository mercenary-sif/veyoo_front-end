import React, { useState, useEffect } from "react";
import axios from "axios";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import DataTable from "../../components/common/DataTable";
import SupportTicketDetailsModal from "./SupportTicketDetailsModal";
import SupportReplyDetailsModal from "./SupportReplyDetailsModal";
import ReplyTicketModal from "./ReplyTicketModal";
import ReplyListModal from "./ReplyListModal";
import { Loading, ErrorGetData, Message } from "../../components/export";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  HelpCircle,
  Eye,
  Trash2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  FileText,
  HelpCircle as HelpIcon,
} from "lucide-react";

const SupportManagement = () => {
  const VeYooAxios = useVeYooAxios();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [showReplyDetailsModal, setShowReplyDetailsModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});
  const [typeCounts, setTypeCounts] = useState({});

  // Helper to coerce server responses to a safe user string
  const toUserMessage = (input, fallback = "") => {
    if (input === undefined || input === null) return fallback || "";
    if (typeof input === "string") return input;
    if (typeof input === "number" || typeof input === "boolean") return String(input);
    if (typeof input === "object") {
      if (typeof input.message === "string") return input.message;
      const findString = (v) => {
        if (!v && v !== 0) return null;
        if (typeof v === "string") return v;
        if (Array.isArray(v) && v.length > 0) {
          for (const item of v) {
            const s = findString(item);
            if (s) return s;
          }
        }
        if (typeof v === "object") {
          for (const k of Object.keys(v)) {
            const s = findString(v[k]);
            if (s) return s;
          }
        }
        return null;
      };
      const candidate = findString(input);
      if (candidate) return candidate;
      try {
        return JSON.stringify(input);
      } catch (e) {
        return String(input);
      }
    }
    return String(input);
  };

  // Fetch tickets
  useEffect(() => {
    const controller = new AbortController();
    const fetchTickets = async () => {
      setIsLoading(true);
      setError(null);
      setEmptyDataList(null);
      try {
        const response = await VeYooAxios.get("/support/tickets/", { signal: controller.signal });

        if (response.status === 200) {
          const ticketsData = Array.isArray(response.data)
            ? response.data
            : (response.data && response.data.tickets) || [];

          if (ticketsData && ticketsData.length > 0) {
            const processedTickets = ticketsData.map((t) => ({
              ...t,
              created_at: t.created_at || t.createdAt || null,
              updated_at: t.updated_at || t.updatedAt || null,
              replies: t.replies || [],
              status: t.status || "Open",
              createdBy: t.created_by || { username: "Unknown" },
            }));
            setTickets(processedTickets);
            calculateCounts(processedTickets);
            setEmptyDataList(null);
            setError(null);
          } else {
            setTickets([]);
            setEmptyDataList("Aucun ticket de support trouvé.");
            setStatusCounts({});
            setTypeCounts({});
          }
        } else if (response.status === 404) {
          setEmptyDataList(toUserMessage(response.data?.message, "Aucun ticket de support trouvé."));
          setTickets([]);
        } else {
          setError("Erreur lors de la récupération des tickets");
        }
      } catch (err) {
        const isCanceled = axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError" || err?.name === "AbortError";
        if (isCanceled) return;

        if (err?.response?.status === 404) {
          setEmptyDataList(toUserMessage(err.response?.data?.message, "Aucun ticket de support trouvé."));
          setTickets([]);
        } else {
          setError(toUserMessage(err?.response?.data?.message, "Erreur de connexion au serveur"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
    return () => controller.abort();
  }, [VeYooAxios]);

  // Calculate counts for filters
  const calculateCounts = (tickets) => {
    const statusCount = { all: tickets.length };
    const typeCount = { all: tickets.length };

    tickets.forEach((ticket) => {
      const statusKey = ticket.status?.toLowerCase().replace(" ", "-") || "unknown";
      statusCount[statusKey] = (statusCount[statusKey] || 0) + 1;

      const typeKey = ticket.type || "unknown";
      typeCount[typeKey] = (typeCount[typeKey] || 0) + 1;
    });

    setStatusCounts(statusCount);
    setTypeCounts(typeCount);
  };

  // Simplified body scroll control
  useEffect(() => {
    const isAnyModalOpen = showDetailsModal || showReplyModal || showRepliesModal || showReplyDetailsModal;
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDetailsModal, showReplyModal, showRepliesModal, showReplyDetailsModal]);

  const filteredTickets = tickets.filter((ticket) => {
    const status = ticket.status?.toLowerCase().replace(" ", "-") || "unknown";
    const statusMatch = filter === "all" || status === filter;
    const typeMatch = typeFilter === "all" || ticket.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "open":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <HelpIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "resolved":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case "in progress":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
      case "open":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
      case "closed":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    const normalizedPriority = priority?.toLowerCase();
    switch (normalizedPriority) {
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

  const getTypeColor = (type) => {
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case "complaint":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400";
      case "issue":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>,
    },
    {
      key: "title",
      label: "Titre",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {row.description?.substring(0, 60) || "Aucune description..."}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(value)}`}>
          {value === "complaint" ? "Plainte" : value === "issue" ? "Problème" : value || "Inconnu"}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priorité",
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(value)}`}>
          {value === "High" ? "Élevée" : value === "Medium" ? "Moyenne" : value === "Low" ? "Faible" : value || "Inconnue"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (value) => {
        const normalizedValue = value?.toLowerCase();
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(value)}
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
              {normalizedValue === "open"
                ? "Ouvert"
                : normalizedValue === "in progress"
                ? "En cours"
                : normalizedValue === "resolved"
                ? "Résolu"
                : normalizedValue === "closed"
                ? "Fermé"
                : value || "Inconnu"}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdBy",
      label: "Créé par",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">{value?.fullname || value?.username || "-"}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (value) => {
        try {
          return (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">
                {value ? new Date(value).toLocaleDateString("fr-FR") : "-"}
              </span>
            </div>
          );
        } catch (e) {
          return "-";
        }
      },
    },
    {
      key: "attachments",
      label: "Pièces jointes",
      sortable: false,
      render: (value) => (value && value.length > 0 ? <FileText className="h-4 w-4 text-blue-500" title="PDF disponible" /> : <span className="text-gray-400">-</span>),
    },
  ];

  const handleViewTicket = (ticket) => {
    if (!ticket || !ticket.id) {
      setMessage("Erreur : Ticket invalide");
      setMsgSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const handleDeleteTicket = (ticket) => {
    if (!ticket) return;
    setDeletingItem({ type: "ticket", item: ticket });
    setIsDeleteConfirmOpen(true);
  };

  const handleReplyTicket = (ticket) => {
    if (!ticket) return;
    setSelectedTicket(ticket);
    setShowReplyModal(true);
  };

  const handleViewReplies = (ticket) => {
    if (!ticket) return;
    setSelectedTicket(ticket);
    setShowRepliesModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleteConfirmOpen(false);
    setActionLoading(true);

    try {
      const url = deletingItem.type === "ticket" ? `/support/tickets/${deletingItem.item.id}/` : `/support/replies/${deletingItem.item.id}/`;
      const response = await VeYooAxios.delete(url);

      if (response.status === 200 || response.status === 204) {
        if (deletingItem.type === "ticket") {
          setTickets((prev) => prev.filter((t) => t.id !== deletingItem.item.id));
          setMessage("Ticket supprimé avec succès");
        } else {
          setTickets((prev) =>
            prev.map((t) =>
              t.id === selectedTicket?.id ? { ...t, replies: t.replies.filter((r) => r.id !== deletingItem.item.id) } : t
            )
          );
          setMessage("Réponse supprimée avec succès");
        }
        setMsgSuccess(true);
      } else {
        setMessage(toUserMessage(response.data?.message, "Opération terminée"));
        setMsgSuccess(false);
      }
    } catch (err) {
      const isCanceled = axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
      if (isCanceled) {
        setActionLoading(false);
        return;
      }
      setMessage(toUserMessage(err?.response?.data?.message, `Erreur lors de la suppression`));
      setMsgSuccess(false);
    } finally {
      setActionLoading(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      setDeletingItem(null);
    }
  };

  const actions = (ticket) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewTicket(ticket)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleReplyTicket(ticket)}
        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
        title="Répondre"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleViewReplies(ticket)}
        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        title="Voir les réponses"
      >
        <FileText className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteTicket(ticket)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusFilters = [
    { key: "all", label: "Tous" },
    { key: "open", label: "Ouverts" },
    { key: "resolved", label: "Résolus" }
  ];

  const typeFilters = [
    { key: "all", label: "Tous types" },
    { key: "complaint", label: "Plaintes" },
    { key: "issue", label: "Problèmes" },
  ];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt="Chargement des tickets..." />
      ) : error ? (
        <ErrorGetData error={toUserMessage(error)} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du support</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les plaintes et problèmes signalés par les utilisateurs</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tickets.length}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ouverts</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.open || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résolus</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.resolved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1">
                  <nav className="flex space-x-4 px-4 overflow-x-auto">
                    {statusFilters.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                          filter === tab.key
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {tab.label} ({statusCounts[tab.key] || 0})
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-4 px-4 overflow-x-auto">
                    {typeFilters.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setTypeFilter(tab.key)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                          typeFilter === tab.key
                            ? "border-orange-500 text-orange-600 dark:text-orange-400"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {tab.label} ({typeCounts[tab.key] || 0})
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
            {emptyDataList ? (
              <ErrorGetData error={toUserMessage(emptyDataList)} />
            ) : (
              <div className="p-6">
                <DataTable
                  data={filteredTickets}
                  columns={columns}
                  onRowClick={handleViewTicket}
                  actions={actions}
                  searchable={true}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* Modals */}
          {showDetailsModal && selectedTicket ? (
            <SupportTicketDetailsModal
              ticket={selectedTicket}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedTicket(null);
              }}
              onDeleteReply={(reply) => {
                setDeletingItem({ type: "reply", item: reply });
                setIsDeleteConfirmOpen(true);
              }}
            />
          ) : showDetailsModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <p className="text-red-600 dark:text-red-400">Erreur : Aucun ticket sélectionné</p>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : null}

          {showReplyModal && selectedTicket && (
            <ReplyTicketModal
              ticket={selectedTicket}
              onClose={() => {
                setShowReplyModal(false);
                setSelectedTicket(null);
              }}
              onSendReply={(reply) => {
                setTickets((prev) =>
                  prev.map((t) =>
                    t.id === selectedTicket.id
                      ? {
                          ...t,
                          replies: [...(t.replies || []), reply],
                          status: "In Progress",
                          updated_at: new Date().toISOString(),
                        }
                      : t
                  )
                );
                setShowReplyModal(false);
                setSelectedTicket(null);
              }}
            />
          )}

          {showRepliesModal && selectedTicket && (
            <ReplyListModal
              isOpen={showRepliesModal}
              onClose={() => {
              
                setShowRepliesModal(false);
                setSelectedTicket(null);
              }}
              ticket={selectedTicket}
              onSelectReply={(reply) => {
              
                setSelectedReply(reply);
                setShowRepliesModal(false);
                setShowReplyDetailsModal(true);
              }}
            />
          )}

          {showReplyDetailsModal && selectedReply && (
            <SupportReplyDetailsModal
              reply={selectedReply}
              onClose={() => {
      
                setShowReplyDetailsModal(false);
                setSelectedReply(null);
              }}
            />
          )}

          <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
            message={`Êtes-vous sûr de vouloir supprimer ${
              deletingItem?.type === "ticket" ? `le ticket "${deletingItem?.item?.title}"` : `cette réponse`
            } ?`}
          />

          {actionLoading && <Loading loading_txt="Opération en cours..." />}
          {showMessage && <Message isSuccess={msgSuccess} message={toUserMessage(message)} />}
        </>
      )}
    </div>
  );
};

export default SupportManagement;