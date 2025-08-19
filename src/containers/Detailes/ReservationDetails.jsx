import React, { useEffect, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import moment from 'moment';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, ErrorGetData, Message } from '../../components/export';

const ReservationDetails = ({ reservationId, setIsModalOpen, handleConfirmReservation, getStatusColor  }) => {
  const VeYooAxios = useVeYooAxios();

  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await VeYooAxios.get(`reservations/reservation-detail/${reservationId}/`);
        const payload = resp.data;

        // Build UI-friendly shape using fields from payload
        const built = {
          id: payload.id,
          title: payload.material?.name || 'Réservation',
          // keep start/end as full-date strings for moment formatting (component expects ISO-ish)
          start: payload.start_date ? `${payload.start_date}T00:00:00` : null,
          end: payload.end_date ? `${payload.end_date}T00:00:00` : null,
          extendedProps: {
            status: payload.status,
            material: {
              id: payload.material?.id,
              name: payload.material?.name,
              type: payload.material?.type,
              model: payload.material?.model || undefined,
            },
            // times and metadata:
            start_time: payload.start_time || null,
            end_time: payload.end_time || null,
            created_at: payload.created_at || null,   // backend format "YYYY-MM-DD HH:mm"
            updated_at: payload.updated_at || null,
            purpose: payload.purpose || '',
            notes: payload.notes || '',
            reservation_type: payload.reservation_type || '',
            decline_reason: payload.status === 'declined' ? payload.decline_reason || 'Matériel indisponible' : undefined,
            created_by: payload.created_by || null,
            assigned_to: payload.assigned_to || null,
          },
        };

        if (!cancelled) setReservation(built);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Erreur lors de la récupération');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [reservationId, VeYooAxios]);

  const handleDeclineReservation = async (reservationIdParam, reason) => {
    setIsLoading(true);
    setError(null);
    try {
      await VeYooAxios.put(`reservations/reservation-decline/${reservationIdParam}/`, { reason });
      setMessage('Réservation refusée');
      setMsgSuccess(true);
      setShowMessage(true);
      // update local UI state
      setReservation((prev) => prev ? { ...prev, extendedProps: { ...prev.extendedProps, status: 'declined', decline_reason: reason } } : prev);
      setTimeout(() => setShowMessage(false), 2000);
      setTimeout(() => setIsModalOpen(false), 800);
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || 'Erreur lors du refus');
      setMsgSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptReservation = () => {
    if (!reservation) return;
    if (typeof handleConfirmReservation === 'function') {
      // pass object shape so parent decides vehicle/precheck vs direct accept
      handleConfirmReservation({
        id: reservation.id,
        material: reservation.extendedProps?.material,
        extendedProps: reservation.extendedProps,
      });
    }
  };

  const fmtDate = (val, fallback = '—', withTime = false) => {
    if (!val) return fallback;
    const m = moment(val, ['YYYY-MM-DD HH:mm', moment.ISO_8601], true);
    if (!m.isValid()) {
      // try loose parse
      const mm = moment(val);
      if (!mm.isValid()) return val;
      return withTime ? mm.format('D MMMM YYYY HH:mm') : mm.format('D MMMM YYYY');
    }
    return withTime ? m.format('D MMMM YYYY HH:mm') : m.format('D MMMM YYYY');
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <ErrorGetData error={error} />
          <div className="mt-4 flex justify-end">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) return null;

  const createdByName =
    reservation.extendedProps.created_by?.username ||
    (reservation.extendedProps.created_by?.id ? `#${reservation.extendedProps.created_by.id}` : '—');

  const assignedToName =
    reservation.extendedProps.assigned_to?.username ||
    (reservation.extendedProps.assigned_to?.id ? `#${reservation.extendedProps.assigned_to.id}` : '—');

  const isPending =
    String(reservation.extendedProps.status).toLowerCase() === 'pending' ||
    String(reservation.extendedProps.status).toLowerCase() === 'en attente';

  return (
   <>
   {isLoading ? (
           <Loading loading_txt="Chargement détails de réservation..." />
         ) : error ? (
           <ErrorGetData error={error} />
         ) :

    <>
     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
      {showMessage && <Message isSuccess={msgSuccess} message={message} />}
      <div className="rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <div className="p-4 sm:p-6">

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{reservation.title}</h2>
              {reservation.extendedProps?.material?.model && (
                <p className="mt-1 text-sm sm:text-base opacity-80">{reservation.extendedProps.material.model}</p>
              )}
              <span
                className={`mt-2 inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                  reservation.extendedProps.status
                )}`}
              >
                {String(reservation.extendedProps.status).toLowerCase() === 'accepted' ? 'Accepté' :
                 String(reservation.extendedProps.status).toLowerCase() === 'declined' ? 'Refusé' : 'En attente'}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-2xl transition-colors duration-300"
              aria-label="Fermer"
            >
              &times;
            </button>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold pb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                Détails de la réservation
              </h3>

              <div className="pt-1">
                <p className="font-medium text-xs sm:text-sm opacity-80">Date de début</p>
                <p className="flex items-center mt-1 text-sm sm:text-base">
                  <FiCalendar className="mr-2 min-w-[16px]" />
                  <span>
                    {reservation.start ? moment(reservation.start).format('dddd D MMMM YYYY') : '—'}{' '}
                    {reservation.extendedProps.start_time ? `à ${reservation.extendedProps.start_time}` : ''}
                  </span>
                </p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Date de fin</p>
                <p className="flex items-center mt-1 text-sm sm:text-base">
                  <FiCalendar className="mr-2 min-w-[16px]" />
                  <span>
                    {reservation.end ? moment(reservation.end).format('dddd D MMMM YYYY') : '—'}{' '}
                    {reservation.extendedProps.end_time ? `à ${reservation.extendedProps.end_time}` : ''}
                  </span>
                </p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Créé le</p>
                <p className="mt-1 text-sm sm:text-base">{fmtDate(reservation.extendedProps.created_at, '—', true)}</p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Dernière mise à jour</p>
                <p className="mt-1 text-sm sm:text-base">{fmtDate(reservation.extendedProps.updated_at, '—', true)}</p>
              </div>

              {reservation.extendedProps.reservation_type && (
                <div className="pt-2">
                  <p className="font-medium text-xs sm:text-sm opacity-80">Type de réservation</p>
                  <p className="mt-1 text-sm sm:text-base">{reservation.extendedProps.reservation_type}</p>
                </div>
              )}

              {reservation.extendedProps.purpose && (
                <div className="pt-2">
                  <p className="font-medium text-xs sm:text-sm opacity-80">Objet</p>
                  <p className="mt-1 text-sm sm:text-base whitespace-pre-wrap">{reservation.extendedProps.purpose}</p>
                </div>
              )}

              {reservation.extendedProps.notes && (
                <div className="pt-2">
                  <p className="font-medium text-xs sm:text-sm opacity-80">Notes</p>
                  <p className="mt-1 text-sm sm:text-base whitespace-pre-wrap">{reservation.extendedProps.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold pb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                Matériel & attribution
              </h3>

              <div className="pt-1">
                <p className="font-medium text-xs sm:text-sm opacity-80">Type</p>
                <p className="mt-1 text-sm sm:text-base">
                  {reservation.extendedProps.material.type === 'vehicle' ? 'Véhicule' : 'Outil'}
                </p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Nom</p>
                <p className="mt-1 text-sm sm:text-base">{reservation.title}</p>
              </div>

              {reservation.extendedProps.material.model && (
                <div className="pt-2">
                  <p className="font-medium text-xs sm:text-sm opacity-80">Modèle</p>
                  <p className="mt-1 text-sm sm:text-base">{reservation.extendedProps.material.model}</p>
                </div>
              )}

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Créé par</p>
                <p className="mt-1 text-sm sm:text-base">{createdByName}</p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-xs sm:text-sm opacity-80">Assigné à</p>
                <p className="mt-1 text-sm sm:text-base">{assignedToName}</p>
              </div>
            </div>
          </div>


          {isPending && (
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={() => {
                  handleDeclineReservation(reservation.id);
                }}
                disabled={isLoading}
                className="px-4 py-2 sm:px-5 sm:py-2.5 text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 text-sm sm:text-base"
                style={{ backgroundColor: '#FF4D4F', opacity: isLoading ? 0.7 : 1 }}
              >
                <FiXCircle className="mr-2" /> Refuser
              </button>

              <button
                onClick={handleAcceptReservation}
                disabled={isLoading}
                className="px-4 py-2 sm:px-5 sm:py-2.5 text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 text-sm sm:text-base"
                style={{ backgroundColor: '#0891b2', opacity: isLoading ? 0.7 : 1 }}
              >
                <FiCheckCircle className="mr-2" /> Confirmer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
   }
   </>
  );
};

export default ReservationDetails;
