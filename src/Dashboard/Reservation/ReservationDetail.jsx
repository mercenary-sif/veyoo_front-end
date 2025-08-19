import { X , CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

const ReservationDetailModal = ({ isOpen, onClose, reservation }) => {
  // Lock body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      
      // Cleanup function to reset scroll on unmount
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);  
  
    if (!isOpen || !reservation) return null;
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Active':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Active':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Map reservation types to display names
  const getReservationTypeDisplay = (type) => {
    switch (type) {
      case 'normal':
        return 'Normal';
      case 'saisonnier':
        return 'Saisonnier (3 mois)';
      case 'annuel':
        return 'Annuel';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails de la réservation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
                <p className="text-sm text-gray-900 dark:text-white">{reservation.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(reservation.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                    {reservation.status === 'Pending' ? 'En attente' :
                     reservation.status === 'Approved' ? 'Approuvée' :
                     reservation.status === 'Rejected' ? 'Refusée' :
                     reservation.status === 'Active' ? 'Active' : reservation.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Add Reservation Type here */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de réservation</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {getReservationTypeDisplay(reservation.reservationType || 'normal')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actif</label>
              <p className="text-sm text-gray-900 dark:text-white">{reservation.assetName} ({reservation.assetId})</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateur</label>
              <p className="text-sm text-gray-900 dark:text-white">{reservation.assignedTo}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(reservation.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objet</label>
              <p className="text-sm text-gray-900 dark:text-white">{reservation.purpose}</p>
            </div>
            
            {reservation.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <p className="text-sm text-gray-900 dark:text-white">{reservation.notes}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Créée le</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(reservation.createdAt).toLocaleDateString('fr-FR')} à {new Date(reservation.createdAt).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;