import React from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Car, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download, 
  ClipboardCheck,
} from 'lucide-react';

const PrecheckDetails = ({ precheck, onClose, onDownloadPDF, onAddToMalfunctions, onSendMessage }) => {
  // Dynamic checklist based on API fields
  const checklist = [
    { id: 1, category: 'Vérification générale', description: 'Carrosserie en bon état', status: precheck.car_body_ok ? 'OK' : 'Critical', notes: precheck.car_body_ok ? '' : 'Carrosserie non conforme' },
    { id: 2, category: 'Vérification générale', description: 'Pneus en bon état (pression correcte, pas usés ni abîmés)', status: precheck.tires_ok ? 'OK' : 'Critical', notes: precheck.tires_ok ? '' : 'Pneus non conformes' },
    { id: 3, category: 'Vérification générale', description: 'Éclairage fonctionnel (phares, clignotants, feux de frein)', status: precheck.lighting_ok ? 'OK' : 'Critical', notes: precheck.lighting_ok ? '' : 'Éclairage défectueux' },
    { id: 4, category: 'Vérification générale', description: 'Prochaine révision dans moins de 1000 km', status: precheck.next_service_within_1k ? 'OK' : 'Warning', notes: precheck.next_service_within_1k ? '' : 'Révision dans moins de 1000 km' },
    { id: 5, category: 'Vérification générale', description: 'Liquide de refroidissement Adblue (niveau suffisant, pas de fuites)', status: precheck.adblue_ok ? 'OK' : 'Critical', notes: precheck.adblue_ok ? '' : 'Niveau Adblue insuffisant' },
    { id: 6, category: 'Vérification générale', description: 'Aucun voyant allumé', status: precheck.no_warning_lights ? 'OK' : 'Critical', notes: precheck.no_warning_lights ? '' : 'Voyants allumés' },
    { id: 7, category: 'Vérification générale', description: 'Véhicule propre (intérieur et extérieur)', status: precheck.clean_vehicle ? 'OK' : 'Warning', notes: precheck.clean_vehicle ? '' : 'Véhicule non propre' },
    { id: 8, category: 'Vérification générale', description: 'Documents présents (assurance, carte grise, constat)', status: precheck.docs_present ? 'OK' : 'Critical', notes: precheck.docs_present ? '' : 'Documents manquants' },
  ];

  // Function to determine status icons for checklist items
  const getItemStatusIcon = (status) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full" />;
    }
  };

  // Function to determine status colors for checklist items
  const getItemStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'Warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Function to determine type colors
  const getTypeColor = (type) => {
    switch (type) {
      case 'Daily':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Weekly':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'Monthly':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'Pre-Trip':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Post-Trip':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'annuel':
        return 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Function to determine precheck status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Unique categories from checklist
  const categories = [...new Set(checklist.map(item => item.category))];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        {/* Modal Content */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails du contrôle {precheck.id}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Precheck Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {precheck.materialType === 'vehicle' ? (
                    <Car className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Wrench className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Matériel</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {precheck.materialName} ({precheck.materialType === 'vehicle' ? 'Véhicule' : 'Outil'} - ID: {precheck.materialId || 'N/A'})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Inspecteur</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {precheck.inspectorName}
                      {precheck.submitted_by_user && (
                        <span className="ml-2 inline-flex px-1 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded">
                          Soumis par utilisateur
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date et Heure</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(precheck.date).toLocaleDateString('fr-FR')} à {precheck.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardCheck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Type et Statut</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(precheck.type)}`}>
                        {precheck.type === 'Daily' ? 'Quotidien' :
                         precheck.type === 'Weekly' ? 'Hebdomadaire' :
                         precheck.type === 'Monthly' ? 'Mensuel' :
                         precheck.type === 'Pre-Trip' ? 'Pré-mission' :
                         precheck.type === 'Post-Trip' ? 'Post-mission' :
                         precheck.type === 'annuel' ? 'Annuel' : precheck.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(precheck.status)}`}>
                        {precheck.status === 'pending' ? 'En attente' :
                         precheck.status === 'In Progress' ? 'En cours' :
                         precheck.status === 'Completed' ? 'Terminé' :
                         precheck.status === 'Failed' ? 'Échec' : precheck.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Détails de la réservation
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Réservation:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{precheck?.reservationId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de début:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{precheck?.reservationStartDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de fin:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{precheck?.reservationEndDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{precheck?.reservationStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{precheck.notes || 'Aucune'}</span>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Éléments contrôlés ({checklist.length})
              </h4>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category}>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{category}</h5>
                    <div className="space-y-3">
                      {checklist.filter(item => item.category === category).map(item => (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {getItemStatusIcon(item.status)}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                                  {item.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getItemStatusColor(item.status)}`}>
                                {item.status === 'OK' ? 'OK' :
                                 item.status === 'Critical' ? 'Problème' :
                                 item.status === 'Warning' ? 'Avertissement' : 'Non vérifié'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problems Description */}
            {precheck.problems && precheck.problems.trim() !== '' && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Description des problèmes</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{precheck.problems}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(precheck.created_at).toLocaleDateString('fr-FR')} à {new Date(precheck.created_at).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Modifié le:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(precheck.updated_at).toLocaleDateString('fr-FR')} à {new Date(precheck.updated_at).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
            <button 
              onClick={() => onDownloadPDF(precheck)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Télécharger PDF
            </button>
            {/* <button 
              onClick={() => onAddToMalfunctions(precheck)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 dark:bg-orange-500 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Ajouter aux dysfonctionnements
            </button>
            <button 
              onClick={onSendMessage}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600"
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Envoyer un message
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecheckDetails;