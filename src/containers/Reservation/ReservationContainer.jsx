import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo, FiArrowLeft, FiX } from 'react-icons/fi';
import moment from 'moment';
import { Message, ReservationCard } from '../../components/export';
import { ReservationDetails } from '../../containers/export';
import PreCheck from './PreCheck';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading } from '../../components/export';

const ReservationsCalendar = () => {
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]); // events (allDay = true, start is date)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busyDates, setBusyDates] = useState(new Set());
  const calendarRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPreCheck, setShowPreCheck] = useState(false);
  const [currentVehicleReservation, setCurrentVehicleReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (showPreCheck) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showPreCheck]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await VeYooAxios.get('reservations/user-my-reservations/');
        const apiReservations = (response.data.reservations || []).map((res) => ({
          id: String(res.id),
          title: res.material?.name || 'Réservation',
          start: res.start_date, // YYYY-MM-DD
          allDay: true,
          extendedProps: {
            status: res.status,
            material: {
              id: res.material?.id,
              name: res.material?.name,
              type: res.material?.type,
              model: res.material?.model || 'N/A',
            },
            start_time: res.start_time,
            end_time: res.end_time,
            created_at: res.created_at,
            purpose: res.purpose || '',
            notes: res.notes || '',
            reservation_type: res.reservation_type || '',
            decline_reason: res.status === 'declined' ? res.decline_reason || 'Matériel indisponible' : undefined,
          },
        }));

        setReservations(apiReservations);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const datesSet = new Set();
    reservations.forEach((r) => datesSet.add(String(r.start)));
    setBusyDates(datesSet);
  }, [reservations]);

  const filteredReservations = reservations.filter(
    (res) => new Date(res.start).toDateString() === selectedDate.toDateString()
  );

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo.start);
    setView('list');
  };

  const handleEventClick = (clickInfo) => {
    const id = clickInfo.event.id;
    setSelectedReservationId(id);
    setIsModalOpen(true);
  };

  // Accept logic: either open pre-check (vehicle) or call accept endpoint directly
  const handleVehicleConfirm = (reservationOrId) => {
    if (!reservationOrId) return;
    // if object shape provided, detect material type
    const materialType = reservationOrId.material?.type || reservationOrId.extendedProps?.material?.type;
    const id = reservationOrId.id || reservationOrId;
    if (materialType === 'vehicle') {
      // Keep an object that contains id and metadata for pre-check UI
      setCurrentVehicleReservation({
        id,
        title: reservationOrId.title || reservationOrId.extendedProps?.material?.name || 'Véhicule',
        // try to surface model/time for the precheck header
        material: reservationOrId.material || reservationOrId.extendedProps?.material,
        start: reservationOrId.start || `${reservationOrId.start_date}T00:00:00`,
        extendedProps: reservationOrId.extendedProps || {},
      });
      setShowPreCheck(true);
      setIsModalOpen(false);
      return;
    }
    // not a vehicle => accept directly
    handleAcceptDirect(id);
  };

  const handleAcceptDirect = async (reservationId) => {
  setIsLoading(true);
  try {
     await VeYooAxios.put(`reservations/reservation-accept/${reservationId}/`);
    // update local state
    setReservations(prev =>
      prev.map(r =>
        String(r.id) === String(reservationId)
          ? { ...r, extendedProps: { ...r.extendedProps, status: 'accepted' } }
          : r
      )
    );

    // show success message
    setIsLoading(false);
    setIsModalOpen(false);
    setIsSuccess(true);
    setShowMessage(true);
    setMessage('Réservation acceptée');

    // keep the message visible briefly, then close modal and clear message
    setTimeout(() => {
      setSelectedReservationId(null);
      setIsSuccess(false);
      setShowMessage(false);
      setMessage('');
    }, 2000);
  } catch (err) {
    setIsLoading(false);
    setMessage(err.response?.data?.message || "Erreur lors de l'acceptation de la réservation");
    setShowMessage(true);
    setIsSuccess(false);

    // hide error message after a short while (do not close the modal so user can retry)
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  }
};

  const handlePreCheckComplete = async (report) => {
  if (!currentVehicleReservation) {
    setShowPreCheck(false);
    return;
  }

  const reservationId = currentVehicleReservation.id;
  // normalize payload: report might contain checklist or individual boolean fields
  const payload = {
    car_body_ok: report.car_body_ok ?? (report.checklist?.[0]?.status ?? false),
    tires_ok: report.tires_ok ?? (report.checklist?.[1]?.status ?? false),
    lighting_ok: report.lighting_ok ?? (report.checklist?.[2]?.status ?? false),
    next_service_within_1k: report.next_service_within_1k ?? (report.checklist?.[3]?.status ?? false),
    adblue_ok: report.adblue_ok ?? (report.checklist?.[4]?.status ?? false),
    no_warning_lights: report.no_warning_lights ?? (report.checklist?.[5]?.status ?? false),
    clean_vehicle: report.clean_vehicle ?? (report.checklist?.[6]?.status ?? false),
    docs_present: report.docs_present ?? (report.checklist?.[7]?.status ?? false),
    report: report.report ?? report.problems ?? '',
  };

  setIsLoading(true);
  try {
    const res = await VeYooAxios.put(`reservations/reservation-accept/${reservationId}/`, payload);

    // update reservations locally
    setReservations(prev =>
      prev.map(r =>
        String(r.id) === String(reservationId)
          ? { ...r, extendedProps: { ...r.extendedProps, status: 'accepted', preCheckReport: report } }
          : r
      )
    );

    // show success message while keeping precheck visible for a moment
    setIsLoading(false);
     setShowPreCheck(false);
    setIsSuccess(true);
    setShowMessage(true);
    setMessage(res?.data?.message || 'Pré-vérification enregistrée et réservation acceptée');

    // after short delay hide the precheck modal and clear message/state
    setTimeout(() => {
     
      setCurrentVehicleReservation(null);
      setIsSuccess(false);
      setShowMessage(false);
      setMessage('');
    }, 2000);
  } catch (err) {
    setIsLoading(false);
    console.error('Failed to accept vehicle reservation:', err);
    setMessage(err.response?.data?.message || 'Erreur lors de la pré-vérification / acceptation');
    setShowMessage(true);
    setIsSuccess(false);

    // hide error message after a short while, keep the precheck open so user can retry/correct
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderEventContent = (arg) => {
    const status = arg.event.extendedProps?.status;
    if (windowWidth < 640) {
      let icon; let iconColor;
      switch (status) {
        case 'accepted': icon = <FiCheckCircle />; iconColor = 'text-green-500'; break;
        case 'declined': icon = <FiXCircle />; iconColor = 'text-red-500'; break;
        default: icon = <FiClock />; iconColor = 'text-yellow-500';
      }
      return (<div className="fc-event-main flex justify-center items-center p-1"><span className={`${iconColor} text-lg`}>{icon}</span></div>);
    }
    return (<div className="fc-event-main p-1 rounded-sm"><div className="truncate text-xs sm:text-sm text-gray-800">{arg.event.title}</div></div>);
  };

  const ListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('calendar')} className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <FiArrowLeft className="mr-2" /> Retour au calendrier
          </button>
          <h2 className="text-xl font-bold text-gray-800">{moment(selectedDate).format('dddd D MMMM YYYY')}</h2>
          <div className="w-28" />
        </div>

        {filteredReservations.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
            <FiInfo className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600 text-lg">Aucune réservation pour cette date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReservations.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                getStatusColor={getStatusColor}
                onClick={() => { setSelectedReservationId(reservation.id); setIsModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && view === 'calendar') {
    return (<div className='space-y-6'><Loading loading_txt="Chargement des réservations..." /></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      {showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
      {isLoading && <Loading loading_txt={'Création du actif en cours... ... cela prendra quelques instants !'}/>}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gestion des <span className="text-blue-600"> Réservations </span></h1>
          <p className="text-sm sm:text-base text-gray-600">Consultez et gérez vos réservations de matériel</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button className={`px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium ${view === 'calendar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setView('calendar')}>Calendrier</button>
            <button className={`px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium ${view === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setView('list')}>Reservations</button>
          </div>

          <div className="p-2 sm:p-4">
            {view === 'calendar' ? (
              <div className="custom-calendar">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth' }}
                  events={reservations}
                  selectable={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventClassNames={(arg) => [getStatusColor(arg.event.extendedProps.status), 'cursor-pointer']}
                  eventContent={renderEventContent}
                  dayHeaderClassNames="text-gray-700 font-medium text-xs sm:text-sm"
                  dayCellClassNames={(arg) => {
                    const dateStr = moment(arg.date).format('YYYY-MM-DD');
                    const classes = ['cursor-pointer'];
                    if (busyDates.has(dateStr)) classes.push('bg-blue-50');
                    return classes;
                  }}
                  dayMaxEvents={1}
                  moreLinkContent={(arg) => `+ ${arg.num} de plus`}
                  height="auto"
                  contentHeight="auto"
                  aspectRatio={1.5}
                  buttonText={{ prev: '<', next: '>' }}
                />
              </div>
            ) : (
              <ListView />
            )}
          </div>
        </div>

        {isModalOpen && selectedReservationId && (
          <ReservationDetails
            reservationId={selectedReservationId}
            setIsModalOpen={(open) => {
              setIsModalOpen(open);
              if (!open) setSelectedReservationId(null);
            }}
            handleConfirmReservation={(reservationOrId) => handleVehicleConfirm(reservationOrId)}
            getStatusColor={getStatusColor}
          />
        )}

        {showPreCheck && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowPreCheck(false)}></div>

              <div className="inline-block w-full max-w-3xl p-6 my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg relative z-50">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 z-60 pb-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pré-vérification du véhicule</h3>
                  <button onClick={() => setShowPreCheck(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {currentVehicleReservation && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Détails du véhicule</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Véhicule:</span>
                        <p className="text-gray-900 dark:text-white">{currentVehicleReservation.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Modèle:</span>
                        <p className="text-gray-900 dark:text-white">{currentVehicleReservation.material?.model || currentVehicleReservation.extendedProps?.material?.model}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Date de réservation:</span>
                        <p className="text-gray-900 dark:text-white">{moment(currentVehicleReservation.start).format('dddd D MMMM YYYY')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Période:</span>
                        <p className="text-gray-900 dark:text-white">{currentVehicleReservation.extendedProps?.start_time} - {currentVehicleReservation.extendedProps?.end_time}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="py-8">
                  <PreCheck onComplete={handlePreCheckComplete} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsCalendar;
