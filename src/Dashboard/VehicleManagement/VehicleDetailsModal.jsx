import React, { useState, useEffect } from 'react';
import { 
  X, Car, Gauge, Wrench, Palette,  CheckCircle, 
  AlertTriangle, Clock, ChevronLeft
} from 'lucide-react';
import ListReservationSelected from '../AssetManagement/ListReservationSelected';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';

const VehicleDetailsModal = ({ isOpen, onClose, vehicle, onEdit }) => {
  const VeYooAxios = useVeYooAxios();

  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [resCounts, setResCounts] = useState({ total: 0, pending: 0, accepted: 0, declined: 0 });
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);

  // UI message state (same pattern used across app)
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // reset reservations state when modal closes or vehicle changes
    if (!isOpen) {
      setShowReservations(false);
      setReservations([]);
      setResCounts({ total: 0, pending: 0, accepted: 0, declined: 0 });
      setReservationsError(null);
      setShowMessage(false);
      setMessage('');
    }
  }, [isOpen, vehicle]);

  // helper to get material id robustly
  const getMaterialId = () => {
    return vehicle?.material_id ?? vehicle?.id ?? vehicle?.material?.id ?? null;
  };

  const fetchReservations = async () => {
    const materialId = getMaterialId();
    if (!materialId) {
      setReservationsError('ID du matériel introuvable.');
      setMessage('ID du matériel introuvable.');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
      return;
    }

    setIsLoadingReservations(true);
    setReservationsError(null);
    try {
      const resp = await VeYooAxios.get(`/materials/reservations/${materialId}/`);
      // success (200) -> map reservations to the UI shape used by ListReservationSelected
      const data = resp.data;
      const mapped = (data.reservations ?? []).map((r) => ({
        id: r.id,
        start_date: r.start_date,
        start_time: r.start_time,
        end_date: r.end_date,
        end_time: r.end_time,
        purpose: r.purpose ?? '',
        notes: r.notes ?? '',
        reservation_type: r.reservation_type ?? '',
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        created_by: {
          id: r.created_by?.id,
          username: r.created_by?.username ?? '—',
        },
        assigned_to: {
          id: r.assigned_to?.id ?? null,
          username: r.assigned_to?.username ?? null,
        },
        material: {
          id: r.material?.id ?? null,
          name: r.material?.name ?? '—',
          type: r.material?.type ?? '—',
        },
      }));

      setReservations(mapped);
      setResCounts({
        total: data.total ?? mapped.length,
        pending: data.pending ?? 0,
        accepted: data.accepted ?? 0,
        declined: data.declined ?? 0,
      });

      // if no reservations returned (empty array) show friendly message but keep modal open
      if (!mapped.length) {
        setMessage(data.message ?? 'Aucune réservation pour ce matériel.');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }

    } catch (err) {
      // handle 404 specially (your backend uses 404 when no reservations)
      if (err.response) {
        const status = err.response.status;
        const respData = err.response.data ?? {};
        if (status === 404) {
          // backend returns material info + counts + message
          const mapped = (respData.reservations ?? []).map((r) => ({
            id: r.id,
            start_date: r.start_date,
            start_time: r.start_time,
            end_date: r.end_date,
            end_time: r.end_time,
            purpose: r.purpose ?? '',
            notes: r.notes ?? '',
            reservation_type: r.reservation_type ?? '',
            status: r.status,
            created_at: r.created_at,
            updated_at: r.updated_at,
            created_by: {
              id: r.created_by?.id,
              username: r.created_by?.username ?? '—',
            },
            assigned_to: {
              id: r.assigned_to?.id ?? null,
              username: r.assigned_to?.username ?? null,
            },
            material: {
              id: r.material?.id ?? null,
              name: r.material?.name ?? '—',
              type: r.material?.type ?? '—',
            },
          }));
          setReservations(mapped);
          setResCounts({
            total: respData.total ?? 0,
            pending: respData.pending ?? 0,
            accepted: respData.accepted ?? 0,
            declined: respData.declined ?? 0,
          });
          setMessage(respData.message ?? 'Aucune réservation pour ce matériel.');
          setIsSuccess(false);
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2500);
        } else {
          setReservationsError(respData.message || 'Erreur lors de la récupération des réservations.');
          setMessage(respData.message || 'Erreur lors de la récupération des réservations.');
          setIsSuccess(false);
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2500);
        }
      } else if (err.request) {
        setReservationsError('Erreur de connexion au serveur');
        setMessage('Erreur de connexion au serveur');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      } else {
        setReservationsError('Une erreur est survenue');
        setMessage('Une erreur est survenue');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'good': return 'Bon';
      case 'under_maintenance': return 'En maintenance';
      case 'pending_maintenance': return 'Maintenance en attente';
      case 'Pending': return 'En attente';
      case 'Approved':
      case 'ACCEPTED': return 'Approuvée';
      case 'Declined':
      case 'DECLINED': return 'Refusée';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'under_maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'pending_maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };



  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {showReservations && (
                <button 
                  onClick={() => {
                    // go back to details view
                    setShowReservations(false);
                  }}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {showReservations ? `Réservations - ${vehicle.name}` : 'Détails du véhicule'}
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {showReservations ? (
            <div className="space-y-6">
              {showMessage && <Message isSuccess={isSuccess} message={message} />}

              {isLoadingReservations ? (
                <Loading loading_txt={'Chargement des réservations...'} />
              ) : reservationsError ? (
                <div className="text-red-600 dark:text-red-400 text-center p-4">
                  {reservationsError}
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {vehicle.photo ? (
                        <img 
                          src={vehicle.photo} 
                          alt={vehicle.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <Car className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.name}</h4>
                        <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Total</span>
                            <p className="text-gray-900 dark:text-white">{resCounts.total}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">En attente</span>
                            <p className="text-gray-900 dark:text-white">{resCounts.pending}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Approuvées</span>
                            <p className="text-gray-900 dark:text-white">{resCounts.accepted}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Refusées</span>
                            <p className="text-gray-900 dark:text-white">{resCounts.declined}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reservations List */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Liste des réservations ({reservations.length})
                    </h4>

                    <ListReservationSelected 
                      reservations={reservations} 
                      getStatusColor={(s) => {
                        switch (s) {
                          case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                          case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
                          case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
                          case 'Active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
                          case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
                          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
                        }
                      }} 
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vehicle Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {vehicle.photo ? (
                  <img 
                    src={vehicle.photo} 
                    alt={vehicle.name} 
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {vehicle.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{vehicle.license_plate}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getStatusIcon(vehicle.status)}
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                      {getStatusText(vehicle.status)}
                    </span>
                    {vehicle.color && (
                      <span className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Palette className="h-4 w-4" />
                        <span>{vehicle.color}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Information (unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Informations générales
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Marque:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vehicle.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Modèle:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vehicle.model || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Année:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vehicle.year_of_manufacture || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Carburant:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vehicle.fuelType || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Kilométrage:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.current_mileage ? vehicle.current_mileage.toLocaleString('fr-FR') + ' km' : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Gauge className="h-5 w-5 mr-2" />
                    État technique
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Niveau carburant:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.fuel_level ? vehicle.fuel_level + '%' : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Niveau huile:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.oil_level ? vehicle.oil_level + '%' : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">État pneus:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.tire_status || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Carrosserie:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.body_condition || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Moteur:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {vehicle.engine_status || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
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
                  onClick={async () => {
                    // fetch reservations and then show list
                    await fetchReservations();
                    setShowReservations(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600"
                >
                  Voir réservations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;