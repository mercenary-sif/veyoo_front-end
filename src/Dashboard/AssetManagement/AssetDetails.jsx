
import { Wrench, X } from 'lucide-react';

const AssetDetails = ({
  tool,
  onClose,
  onEdit,
  onViewReservations,
  reservationCount,
  getStatusIcon,
  getStatusColor,
  isInspectionDue
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails de l'outil
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Tool Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                {tool.photo ? (
                  <img 
                    src={tool.photo} 
                    alt={tool.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Wrench className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tool.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{tool.category}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {getStatusIcon(tool.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tool.status)}`}>
                    {tool.status === 'good' ? 'Bon' :
                     tool.status === 'under_maintenance' ? 'En maintenance' :
                     tool.status === 'pending_maintenance' ? 'Maintenance en attente' : tool.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Tool Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">Informations générales</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Fabricant:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{tool.manufacturer || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Numéro de série:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono">{tool.serial_number || '-'}</span>
                  </div>
                  {tool.purchase_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Date d'achat:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(tool.purchase_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {tool.warranty_expiry && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Fin de garantie:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(tool.warranty_expiry).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">Maintenance</h5>
                <div className="space-y-3">
                  {tool.last_maintenance_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Dernière maintenance:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(tool.last_maintenance_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {tool.inspection_due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Prochaine inspection:</span>
                      <span className={`text-sm ${
                        isInspectionDue(tool.inspection_due_date) 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {new Date(tool.inspection_due_date).toLocaleDateString('fr-FR')}
                        {isInspectionDue(tool.inspection_due_date) && ' ⚠️'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Réservations:</span>
                    <button
                      onClick={onViewReservations}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {reservationCount} réservation(s)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {tool.description && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {tool.description}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
            <button 
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Modifier
            </button>
            <button 
              onClick={onViewReservations}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
            >
              Voir réservations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;