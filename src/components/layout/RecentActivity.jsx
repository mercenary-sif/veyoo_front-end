import React, { useState, useEffect } from 'react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, ErrorGetData } from '../../components/export';
import {
  Calendar,
  AlertTriangle,
  MessageSquare,
  Clock,
 
} from 'lucide-react';

// Helper: normalize text for comparisons
const norm = (s) => (s || '').toString().trim().toLowerCase();

// Map activity type -> icon + color classes
const TYPE_META = {
  reservation: {
    label: 'Réservation',
    Icon: Calendar,
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-300',
  },
  malfunction: {
    label: 'Dysfonctionnement',
    Icon: AlertTriangle,
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  ticket: {
    label: 'Ticket',
    Icon: MessageSquare,
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
  },
  default: {
    label: 'Activité',
    Icon: Clock,
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
};

// Map common statuses (case-insensitive) to a badge (label + classes)
const STATUS_META = (type) => {
  // reservation statuses
  const res = {
    pending: { label: 'En attente', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
    accepted: { label: 'Approuvée', bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
    declined: { label: 'Refusée', bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300' },
    completed: { label: 'Terminée', bg: 'bg-gray-100 dark:bg-gray-800/20', text: 'text-gray-700 dark:text-gray-300' },
  };

  // malfunction / ticket statuses
  const mal = {
    reported: { label: 'Signalé', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
    'in progress': { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
    in_progress: { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
    resolved: { label: 'Résolu', bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
    open: { label: 'Ouvert', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
  };

  return { ...res, ...mal };
};

const formatCreatedAt = (raw) => {
  try {
    const d = raw ? new Date(raw) : new Date();
    return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return raw || '—';
  }
};

const RecentActivity = ({ limit = 8}) => {
  const VeYooAxios = useVeYooAxios();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await VeYooAxios.get('/recent-activity/', { params: { limit } });
        if (resp.status === 200 && !cancelled) {
          setActivities(Array.isArray(resp.data.activity) ? resp.data.activity : []);
        } else if (!cancelled) {
          setError('Aucune activité récente disponible');
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response && err.response.data && err.response.data.message) setError(err.response.data.message);
          else if (err.request) setError('Erreur de connexion au serveur');
          else setError(err.message || 'Une erreur est survenue');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRecentActivity();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h3>
        </div>
        <div className="p-6"><Loading loading_txt={"Chargement de l'activité récente..."} /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h3>
        </div>
        <div className="p-6"><ErrorGetData error={error} /></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente.</div>
          )}

          {activities.map((a) => {
            const typeKey = norm(a.type) || 'default';
            const meta = TYPE_META[typeKey] || TYPE_META.default;
            const TypeIcon = meta.Icon || Clock;
            const statusKey = norm(a.status || '');
            const statusMeta = STATUS_META()[statusKey] || null;
            const statusLabel = statusMeta?.label || (a.status || '—');

            // Build a compact subtitle (prefer subtitle then purpose)
            const subtitle = a.subtitle || a.purpose || '';

            return (
              <div key={a.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full flex-shrink-0 ${meta.bg}`} title={meta.label}>
                  <TypeIcon className={`h-5 w-5 ${meta.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {a.title || '—'}
                      </p>
                      {subtitle ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {subtitle}
                        </p>
                      ) : null}

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {/* Type pill */}
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>

                        {/* Status pill */}
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${statusMeta ? statusMeta.bg : 'bg-gray-100 dark:bg-gray-700'} ${statusMeta ? statusMeta.text : 'text-gray-600 dark:text-gray-300'}`}>
                          {statusLabel}
                        </span>

                        {/* entity id if present */}
                        {a.entity_id && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">ID: {a.entity_id}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatCreatedAt(a.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
