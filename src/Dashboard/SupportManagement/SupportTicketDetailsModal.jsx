import React, { useEffect } from 'react';
import {
  X,
  FileText,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';

/**
 * SupportTicketDetailsModal
 *
 * Props:
 *  - ticket: object (see _ticket_to_dict output)
 *  - onClose: function
 *  - onOpenReplies?: function(ticket)  // optional callback parent can pass to open replies modal
 */
const SupportTicketDetailsModal = ({ ticket = null, onClose, onOpenReplies }) => {
  // prevent background scroll when modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev || 'auto'; };
  }, []);

  if (!ticket) return null;

  const safeDate = (val) => {
    try {
      if (!val) return { date: '-', time: '-' };
      const d = new Date(val);
      if (isNaN(d.getTime())) return { date: val, time: '' };
      return {
        date: d.toLocaleDateString('fr-FR'),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: val || '-', time: '' };
    }
  };

  const created = safeDate(ticket.created_at);
  const updated = safeDate(ticket.updated_at);

  const getTypeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'complaint') return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
    if (t === 'issue') return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const getPriorityColor = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    if (p === 'medium') return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
    if (p === 'low') return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (s === 'in progress' || s === 'in-progress') return <Clock className="h-5 w-5 text-blue-500" />;
    if (s === 'open') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <HelpCircle className="h-5 w-5 text-gray-500" />;
  };

  const replies = Array.isArray(ticket.replies) ? ticket.replies : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* panel */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Détails du ticket {ticket.id ?? ''}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1" aria-label="Fermer">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header card */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{ticket.title ?? '-'}</h4>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(ticket.type)}`}>
                      {ticket.type === 'complaint' ? 'Plainte' : ticket.type === 'issue' ? 'Problème' : (ticket.type ?? '-')}
                    </span>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ticket.status ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' : ''}`}>
                        {ticket.status ?? '-'}
                      </span>
                    </div>

                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority ?? '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Description</h5>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {ticket.description ?? '-'}
                </p>
              </div>
            </div>

            {/* Grid: created/assigned/updated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Créé par</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.created_by?.username ?? '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date de création</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{created.date} à {created.time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {ticket.assigned_to && (
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Assigné à</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.assigned_to?.username ?? '-'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière mise à jour</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{updated.date} à {updated.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Pièces jointes</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.attachments.map((att, i) => {
                    const href = att.base64 || att.url || '#';
                    const name = att.file_name || `Fichier-${i + 1}`;
                    return (
                      <div
                        key={i}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex items-center justify-center p-4"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.file_name}
                          className="flex flex-col items-center justify-center w-full"
                          title={name}
                        >
                          <FileText className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-300 truncate w-full block text-center max-w-[14rem]">
                            {name}
                          </span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Replies list preview */}
            {replies.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Réponses ({replies.length})</h5>
                <div className="space-y-3">
                  {replies.map((r) => {
                    const rDate = safeDate(r.created_at);
                    const isSupport = (r.author?.username ?? '').toLowerCase().includes('support');
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-lg border ${isSupport ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className={`h-5 w-5 mt-0.5 ${isSupport ? 'text-blue-500' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.author?.username ?? '-'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{rDate.date} à {rDate.time}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.message ?? '-'}</p>

                            {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                              <div className="mt-2 text-xs">
                                {r.attachments.map((a, idx) => (
                                  <a
                                    key={idx}
                                    href={a.base64 || a.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block truncate text-blue-600"
                                    title={a.file_name}
                                  >
                                    {a.file_name ?? `Fichier-${idx + 1}`}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => typeof onOpenReplies === 'function' ? onOpenReplies(ticket) : null}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Voir la liste des réponses</span>
                  </button>
                </div>
              </div>
            )}

            {/* System info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Informations système</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Catégorie:</span><span className="text-gray-900 dark:text-white">{ticket.category ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Type:</span><span className="text-gray-900 dark:text-white">{ticket.type ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Priorité:</span><span className="text-gray-900 dark:text-white">{ticket.priority ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Statut:</span><span className="text-gray-900 dark:text-white">{ticket.status ?? '-'}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailsModal;
