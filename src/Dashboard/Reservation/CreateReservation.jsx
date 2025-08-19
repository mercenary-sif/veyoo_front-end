// src/components/reservations/CreateReservationModal.jsx
import { useState, useEffect } from 'react';
import { X, Calendar, User as UserIcon, Package, FileText, AlertTriangle, Clock } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message, Loading } from '../../components/export';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const CreateReservationModal = ({ isOpen, onClose, onSubmit, users: propUsers = [], assets: propAssets = [], existingReservations = [] }) => {
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
  const [users, setUsers] = useState(propUsers || []);
  const [assets, setAssets] = useState(propAssets || []);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [errors, setErrors] = useState({});
  const [endDateDisabled, setEndDateDisabled] = useState(false);

  // UI / action states
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const axiosInstance = useVeYooAxios();

  // Helper to show fetch error to user (called on focus)
  const showFetchError = () => {
    if (fetchError) {
      setMessage(fetchError);
      setIsSuccess(false);
      setShowMessage(true);
      // hide toast after a while
      setTimeout(() => setShowMessage(false), 3500);
    }
  };

  // Helper: split date/time from either date-only or ISO datetime
  const splitDateTime = (value) => {
    if (!value) return { date: '', time: '' };
    const iso = value.includes('T') ? value : `${value}T00:00:00`;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '', time: '' };
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0]; // HH:MM:SS
    return { date, time };
  };

  // Helper: combine date + time into ISO string for UI mapping
  const combineDateTime = (date, time) => {
    if (!date) return '';
    if (!time) return date;
    return new Date(`${date}T${time}`).toISOString();
  };

  // Map API status -> friendly
  const mapStatus = (apiStatus) => {
    if (!apiStatus) return '';
    switch (apiStatus.toString().toLowerCase()) {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch users and assets if parent didn't provide them
  useEffect(() => {
    let isMounted = true;
    const fetchLists = async () => {
      // if parent provided both lists, skip fetching
      if ((propUsers && propUsers.length > 0) && (propAssets && propAssets.length > 0)) {
        // still recalc available assets on mount
        recalcAvailableAssets(propAssets);
        return;
      }

      setFetchLoading(true);
      setFetchError(null);

      try {
        // Fetch users if parent didn't pass them
        if (!propUsers || propUsers.length === 0) {
          const usersResp = await axiosInstance.get('/auth/user-list/');
          if (usersResp.status === 200 && isMounted) {
            const fetchedUsers = usersResp.data?.users || [];
            setUsers(fetchedUsers);
          }
        } else if (propUsers && propUsers.length > 0 && isMounted) {
          // Ensure local users state matches prop initially
          setUsers(propUsers);
        }

        // Fetch assets if parent didn't pass them
        if (!propAssets || propAssets.length === 0) {
          const assetsResp = await axiosInstance.get('/materials/all/');
          if (assetsResp.status === 200 && isMounted) {
            // backend returns vehicles/tools arrays; merge them
            const vehicles = assetsResp.data?.vehicles || [];
            const tools = assetsResp.data?.tools || [];
            const merged = [...vehicles, ...tools];
            setAssets(merged);
            recalcAvailableAssets(merged);
          }
        } else if (propAssets && propAssets.length > 0 && isMounted) {
          setAssets(propAssets);
          recalcAvailableAssets(propAssets);
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err?.response?.data?.message || 'Erreur lors de la récupération des données');
        }
      } finally {
        if (isMounted) setFetchLoading(false);
      }
    };

    fetchLists();
    return () => { isMounted = false; };
    // only run on mount or when prop arrays change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosInstance, propUsers, propAssets]);

  // When parent props change (if they do) keep local state in sync
  useEffect(() => {
    if (propUsers && propUsers.length > 0) setUsers(propUsers);
  }, [propUsers]);

  useEffect(() => {
    if (propAssets && propAssets.length > 0) {
      setAssets(propAssets);
      recalcAvailableAssets(propAssets);
    }
  }, [propAssets]);

  // Compute available assets (tolerant to various status shapes)
  const recalcAvailableAssets = (assetList) => {
    const available = (assetList || []).filter((asset) => {
      const status = String(asset?.status ?? '').trim().toLowerCase();
      // accept multiple possible backend/language values
      const goodStatuses = ['good', 'bon', 'available', 'disponible'];
      // also allow explicit reservation status fields if present
      const reservationStatus = String(asset?.reservationStatus ?? '').trim().toLowerCase();
      return goodStatuses.includes(status) && reservationStatus !== 'reserved' && reservationStatus !== 'not_available';
    });
    setAvailableAssets(available);
  };

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

  // Conflicts check — show assigned user's name (falling back to several common shapes)
  useEffect(() => {
    const checkConflicts = () => {
      if (!formData.assetId || !formData.startDate || !formData.endDate) return;

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      const conflictingReservations = (existingReservations || []).filter((reservation) => {
        // robust asset id extraction (handles many possible shapes)
        const resAssetId = Number(
          reservation.assetId ??
          reservation.asset?.id ??
          reservation.material?.id ??
          reservation.asset_id ??
          reservation.material_id ??
          0
        );

        if (resAssetId !== Number(formData.assetId)) return false;

        const status = (reservation.status || '').toString().toLowerCase();
        if (status === 'rejected' || status === 'declined') return false;

        // robust start/end extraction
        const resStartRaw = reservation.startDate ?? reservation.start_date ?? reservation.start_at ?? reservation.start ?? null;
        const resEndRaw = reservation.endDate ?? reservation.end_date ?? reservation.end_at ?? reservation.end ?? null;
        const resStart = resStartRaw ? new Date(resStartRaw) : null;
        const resEnd = resEndRaw ? new Date(resEndRaw) : null;

        // if dates are invalid, skip this reservation
        if (!resStart || Number.isNaN(resStart.getTime()) || !resEnd || Number.isNaN(resEnd.getTime())) return false;

        // overlap check
        return startDate <= resEnd && endDate >= resStart;
      });

      if (conflictingReservations.length > 0) {
        const conflictMessages = conflictingReservations.map((res) => {
          // Prefer the assigned user; try several common shapes
          const assignedName =
            res.assigned_to?.username ??
            res.assigned_to?.name ??
            res.assignedTo ??
            res.assigned_to_name ??
            res.assigned_to_username ??
            'utilisateur';

          const resStartRaw = res.startDate ?? res.start_date ?? res.start_at ?? res.start ?? null;
          const resEndRaw = res.endDate ?? res.end_date ?? res.end_at ?? res.end ?? null;
          const startLabel = resStartRaw ? new Date(resStartRaw).toLocaleDateString('fr-FR') : '—';
          const endLabel = resEndRaw ? new Date(resEndRaw).toLocaleDateString('fr-FR') : '—';

          return `Conflit avec la réservation ${res.id || 'ID ?'} (assignée à ${assignedName}) du ${startLabel} au ${endLabel}`;
        });
        setConflicts(conflictMessages);
      } else {
        setConflicts([]);
      }
    };

    if (formData.assetId && formData.startDate && formData.endDate) checkConflicts();
    else setConflicts([]);
  }, [formData.assetId, formData.startDate, formData.endDate, existingReservations]);

  // handlers for selects (ensure numeric ids)
  const handleUserChange = (userIdValue) => {
    const id = parseInt(userIdValue, 10) || '';
    const selectedUser = (users || []).find((user) => Number(user.id) === Number(id));
    setFormData((prev) => ({
      ...prev,
      assignedToId: id,
      assignedTo: selectedUser ? (selectedUser.name || selectedUser.username || selectedUser.email) : '',
    }));
  };

  const handleAssetChange = (assetIdValue) => {
    const id = parseInt(assetIdValue, 10) || '';
    const selectedAsset = (availableAssets || []).find((asset) => Number(asset.id) === Number(id));
    setFormData((prev) => ({
      ...prev,
      assetId: id,
      assetName: selectedAsset ? selectedAsset.name : '',
    }));
  };

  // validation
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
      const todayLocal = new Date();
      todayLocal.setHours(0, 0, 0, 0);
      if (startDate < todayLocal) newErrors.startDate = 'La date de début ne peut pas être dans le passé';
      if (endDate < startDate) newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    if (conflicts.length > 0) newErrors.conflicts = 'Il y a des conflits avec d\'autres réservations';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsConfirmationOpen(true);
  };

  // confirm create -> call API
  const confirmCreate = async () => {
    setIsConfirmationOpen(false);
    setIsActionLoading(true);
    try {
      const { date: startDate, time: startTime } = splitDateTime(formData.startDate);
      const { date: endDate, time: endTime } = splitDateTime(formData.endDate);

      const payload = {
        userId: Number(formData.assignedToId),
        assetId: Number(formData.assetId),
        startDate,
        start_time: startTime,
        endDate,
        end_time: endTime,
        purpose: String(formData.purpose).trim(),
        notes: String(formData.notes || '').trim(),
        reservationType: formData.reservationType || 'normal',
      };

      const response = await axiosInstance.post('/reservations/create-reservation/', payload);

      if (response.status === 200 || response.status === 201) {
        const resp = response.data || {};
        const createdBy = resp.created_by || {};

        const newReservation = {
          id: resp.id,
          assetName: (assets || []).find((a) => Number(a.id) === Number(formData.assetId))?.name || formData.assetName,
          assetId: Number(formData.assetId),
          assetType: (assets || []).find((a) => Number(a.id) === Number(formData.assetId))?.type,
          userName: createdBy.username || createdBy.name || '',
          userId: createdBy.id || null,
          assignedTo: (users || []).find((u) => Number(u.id) === Number(formData.assignedToId))?.name || formData.assignedTo,
          assignedToId: Number(formData.assignedToId),
          startDate: combineDateTime(resp.start_date || startDate, resp.start_time || startTime),
          endDate: combineDateTime(resp.end_date || endDate, resp.end_time || endTime),
          purpose: resp.purpose || payload.purpose,
          notes: resp.notes || payload.notes,
          reservationType: resp.reservation_type || payload.reservationType,
          status: mapStatus(resp.status),
          createdAt: resp.created_at,
          updatedAt: resp.updated_at,
        };

        // show server message
        setMessage(resp.message || 'Réservation créée avec succès');
        setIsSuccess(true);
        setShowMessage(true);

        // notify parent after a short delay so the user sees the message
        setTimeout(() => {
          onSubmit(newReservation);
          handleClose();
        }, 900);

      } else {
        setMessage(response.data?.message || 'Erreur lors de la création de la réservation');
        setIsSuccess(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la création de la réservation';
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
    setIsConfirmationOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  // --- NEW: filter users to show only inspectors (case-insensitive) and prefer active ones ---
  const inspectors = (users || []).filter((user) => {
    const roleVal = String(user.role || user.account_type || user.role_name || '').toLowerCase();
    const statusVal = String(user.status || '').toLowerCase();
    const isInspector = roleVal === 'inspector';
    const isActive = !statusVal || statusVal === 'active';
    return isInspector && isActive;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Message & Loading */}
      {showMessage && <Message isSuccess={isSuccess} message={message}/>}
      {(isActionLoading || fetchLoading) && <Loading loading_txt={fetchLoading ? 'Chargement des utilisateurs/actifs...' : 'Création de la réservation en cours...'} />}

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Créer une nouvelle réservation</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" disabled={isActionLoading}>
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
              <div className="grid grid-cols-3 gap-3">
                {['normal', 'saisonnier', 'annuel'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, reservationType: type }))}
                    className={`px-3 py-2 rounded-lg border ${formData.reservationType === type ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    disabled={isActionLoading}
                  >
                    {type === 'normal' ? 'Normal' : type === 'saisonnier' ? 'Saisonnier (3 mois)' : 'Annuel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned To - only inspectors */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Assigné à *</span>
              </label>
              <select
                value={formData.assignedToId || ''}
                onChange={(e) => handleUserChange(e.target.value)}
                onFocus={showFetchError}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.assignedToId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                disabled={isActionLoading || fetchLoading}
              >
                <option value="">Sélectionner un inspecteur</option>
                {inspectors.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username || user.email} {user.role ? `- ${user.role}` : ''} {user.email ? `(${user.email})` : ''}
                  </option>
                ))}
              </select>
              {errors.assignedToId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignedToId}</p>}
              {/* Inline fetch error helper for users */}
              {fetchError && (!users || users.length === 0) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Erreur lors du chargement des utilisateurs : {fetchError}</p>
              )}
              {/* If fetch succeeded but no inspectors found */}
              {!fetchLoading && inspectors.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  Aucun inspecteur disponible. Vérifiez la liste des utilisateurs ou contactez un administrateur.
                </p>
              )}
            </div>

            {/* Asset */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="h-4 w-4" />
                <span>Actif disponible *</span>
              </label>
              <select
                value={formData.assetId || ''}
                onChange={(e) => handleAssetChange(e.target.value)}
                onFocus={showFetchError}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.assetId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                disabled={isActionLoading || fetchLoading}
              >
                <option value="">Sélectionner un actif</option>
                {(availableAssets || []).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.id}) - {String(asset.type || '') === 'vehicle' ? 'Véhicule' : 'Équipement'}
                    {asset.model && ` - ${asset.model}`}
                  </option>
                ))}
              </select>
              {errors.assetId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assetId}</p>}
              {availableAssets.length === 0 && <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">Aucun actif disponible pour le moment</p>}
              {/* Inline fetch error helper for assets */}
              {fetchError && (!assets || assets.length === 0) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Erreur lors du chargement des actifs : {fetchError}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de début *</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  min={today}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  disabled={isActionLoading}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de fin *</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  disabled={endDateDisabled || isActionLoading}
                />
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
                      {conflicts.map((conflict, index) => <li key={index}>• {conflict}</li>)}
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
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                placeholder="Ex: Inspection site industriel, Maintenance équipements..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.purpose ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                disabled={isActionLoading}
              />
              {errors.purpose && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purpose}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4" />
                <span>Notes (optionnel)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isActionLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" disabled={isActionLoading}>Annuler</button>
              <button type="submit" disabled={conflicts.length > 0 || isActionLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isActionLoading ? 'Création...' : 'Créer la réservation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmCreate}
        message={`Êtes-vous sûr de vouloir créer cette réservation pour ${formData.assetName || 'cet actif'} ?`}
      />
    </div>
  );
};

export default CreateReservationModal;
