import React, { useEffect, useState } from 'react';
import { Calendar, FileText, MessageSquare, Eye, X } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, ErrorGetData } from '../../components/export';

const ReplyListModal = ({ isOpen, onClose, ticket, onSelectReply, onRefresh }) => {
  const VeYooAxios = useVeYooAxios();
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const safeDateTime = (val) => {
    try {
      if (!val) return '—';
      return new Date(val).toLocaleString('fr-FR');
    } catch {
      return val;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setReplies([]);
      setError(null);
      return;
    }
    if (!ticket || !ticket.id) {
      setReplies([]);
      setError('Ticket invalide');
      return;
    }

    const controller = new AbortController();
    const fetchReplies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await VeYooAxios.get(`/support/tickets/${ticket.id}/replies/`, {
          signal: controller.signal,
        });
        const dataReplies = Array.isArray(resp.data)
          ? resp.data
          : resp.data?.replies ?? resp.data?.ticket?.replies ?? [];
        setReplies(dataReplies || []);
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
        if (isCanceled) return;
        setError(err?.response?.data?.message || err?.message || 'Erreur lors de la récupération des réponses');
        setReplies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Réponses — {ticket?.title || '-'}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Liste des réponses associées au ticket</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onRefresh) onRefresh();
                (async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const resp = await VeYooAxios.get(`/support/tickets/${ticket.id}/replies/`);
                    const dataReplies = Array.isArray(resp.data) ? resp.data : resp.data?.replies ?? resp.data?.ticket?.replies ?? [];
                    setReplies(dataReplies || []);
                  } catch (e) {
                    if (!(e?.name === 'AbortError')) {
                      setError(e?.response?.data?.message || e?.message || 'Erreur');
                    }
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:opacity-95"
            >
              Rafraîchir
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[70vh] overflow-auto">
          {isLoading ? (
            <div className="py-8">
              <Loading loading_txt="Chargement des réponses..." />
            </div>
          ) : error ? (
            <div className="py-8">
              <ErrorGetData error={error} />
            </div>
          ) : (!replies || replies.length === 0) ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune réponse pour ce ticket</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => {
                const name = reply?.author?.username || reply?.author?.fullname || '—';
                const initials = (name || '—').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
                const hasAttachments = Array.isArray(reply.attachments) && reply.attachments.length > 0;

                return (
                  <div key={reply.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">{initials || '—'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{(reply.message || '').substring(0, 120)}{(reply.message || '').length > 120 ? '…' : ''}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div>Le {safeDateTime(reply.created_at)}</div>
                              {reply.updated_at && <div>Mis à jour: {safeDateTime(reply.updated_at)}</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-start md:justify-end">
                            {hasAttachments && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span>{reply.attachments.length} fichier(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof onSelectReply === 'function') {
                              onSelectReply(reply);
                            }
                          }}
                          title="Détails"
                          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md hover:opacity-95 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ReplyListModal;