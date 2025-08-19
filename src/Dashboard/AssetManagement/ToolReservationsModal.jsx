// src/pages/ToolReservationsModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ListReservationSelected from './ListReservationSelected'; // adjust path if needed
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';

const ToolReservationsModal = ({ isOpen, onClose, tool }) => {
  const VeYooAxios = useVeYooAxios();

  const [reservations, setReservations] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, declined: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // UI message state (your pattern)
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReservations([]);
      setCounts({ total: 0, pending: 0, accepted: 0, declined: 0 });
      setErrorMsg(null);
      setShowMessage(false);
      setMessage('');
    }
  }, [isOpen, tool]);

  const getMaterialId = () => {
    return tool?.material_id ?? tool?.id ?? tool?.material?.id ?? null;
  };

  const mapReservation = (r) => {
    const createdBy = r.created_by
      ? { id: r.created_by.id, username: r.created_by.username ?? null }
      : { id: null, username: null };

    const assignedTo = r.assigned_to
      ? { id: r.assigned_to.id, username: r.assigned_to.username ?? null }
      : { id: null, username: null };

    const material = r.material
      ? { id: r.material.id, name: r.material.name ?? null, type: r.material.type ?? null }
      : { id: null, name: null, type: null };

    return {
      // backend fields (snake_case)
      id: r.id,
      start_date: r.start_date ?? null,
      start_time: r.start_time ?? null,
      end_date: r.end_date ?? null,
      end_time: r.end_time ?? null,
      purpose: r.purpose ?? '',
      notes: r.notes ?? '',
      reservation_type: r.reservation_type ?? '',
      status: r.status ?? '',
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
      created_by: createdBy,
      assigned_to: assignedTo,
      material: material,

      // convenience fields used by UI
      userName: createdBy.username || '—',
      startDate: r.start_date ?? null,
      startTime: r.start_time ?? null,
      endDate: r.end_date ?? null,
      endTime: r.end_time ?? null,
      createdAt: r.created_at ?? null,
      updatedAt: r.updated_at ?? null,
    };
  };

  const fetchReservations = async () => {
    const materialId = getMaterialId();
    if (!materialId) {
      setErrorMsg("ID du matériel introuvable.");
      setMessage("ID du matériel introuvable.");
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const resp = await VeYooAxios.get(`/materials/reservations/${materialId}/`);
      const data = resp.data ?? {};
      const mapped = (data.reservations ?? []).map(mapReservation);

      setReservations(mapped);
      setCounts({
        total: data.total ?? mapped.length,
        pending: data.pending ?? 0,
        accepted: data.accepted ?? 0,
        declined: data.declined ?? 0,
      });

      if (!mapped.length) {
        setMessage(data.message ?? 'Aucune réservation pour ce matériel.');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const respData = err.response.data ?? {};
        if (status === 404) {
          // backend-side "no reservations" path: still map counts if provided
          const mapped = (respData.reservations ?? []).map(mapReservation);
          setReservations(mapped);
          setCounts({
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
          setErrorMsg(respData.message || 'Erreur lors de la récupération des réservations.');
          setMessage(respData.message || 'Erreur lors de la récupération des réservations.');
          setIsSuccess(false);
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2500);
        }
      } else if (err.request) {
        setErrorMsg('Erreur de connexion au serveur');
        setMessage('Erreur de connexion au serveur');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      } else {
        setErrorMsg('Une erreur est survenue');
        setMessage('Une erreur est survenue');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } finally {
      setIsLoading(false);
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
      case 'Completed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };



  // fetch when modal is opened and tool is present
  useEffect(() => {
    if (isOpen && tool) {
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tool]);

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Réservations - {tool.name}
            </h3>
            <div className="flex items-center space-x-3">
             
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {showMessage && <Message isSuccess={isSuccess} message={message} />}

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              {tool.photo && (
                <img src={tool.photo} alt={tool.name} className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
              )}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Catégorie:</span>
                    <p className="text-gray-900 dark:text-white">{tool.category || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Fabricant:</span>
                    <p className="text-gray-900 dark:text-white">{tool.manufacturer || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                    <p className="text-gray-900 dark:text-white">{tool.status || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total réservations:</span>
                    <p className="text-gray-900 dark:text-white font-semibold">{counts.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Loading loading_txt={'Chargement des réservations...'} />
          ) : errorMsg ? (
            <div className="text-red-600 dark:text-red-400 text-center p-4">{errorMsg}</div>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Liste des réservations ({reservations.length})</h4>
                <ListReservationSelected reservations={reservations} getStatusColor={getStatusColor} />
              </div>

              {reservations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Statistiques</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{reservations.filter(r => r.status === 'pending').length}</p>
                      <p className="text-gray-500 dark:text-gray-400">En attente</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">{reservations.filter(r => r.status === 'accepted').length}</p>
                      <p className="text-gray-500 dark:text-gray-400">Approuvées</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{reservations.filter(r => r.status === 'completed').length}</p>
                      <p className="text-gray-500 dark:text-gray-400">Terminées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">{reservations.filter(r => r.status.toLowerCase() === 'declined').length}</p>
                      <p className="text-gray-500 dark:text-gray-400">Refusées</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Fermer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolReservationsModal;
