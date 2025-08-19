import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle, Clock, Calendar, User } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import {Message } from '../../components/export';

const NotificationDetailsModal = ({ notification, onClose, onUpdate }) => {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const axiosInstance = useVeYooAxios();

  useEffect(() => {
    const markAsRead = async () => {
      if (!notification.isRead) {
        try {
          const response = await axiosInstance.put(`/notifications/my/${notification.id}/`, {
            notification_status: 'read',
          });
          if (response.status === 200) {
            const updatedNotification = response.data.notification;
            onUpdate(updatedNotification);
          }
        } catch (err) {
          setIsSuccess(false);
          setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2000);
        } finally {
         
        }
      }
    };
    markAsRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'Alert':
        return <AlertTriangle className={`h-6 w-6 ${priority === 'High' ? 'text-red-500' : 'text-orange-500'}`} />;
      case 'Reservation':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'System':
        return <Info className="h-6 w-6 text-gray-500" />;
      case 'Announcement':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatTime(notification.createdAt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
       {showMessage && <Message isSuccess={isSuccess} message={message} />}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails de la notification
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Notification Header */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.type === 'Alert' ? 'Alerte' :
                     notification.type === 'System' ? 'Système' :
                     notification.type === 'Announcement' ? 'Annonce' :
                     notification.type === 'Reservation' ? 'Réservation' : notification.type}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    notification.isRead 
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                  }`}>
                    {notification.isRead ? 'Lue' : 'Non lue'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Message</h5>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Notification Details */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Destinataire</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Utilisateur : {notification.recipient}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Date d'envoi</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {date} à {time}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Informations système
              </h5>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{notification.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white">{notification.type}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;