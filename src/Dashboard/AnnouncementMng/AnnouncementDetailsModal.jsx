import React from 'react';
import { X, MessageSquare, Calendar, Users, FileText, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const AnnouncementDetailsModal = ({
  announcement,
  onClose
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Expired':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Scheduled':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Expired':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleDownloadPDF = () => {
    if (announcement.pdfUrl) {
      window.open(announcement.pdfUrl, '_blank');
    }
  };

  const startDate = formatDate(announcement.startDate).date;
  const endDate = formatDate(announcement.endDate).date;
  const createdDate = formatDate(announcement.createdAt).date;
  const createdTime = formatDate(announcement.createdAt).time;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails de l'annonce
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Announcement Header */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {announcement.cover && (
                <img 
                  src={announcement.cover} 
                  alt={announcement.title} 
                  className="w-25 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {announcement.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(announcement.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(announcement.status)}`}>
                      {announcement.status === 'Active' ? 'Active' :
                       announcement.status === 'Scheduled' ? 'Programmée' :
                       announcement.status === 'Expired' ? 'Expirée' : announcement.status}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority === 'High' ? 'Élevée' :
                     announcement.priority === 'Medium' ? 'Moyenne' :
                     announcement.priority === 'Low' ? 'Faible' : announcement.priority}
                  </span>
                  {announcement.pdfUrl && (
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span>PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contenu</h5>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Période d'affichage</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Du {startDate} au {endDate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Destinataires</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {announcement.targetRoles.map(role => 
                        role === 'Admin' ? 'Administrateurs' :
                        role === 'Manager' ? 'Managers' :
                        role === 'Inspector' ? 'Inspecteurs' : role
                      ).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Créée par</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {announcement.createdBy}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date de création</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {createdDate} à {createdTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Section */}
            {announcement.pdfUrl && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Document PDF joint
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        Cliquez pour télécharger ou visualiser
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Informations système
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{announcement.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                  <span className="text-gray-900 dark:text-white">{announcement.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Priorité:</span>
                  <span className="text-gray-900 dark:text-white">{announcement.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Rôles ciblés:</span>
                  <span className="text-gray-900 dark:text-white">All</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
            {announcement.pdfUrl && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailsModal;