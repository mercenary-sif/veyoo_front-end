import { FiClock, FiCalendar, FiChevronRight } from 'react-icons/fi';
import moment from 'moment';

const ReservationCard = ({ reservation, onClick, getStatusColor }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl 
                shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {reservation.title}
            </h3>
            {reservation.extendedProps.material.model && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {reservation.extendedProps.material.model}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.extendedProps.status)}`}>
            {reservation.extendedProps.status === 'accepted' ? 'Accepté' : 
              reservation.extendedProps.status === 'declined' ? 'Refusé' : 'En attente'}
          </span>
        </div>
        
        <div className="mt-4 flex items-center text-gray-600 dark:text-gray-300 text-sm">
          <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
          <span>{moment(reservation.start).format('dddd D MMMM YYYY')}</span>
        </div>
        
        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-300 text-sm">
          <FiClock className="mr-2 text-gray-500 dark:text-gray-400" />
          <span>
            {reservation.extendedProps.start_time} - {reservation.extendedProps.end_time}
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Créé le {moment(reservation.extendedProps.created_at).format('D MMM YYYY')}
          </span>
          <button className="text-blue-600 dark:text-blue-400 flex items-center text-sm font-medium 
                             hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-300 ease-in-out hover:scale-105 ">
            Détails <FiChevronRight className="ml-1 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;