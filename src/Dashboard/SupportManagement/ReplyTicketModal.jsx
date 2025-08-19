import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Paperclip } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, Message } from '../../components/export';

const ReplyTicketModal = ({ ticket, onClose, onSendReply }) => {
  const VeYooAxios = useVeYooAxios();
  const fileInputRef = useRef(null);

  // config
  const maxFiles = 5;
  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  // state
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]); // Array<File>
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);

  // reset when ticket changes or modal closes
  useEffect(() => {
    setText('');
    setAttachments([]);
    setErrors({});
    setShowMessage(false);
    setMessageText('');
    setMessageSuccess(false);
  }, [ticket]);

  const validate = () => {
    const newErrors = {};
    const trimmed = (text || '').trim();
    if (!trimmed) newErrors.text = 'Le message est requis';
    else if (trimmed.length < 10) newErrors.text = 'Le message doit contenir au moins 10 caractères';

    if (attachments.length > maxFiles) newErrors.attachments = `Maximum ${maxFiles} fichiers`;
    const oversized = attachments.filter(f => f.size > maxFileSize);
    if (oversized.length > 0) newErrors.attachments = `Chaque fichier doit être ≤ ${Math.round(maxFileSize / 1024 / 1024)} Mo`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const combined = [...attachments, ...files];
    if (combined.length > maxFiles) {
      setErrors(prev => ({ ...prev, attachments: `Maximum ${maxFiles} fichiers` }));
      // keep up to maxFiles (drop extras)
      setAttachments(combined.slice(0, maxFiles));
    } else {
      const oversized = files.some(f => f.size > maxFileSize);
      if (oversized) {
        setErrors(prev => ({ ...prev, attachments: `Chaque fichier doit être ≤ ${Math.round(maxFileSize / 1024 / 1024)} Mo` }));
      } else {
        setErrors(prev => ({ ...prev, attachments: undefined }));
      }
      setAttachments(combined.slice(0, maxFiles));
    }

    // clear native input so same file can be chosen again if removed
    e.target.value = '';
  };

  const removeAttachmentAt = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, attachments: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!ticket || !ticket.id) {
      setMessageText('Ticket invalide');
      setMessageSuccess(false);
      setShowMessage(true);
      return;
    }

    setIsLoading(true);
    setShowMessage(false);

    try {
      const body = new FormData();
      body.append('message', text.trim());
      // append files
      attachments.forEach((f) => body.append('attachments', f, f.name));

      // Note: Do not set Content-Type header; axios will set multipart boundary.
      const resp = await VeYooAxios.post(`/support/tickets/${ticket.id}/replies/`, body);

      // Accept response.data.reply or response.data
      const created = resp.data?.reply ?? resp.data ?? null;
      setIsLoading(false);
      setMessageText('Réponse envoyée avec succès');
      setMessageSuccess(true);
      setShowMessage(true);

      // call parent callback with created reply (if available) + fallback
      const fallbackReply = {
        id: created?.id ?? Math.floor(Date.now() / 1000),
        message: text.trim(),
        author: created?.author ?? { username: 'Support' },
        created_at: created?.created_at ?? new Date().toISOString(),
        attachments: created?.attachments ?? attachments.map(f => ({ name: f.name })),
      };
      

      // close after a short delay so user sees success
      setTimeout(() => {
        
        onSendReply && onSendReply(created ?? fallbackReply);
        onClose && onClose();
      }, 1000);
    } catch (err) {
      const resp = err?.response;
      setIsLoading(false);
      const userMsg =
        resp?.data?.message ||
        resp?.data?.error ||
        err?.message ||
        "Erreur lors de l'envoi de la réponse";
      setMessageText(userMsg);
      setMessageSuccess(false);
      setShowMessage(true);
      // auto-hide message after a while
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  const handleClose = () => {
    // reset local state then close
    setText('');
    setAttachments([]);
    setErrors({});
    setShowMessage(false);
    setMessageText('');
    onClose && onClose();
  };

  return (
    <>
  
      <div className="fixed inset-0 z-50 overflow-y-auto">
            {isLoading && <Loading loading_txt="Envoi de la réponse en cours..." />}
      {showMessage && <Message isSuccess={messageSuccess} message={messageText} />}
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
          {/* dark overlay */}
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

          {/* modal */}
          <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Répondre au ticket</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ticket summary */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ticket concerné</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500 dark:text-gray-400">ID:</span> {ticket?.id}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Titre:</span> {ticket?.title}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Créé par:</span> {ticket?.createdBy?.username ?? '-'}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Type:</span> {ticket?.type === 'complaint' ? 'Plainte' : 'Problème'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Votre réponse *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                    errors.text ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Tapez votre réponse ici..."
                />
                {errors.text && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.text}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{(text || '').length}/2000 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pièces jointes (optionnel)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Ajouter des fichiers</span>
                  </button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max {maxFiles} fichiers, {Math.round(maxFileSize / 1024 / 1024)} Mo chacun</div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFilePick}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />

                {errors.attachments && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.attachments}</p>}

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs">{f.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{Math.round(f.size / 1024)} KB</div>
                          <button type="button" onClick={() => removeAttachmentAt(idx)} className="text-red-500 hover:text-red-700 p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {text.trim() && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Aperçu de la réponse</h5>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Support</div>
                        <div className="text-sm text-blue-700 dark:text-blue-400 mt-1 whitespace-pre-wrap">{text}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>{isLoading ? 'Envoi...' : 'Envoyer la réponse'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReplyTicketModal;
