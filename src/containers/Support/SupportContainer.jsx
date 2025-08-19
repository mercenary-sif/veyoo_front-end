import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  AlertTriangle, 
  FileText,
  Send,
  Upload,
  X,
  Calendar,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { ErrorGetData, Loading, Message } from '../../components/export';
import ModelUpdateTicketOrReply from '../../Dashboard/SupportManagement/ModelUpdateTicketOrReply';
import SupportTicketDetailsModal from '../../Dashboard/SupportManagement/SupportTicketDetailsModal';

// NEW imports
import ReplyListModal from '../../Dashboard/SupportManagement/ReplyListModal';
import SupportReplyDetailsModal from '../../Dashboard/SupportManagement/SupportReplyDetailsModal';

const UserSupportContainer = ({ user }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState('complaint');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // NEW: reply list / detail modal states
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [showReplyDetailsModal, setShowReplyDetailsModal] = useState(false);

  const fileInputRef = useRef(null);
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    setEmptyDataList(null);
    try {
      const response = await VeYooAxios.get('/support/my-tickets/');
      const tickets = response.data.tickets || [];
      setUserTickets(tickets);
      setEmptyDataList(null);
    } catch (err) {
      const resp = err?.response;
      if (resp && resp.status === 404) {
        setEmptyDataList(resp.data?.message || "Vous n'avez encore envoyé aucune demande");
        setUserTickets([]);
        setError(null);
      } else if (resp) {
        setError(resp.data?.message || 'Erreur lors de la récupération des tickets');
        setUserTickets([]);
      } else if (err.request) {
        setError('Erreur de connexion au serveur');
        setUserTickets([]);
      } else {
        setError('Une erreur est survenue');
        setUserTickets([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

 
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('type', selectedType);
      body.append('priority', formData.priority);

      formData.attachments.forEach((att) => {
        if (att.kind === 'file' && att.file instanceof File) {
          body.append('attachments', att.file, att.name || att.file.name);
        }
      });

      formData.attachments.forEach((att) => {
        if (att.kind === 'url' && att.url) {
          body.append('attachment_urls', att.url);
        }
      });

      const response = await VeYooAxios.post('/support/tickets/', body);
      if (response.status === 201) {
        setMessage('Ticket créé avec succès');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
        setFormData({ title: '', description: '', priority: 'Medium', attachments: [] });
        setErrors({});
        setShowCreateForm(false);
        await fetchTickets();
      } else {
        setMessage(response.data?.message || 'Réponse inattendue du serveur');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      }
    } catch (err) {
      const resp = err?.response;
      setIsSuccess(false);
      setShowMessage(true);
      if (resp) {
        setMessage(resp.data?.message || 'Erreur lors de la création du ticket');
      } else if (err.request) {
        setMessage('Erreur de connexion au serveur');
      } else {
        setError('Une erreur est survenue');
      }
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };



  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const mapped = files.map(f => ({ kind: 'file', file: f, name: f.name }));
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...mapped] }));
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Open': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'In Progress': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Open': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'complaint': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'issue': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <Loading loading_txt={'Chargement...'} />;
  }

  if (error) {
    return <ErrorGetData error={error} />;
  }

  return (
    <>
      {showMessage && <Message isSuccess={isSuccess} message={message} />}

      <div className="space-y-6 p-[2rem]">
        <div className="bg-gradient-to-r from-subtext to-blue-400 rounded-lg shadow-sm text-white p-6">
          <h1 className="text-2xl font-bold">Centre de support</h1>
          <p className="mt-2 opacity-90">Signalez des problèmes ou envoyez des plaintes concernant les équipements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSelectedType('complaint');
              setShowCreateForm(true);
            }}
            className="flex items-center justify-center space-x-3 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="text-left">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300">Envoyer une plainte</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">Signaler un problème de service ou de qualité</p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedType('issue');
              setShowCreateForm(true);
            }}
            className="flex items-center justify-center space-x-3 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="text-left">
              <h3 className="font-semibold text-red-900 dark:text-red-300">Déclarer un problème</h3>
              <p className="text-sm text-red-700 dark:text-red-400">Signaler un dysfonctionnement technique</p>
            </div>
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedType === 'complaint' ? 'Nouvelle plainte' : 'Nouveau problème'}
              </h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedType)}`}>
                  {selectedType === 'complaint' ? 'Plainte' : 'Problème technique'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={selectedType === 'complaint' ? 'Résumé de votre plainte' : 'Résumé du problème'}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description détaillée *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={
                    selectedType === 'complaint' 
                      ? 'Décrivez en détail votre plainte, les circonstances, et l\'impact...'
                      : 'Décrivez le problème technique, quand il s\'est produit, et les symptômes observés...'
                  }
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formData.description.length}/1000 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Low">Faible</option>
                  <option value="Medium">Moyenne</option>
                  <option value="High">Élevée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pièces jointes (optionnel)</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Uploader un fichier</span>
                    </button>
                    
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{attachment.name}</span>
                          </div>
                          <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mes demandes ({userTickets.length})</h3>
          </div>
          <div className="p-6">
            {userTickets.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{emptyDataList || "Vous n'avez encore envoyé aucune demande"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ticket.type)}`}>
                            {ticket.type === 'complaint' ? 'Plainte' : 'Problème'}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowRepliesModal(true);
                              // don't call fetchReplies here — ReplyListModal will fetch itself
                            }}
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                          >
                            Voir réponses
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowUpdateModal(true);
                            }}
                            className="text-green-600 dark:text-green-400 text-sm hover:underline"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDetailsModal(true);
                            }}
                            className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {ticket.description?.substring(0, 150) ?? ''}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('fr-FR') : '-'}</span>
                          </div>
                          
                          {ticket.replies && ticket.replies.length > 0 && (
                            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                              <MessageSquare className="h-3 w-3" />
                              <span>{ticket.replies.length} réponse(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ticket.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'Open' ? 'Ouvert' :
                             ticket.status === 'In Progress' ? 'En cours' :
                             ticket.status === 'Resolved' ? 'Résolu' : ticket.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Use the ReplyListModal component instead of inline dialog */}
        {selectedTicket && (
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
            onRefresh={() => fetchTickets()}
          />
        )}

        {/* Reply details modal opened when a reply is selected */}
        {showReplyDetailsModal && selectedReply && (
          <SupportReplyDetailsModal
            reply={selectedReply}
            onClose={() => {
              setShowReplyDetailsModal(false);
              setSelectedReply(null);
            }}
            // optional: notify parent to refetch tickets/replies on delete
            onDelete={() => {
              // after deletion, refresh tickets (or remove locally)
              fetchTickets();
              setShowReplyDetailsModal(false);
              setSelectedReply(null);
            }}
          />
        )}

        {showUpdateModal && selectedTicket && (
          <ModelUpdateTicketOrReply
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            ticket={selectedTicket}
            onUpdate={fetchTickets}
          />
        )}

        {showDetailsModal && selectedTicket && (
          <SupportTicketDetailsModal
            ticket={selectedTicket}
            onClose={() => setShowDetailsModal(false)}
            onOpenReplies={() => {
              setShowRepliesModal(true);
              // ReplyListModal will fetch replies, but if you also want to prefetch:
              // fetchReplies(selectedTicket.id);
            }}
          />
        )}
      </div>
    </>
  );
};

export default UserSupportContainer;
