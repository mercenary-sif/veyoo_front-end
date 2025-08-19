import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User as UserIcon, Package, FileText, AlertTriangle, Clock } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UpdateReservationModal = ({
  isOpen,
  onClose,
  onSubmit,
  reservation,
  users = [],
  assets = [],
  existingReservations = [],
  isLoading = false,
}) => {
  const axiosInstance = useVeYooAxios();

  const [formData, setFormData] = useState({
    assignedToId: '',
    assignedTo: '',
    assetId: '',
    assetName: '',
    startDate: '',
    endDate: '',
    purpose: '',
    notes: '',
    reservationType: 'normal',
  });
  const [availableAssets, setAvailableAssets] = useState([]);
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [endDateDisabled, setEndDateDisabled] = useState(false);

  // UI states
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);

  // Helper: split date/time from either date-only or ISO datetime
  const splitDateTime = (value) => {
    if (!value) return { date: '', time: '' };
    const iso = value.includes('T') ? value : `${value}T00:00:00`;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '', time: '' };
    // Use local date components to avoid UTC shift
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    return { date, time };
  };

  // Combine date and time into a date-only string or date+time string
  const combineDateTime = (date, time) => {
    if (!date) return '';
    // Return date as-is for API payload (YYYY-MM-DD)
    if (!time) return date;
    // Combine date and time without UTC conversion
    return `${date}T${time}`;
  };

  // Map API status -> friendly
  const mapStatus = (apiStatus) => {
    if (!apiStatus) return '';
    switch (String(apiStatus).toLowerCase()) {
      case 'accepted':
      case 'approved':
        return 'Approved';
      case 'declined':
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return apiStatus;
    }
  };

  // Reverse map component status -> API status
  const reverseMapStatus = (componentStatus) => {
    switch (componentStatus) {
      case 'Approved':
        return 'accepted';
      case 'Rejected':
        return 'declined';
      case 'Pending':
        return 'pending';
      default:
        return componentStatus;
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialize form with reservation data
  useEffect(() => {
    if (reservation) {
      const { date: startDate} = splitDateTime(reservation.startDate);
      const { date: endDate } = splitDateTime(reservation.endDate);
      setFormData({
        assignedToId: reservation.assignedToId != null ? String(reservation.assignedToId) : '',
        assignedTo: reservation.assignedTo || '',
        assetId: reservation.assetId != null ? String(reservation.assetId) : '',
        assetName: reservation.assetName || '',
        startDate: startDate || '',
        endDate: endDate || '',
        purpose: reservation.purpose || '',
        notes: reservation.notes || '',
        reservationType: reservation.reservationType || 'normal',
      });
    }
  }, [reservation]);

  // Build available assets
  useEffect(() => {
    const available = (assets || []).filter((asset) => {
      const status = String(asset?.status ?? '').trim().toLowerCase();
      const reservation = String(asset?.reservationStatus ?? '').trim().toLowerCase();

      const goodStatuses = ['good', 'bon'];
      const availableReservations = ['available', 'disponible'];

      return goodStatuses.includes(status) && availableReservations.includes(reservation);
    });
    setAvailableAssets(available);
  }, [assets]);

  // Auto end date based on reservationType
  useEffect(() => {
    if (formData.reservationType === 'annuel' && formData.startDate) {
      const start = new Date(formData.startDate);
      const endDate = new Date(start);
      endDate.setFullYear(endDate.getFullYear() + 1);
      setFormData((prev) => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }));
      setEndDateDisabled(true);
    } else if (formData.reservationType === 'saisonnier' && formData.startDate) {
      const start = new Date(formData.startDate);
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + 3);
      setFormData((prev) => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }));
      setEndDateDisabled(true);
    } else {
      setEndDateDisabled(false);
    }
  }, [formData.reservationType, formData.startDate]);

  // Conflict-checking
  const checkConflicts = useCallback(() => {
    if (!formData.assetId || !formData.startDate || !formData.endDate || !Array.isArray(existingReservations))
      return;
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const conflictingReservations = (existingReservations || []).filter((res) => {
      if (!reservation) return false;
      if (Number(res.id) === Number(reservation.id)) return false;
      const resAssetId = Number(res.assetId || res.asset?.id || res.material?.id);
      if (resAssetId !== Number(formData.assetId)) return false;
      if ((String(res.status || '').toLowerCase()) === 'rejected') return false;
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      return startDate <= resEnd && endDate >= resStart;
    });

    if (conflictingReservations.length > 0) {
      const conflictMessages = conflictingReservations.map(
        (res) =>
          `Conflit avec la réservation ${res.id} (${res.userName || res.created_by?.username || 'utilisateur'}) du ${new Date(
            res.startDate
          ).toLocaleDateString('fr-FR')} au ${new Date(res.endDate).toLocaleDateString('fr-FR')}`
      );
      setConflicts(conflictMessages);
    } else {
      setConflicts([]);
    }
  }, [formData.assetId, formData.startDate, formData.endDate, existingReservations, reservation]);

  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  // Handlers
  const handleUserChange = (userIdValue) => {
    const id = parseInt(userIdValue, 10) || '';
    const selectedUser = (users || []).find((u) => Number(u.id) === Number(id));
    setFormData((prev) => ({
      ...prev,
      assignedToId: selectedUser?.id ? String(selectedUser.id) : '',
      assignedTo: selectedUser ? selectedUser.name : '',
    }));
  };

  const handleAssetChange = (assetIdValue) => {
    const id = parseInt(assetIdValue, 10) || '';
    const selectedAsset = (availableAssets || []).find((a) => Number(a.id) === Number(id)) || (assets || []).find((a) => Number(a.id) === Number(id));
    setFormData((prev) => ({
      ...prev,
      assetId: id ? String(id) : '',
      assetName: selectedAsset ? selectedAsset.name : '',
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.assignedToId) newErrors.assignedToId = 'Veuillez sélectionner un utilisateur assigné';
    if (!formData.assetId) newErrors.assetId = 'Veuillez sélectionner un actif';
    if (!formData.startDate) newErrors.startDate = 'Veuillez sélectionner une date de début';
    if (!formData.endDate) newErrors.endDate = 'Veuillez sélectionner une date de fin';
    if (!String(formData.purpose || '').trim()) newErrors.purpose = "Veuillez indiquer l'objet de la réservation";
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) newErrors.startDate = 'La date de début ne peut pas être dans le passé';
      if (endDate < startDate) newErrors.endDate = 'La date de fin doit être après la date de début';
    }
    if (conflicts.length > 0) newErrors.conflicts = 'Il y a des conflits avec d\'autres réservations';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmUpdate(true);
  };

  // Confirm update -> API call
  const confirmUpdate = async () => {
    setShowConfirmUpdate(false);
    setIsActionLoading(true);
    try {
      // Use formData dates directly to avoid UTC conversion
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const startTime = '00:00:00'; // Default time if not provided
      const endTime = '00:00:00'; // Default time if not provided

      // Keep original created-by user id if present on reservation
      const payload = {
        userId: formData.assignedToId ? Number(formData.assignedToId) : undefined,
        assetId: Number(formData.assetId),
        startDate,
        start_time: startTime,
        endDate,
        end_time: endTime,
        purpose: String(formData.purpose).trim(),
        notes: String(formData.notes || '').trim(),
        reservationType: formData.reservationType || 'normal',
        status: reverseMapStatus(reservation.status),
      };

      const response = await axiosInstance.put(`/reservations/update-reservation/${reservation.id}/`, payload);

      if (response.status === 200 || response.status === 201) {
        const resp = response.data || {};
        const updatedReservation = {
          ...reservation,
          assetName: (assets || []).find((a) => Number(a.id) === Number(formData.assetId))?.name || formData.assetName,
          assetId: Number(formData.assetId),
          assetType: (assets || []).find((a) => Number(a.id) === Number(formData.assetId))?.type || reservation.assetType,
          assignedTo: (users || []).find((u) => Number(u.id) === Number(formData.assignedToId))?.name || formData.assignedTo,
          assignedToId: Number(formData.assignedToId),
          startDate: resp.start_date ? combineDateTime(resp.start_date, resp.start_time) : startDate,
          endDate: resp.end_date ? combineDateTime(resp.end_date, resp.end_time) : endDate,
          purpose: resp.purpose || payload.purpose,
          notes: resp.notes || payload.notes,
          reservationType: resp.reservation_type || payload.reservationType,
          status: mapStatus(resp.status),
          updatedAt: resp.updated_at || reservation.updatedAt,
        };

        setMessage(resp.message || 'Réservation mise à jour avec succès');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => {
          onSubmit(updatedReservation);
        }, 2000);
      } else {
        setMessage(response.data?.message || 'Erreur lors de la mise à jour de la réservation');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la mise à jour de la réservation';
      setMessage(errorMsg);
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      assignedToId: '',
      assignedTo: '',
      assetId: '',
      assetName: '',
      startDate: '',
      endDate: '',
      purpose: '',
      notes: '',
      reservationType: 'normal',
    });
    setErrors({});
    setConflicts([]);
    setShowConfirmUpdate(false);
    onClose();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && <Message isSuccess={isSuccess} message={message} isModal={true} />}
      {isActionLoading && <Loading loading_txt={'Mise à jour de la réservation en cours...'} />}

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier la réservation</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" disabled={isLoading || isActionLoading}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reservation Type */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4" />
                <span>Type de réservation</span>
              </label>
              <select value={formData.reservationType} onChange={(e) => setFormData((prev) => ({ ...prev, reservationType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isLoading || isActionLoading}>
                <option value="normal">Normal</option>
                <option value="saisonnier">Saisonnier (3 mois)</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>

            {/* Created By (read-only) */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Créé par</span>
              </label>
              <div className="flex items-center space-x-3 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium">
                  {reservation?.userName ? reservation.userName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase()).join('') : 'N/A'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{reservation?.userName || 'Utilisateur inconnu'}</p>
                  {reservation?.userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{reservation.userEmail}</p>}
                </div>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Assigné à *</span>
              </label>
              <select value={formData.assignedToId} onChange={(e) => handleUserChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.assignedToId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} disabled={isLoading || isActionLoading}>
                <option value="">Sélectionner un utilisateur</option>
                {(users || []).filter(u => String(u.status || '').toLowerCase() === 'active').map(user => (
                  <option key={user.id} value={user.id}>{user.name} - {user.role} ({user.email})</option>
                ))}
              </select>
              {errors.assignedToId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignedToId}</p>}
              {(users || []).length === 0 && <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">Aucun utilisateur disponible pour le moment</p>}
            </div>

            {/* Asset */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="h-4 w-4" />
                <span>Actif disponible *</span>
              </label>
              <select value={formData.assetId} onChange={(e) => handleAssetChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.assetId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} disabled={isLoading || isActionLoading}>
                <option value="">Sélectionner un actif</option>
                {(availableAssets || []).map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.id}) - {String(asset.type || '').toLowerCase() === 'véhicule' ? 'Véhicule' : 'Équipement'}{asset.model ? ` - ${asset.model}` : ''}
                  </option>
                ))}
                {/* Also allow existing asset */}
                {formData.assetId && !availableAssets.find(a => String(a.id) === String(formData.assetId)) && assets.find(a => String(a.id) === String(formData.assetId)) && (
                  <option value={formData.assetId}>
                    {(assets.find(a => String(a.id) === String(formData.assetId))?.name) || formData.assetName} ({formData.assetId})
                  </option>
                )}
              </select>
              {errors.assetId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assetId}</p>}
              {(availableAssets || []).length === 0 && <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">Aucun actif disponible pour le moment</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de début *</span>
                </label>
                <input type="date" value={formData.startDate} min={today} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} disabled={isLoading || isActionLoading} />
                {errors.startDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de fin *</span>
                </label>
                <input type="date" value={formData.endDate} min={formData.startDate || today} onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} disabled={endDateDisabled || isLoading || isActionLoading} />
                {errors.endDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
              </div>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Conflits détectés</h4>
                    <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                      {conflicts.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4" />
                <span>Objet de la réservation *</span>
              </label>
              <input type="text" value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} placeholder="Ex: Inspection site industriel, Maintenance..." className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.purpose ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} disabled={isLoading || isActionLoading} />
              {errors.purpose && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purpose}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4" />
                <span>Notes (optionnel)</span>
              </label>
              <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Informations complémentaires..." rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" disabled={isLoading || isActionLoading} />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" disabled={isLoading || isActionLoading}>Annuler</button>
              <button type="submit" disabled={conflicts.length > 0 || isLoading || isActionLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isActionLoading ? 'Mise à jour...' : 'Mettre à jour la réservation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmUpdate}
        onClose={() => setShowConfirmUpdate(false)}
        onConfirm={confirmUpdate}
        message={`Êtes-vous sûr de vouloir mettre à jour la réservation ${reservation?.id || ''} pour ${formData.assetName || 'cet actif'} ?`}
      />
    </div>
  );
};

export default UpdateReservationModal;