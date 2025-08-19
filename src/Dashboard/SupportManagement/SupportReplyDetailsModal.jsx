import React, { useEffect, useState } from 'react';
import { X, FileText, User, Calendar, Trash2, MessageSquare } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/**
 * Props:
 *  - reply: reply object as returned by _reply_to_dict
 *  - onClose: () => void
 *  - onDelete?: (reply) => void  // optional callback so parent can remove reply locally
 */
const SupportReplyDetailsModal = ({ reply = null, onClose, onDelete }) => {
  const VeYooAxios = useVeYooAxios();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);

  // prevent body scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev || 'auto'; };
  }, []);

  if (!reply) return null;

  const formatDate = (val) => {
    try {
      if (!val) return { date: '-', time: '' };
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

  const replyDate = formatDate(reply.created_at);
  const authorName = reply.author?.username || reply.author?.fullname || '-';

  const handleDelete = async () => {
    setConfirmOpen(false);
    setIsDeleting(true);
    setShowMessage(false);
    setMessage('');
    try {
      const resp = await VeYooAxios.delete(`/support/replies/${reply.id}/`);
      // API returns 204 on success in your spec, accept 200/204
      if (resp?.status === 204 || resp?.status === 200) {
        setMessage('Réponse supprimée avec succès');
        setMessageSuccess(true);
        setShowMessage(true);
        // notify parent to remove locally (if provided)
        try { typeof onDelete === 'function' && onDelete(reply); } catch (e) { /* ignore */ }
        // close modal after a short delay so user sees message
        setTimeout(() => {
          setShowMessage(false);
          onClose && onClose();
        }, 900);
      } else {
        setMessage(resp?.data?.message || 'Suppression : réponse inattendue du serveur');
        setMessageSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }
    } catch (err) {
      const userMsg = err?.response?.data?.message || err?.message || 'Erreur lors de la suppression';
      setMessage(userMsg);
      setMessageSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // stop clicks inside modal from closing (backdrop closes)
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* messages & loading */}
        {isDeleting && <Loading loading_txt="Suppression en cours..." />}
        {showMessage && <Message isSuccess={messageSuccess} message={message} />}

        {/* panel */}
        <div
          onClick={stopPropagation}
          className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg relative"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Détails de la réponse</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-md hover:opacity-95"
                title="Supprimer la réponse"
              >
                <Trash2 className="h-4 w-4 inline-block" /> <span className="sr-only">Supprimer</span>
              </button>

              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1" aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Reply header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {authorName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-white truncate">{authorName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Créé le {replyDate.date} à {replyDate.time}</p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{reply.updated_at ? `Mis à jour: ${formatDate(reply.updated_at).date}` : ''}</div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.message ?? '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {Array.isArray(reply.attachments) && reply.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Pièces jointes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {reply.attachments.map((att, idx) => {
                    const href = att.base64 || att.url || '#';
                    const name = att.file_name || `Fichier-${idx+1}`;
                    return (
                      <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden p-3 bg-gray-50 dark:bg-gray-700">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.file_name}
                          className="flex items-center gap-3"
                          title={name}
                        >
                          <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-gray-900 dark:text-white truncate max-w-[18rem]">{name}</div>
                            {att.uploaded_at && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(att.uploaded_at).toLocaleDateString('fr-FR')}</div>}
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Auteur</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{authorName}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date de création</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{replyDate.date} à {replyDate.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirmation */}
        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          message="Êtes-vous sûr de vouloir supprimer cette réponse ?"
        />
      </div>
    </div>
  );
};

export default SupportReplyDetailsModal;
