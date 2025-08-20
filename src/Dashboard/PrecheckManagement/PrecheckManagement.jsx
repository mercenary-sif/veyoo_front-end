import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import SendMessageModal from './SendMessageModal';
import PrecheckDetails from './PrecheckDetails';
import { mockMalfunctions } from '../../containers/data/mockData';
import { ErrorGetData, Loading } from '../../components/export';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/VEYoo_Logo.png';
import { 
  ClipboardCheck, 
  Calendar, 
  Car, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Eye,
  AlertCircle,
  Download,
  Wrench
} from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';

const PrecheckManagement = () => {
  const [prechecks, setPrechecks] = useState([]);
  const [malfunctions, setMalfunctions] = useState(mockMalfunctions);
  const [summary, setSummary] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    failed: 0
  });
  const [selectedPrecheck, setSelectedPrecheck] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const VeYooAxios = useVeYooAxios();

  // Fetch data from API
  useEffect(() => {
  let cancelled = false;
  const controller = new AbortController();

  const fetchPrechecks = async () => {
    setIsLoading(true);
    setError(null);
    setEmptyDataList(null);

    try {
      // use the instance (baseURL already configured there)
      const response = await VeYooAxios.get('/pre-checks/all-list/', {
        signal: controller.signal,
      });

      // normal 200 payload
      if (response?.status === 200) {
        const data = response.data ?? {};
        const list = Array.isArray(data['pre-checks'])
          ? data['pre-checks']
          : Array.isArray(data.pre_checks)
          ? data.pre_checks
          : [];

        const mappedPrechecks = list.map((precheck) => {
          const reservation = precheck?.reservation ?? {};
          const material = reservation?.material ?? {};
          const checkedBy = precheck?.checked_by ?? {};

          const items = [
            { id: 1, category: 'Vérification générale', item: 'Carrosserie', status: precheck.car_body_ok ? 'OK' : 'Critical', notes: precheck.car_body_ok ? '' : 'Carrosserie non conforme' },
            { id: 2, category: 'Vérification générale', item: 'Pneus', status: precheck.tires_ok ? 'OK' : 'Critical', notes: precheck.tires_ok ? '' : 'Pneus non conformes' },
            { id: 3, category: 'Vérification générale', item: 'Éclairage', status: precheck.lighting_ok ? 'OK' : 'Critical', notes: precheck.lighting_ok ? '' : 'Éclairage défectueux' },
            { id: 4, category: 'Vérification générale', item: 'Prochaine révision', status: precheck.next_service_within_1k ? 'OK' : 'Warning', notes: precheck.next_service_within_1k ? '' : 'Révision dans moins de 1000 km' },
            { id: 5, category: 'Vérification générale', item: 'Adblue', status: precheck.adblue_ok ? 'OK' : 'Critical', notes: precheck.adblue_ok ? '' : 'Niveau Adblue insuffisant' },
            { id: 6, category: 'Vérification générale', item: 'Voyants', status: precheck.no_warning_lights ? 'OK' : 'Critical', notes: precheck.no_warning_lights ? '' : 'Voyants allumés' },
            { id: 7, category: 'Vérification générale', item: 'Propreté', status: precheck.clean_vehicle ? 'OK' : 'Warning', notes: precheck.clean_vehicle ? '' : 'Véhicule non propre' },
            { id: 8, category: 'Vérification générale', item: 'Documents', status: precheck.docs_present ? 'OK' : 'Critical', notes: precheck.docs_present ? '' : 'Documents manquants' },
          ];

          const problemsFromItems = items
            .filter((it) => it.status !== 'OK')
            .map((it) => `${it.item}: ${it.notes}`)
            .join('; ');

          return {
            id: precheck.id,
            materialName: material.name || 'Unknown Material',
            materialType: material.type || 'unknown',
            materialId: material.id ?? null,
            inspectorName: checkedBy.username || checkedBy?.name || 'Unknown',
            submitted_by_user: !!(checkedBy?.username || checkedBy?.id),
            type: reservation.type || precheck.type || 'Unknown',
            reservationId: reservation?.id ?? null,
            reservationStartDate: reservation?.start_date ?? null,
            reservationEndDate: reservation?.end_date ?? null,
            reservationStatus: reservation?.status ?? null,
            status: precheck.status,
            date: precheck.check_date ?? precheck.date ?? null,
            time: precheck.check_time ?? precheck.time ?? null,
            items,
            notes: precheck.report ?? reservation?.notes ?? '',
            problems: precheck.problems ?? problemsFromItems ?? '',
            created_at: precheck.created_at ?? null,
            updated_at: precheck.updated_at ?? null,
            // keep boolean fields handy
            car_body_ok: !!precheck.car_body_ok,
            tires_ok: !!precheck.tires_ok,
            lighting_ok: !!precheck.lighting_ok,
            next_service_within_1k: !!precheck.next_service_within_1k,
            adblue_ok: !!precheck.adblue_ok,
            no_warning_lights: !!precheck.no_warning_lights,
            clean_vehicle: !!precheck.clean_vehicle,
            docs_present: !!precheck.docs_present,
          };
        });

        if (!cancelled) {
          setPrechecks(mappedPrechecks);
          setSummary(response.data?.summary ?? null);
          setEmptyDataList(mappedPrechecks.length === 0 ? (response.data?.message ?? 'Aucune entrée trouvée') : null);
          setError(null);
        }

        // 404 and other statuses are handled below by else-if
      } else if (response?.status === 404) {
        if (!cancelled) {
          setPrechecks([]);
          setEmptyDataList(response.data?.message ?? 'Aucune entrée trouvée');
          setSummary(response.data?.summary ?? null);
          setError(null);
        }
      } else {
        if (!cancelled) {
          setError(response?.data?.message ?? 'Erreur lors de la récupération des données');
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      // err handled by axios
      if (err?.response) {
        // server responded with non 2xx
        if (err.response.status === 404) {
          setPrechecks([]);
          setEmptyDataList(err.response.data?.message ?? 'Aucune entrée trouvée');
          setSummary(err.response.data?.summary ?? null);
        } else {
          setError(err.response.data?.message ?? `Erreur serveur (${err.response.status})`);
        }
      } else if (err?.request) {
        // request made but no response
        setError('Erreur de connexion au serveur');
      } else {
        // something else
        setError(err.message || 'Une erreur est survenue');
      }
      console.error('fetchPrechecks error:', err);
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  };

  fetchPrechecks();

  return () => {
    cancelled = true;
    controller.abort();
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // Disable body scroll when modals are open
  useEffect(() => {
    if (showDetailModal || showMessageModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailModal, showMessageModal]);

  const filteredPrechecks = prechecks.filter(precheck => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return precheck.status === 'In Progress';
    return precheck.status.toLowerCase().replace(' ', '-') === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Daily':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'Weekly':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'Monthly':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'Pre-Trip':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Post-Trip':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'annuel':
        return 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'materialName',
      label: 'Matériel',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {row.materialType === 'vehicle' ? (
            <Car className="h-4 w-4 text-gray-400" />
          ) : (
            <Wrench className="h-4 w-4 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.materialType === 'vehicle' ? 'Véhicule' : 'Outil'} - ID: {row.materialId || 'N/A'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'inspectorName',
      label: 'Inspecteur',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">{value}</span>
            {row.submitted_by_user && (
              <span className="ml-2 inline-flex px-1 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded">
                Utilisateur
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(value)}`}>
          {value === 'Daily' ? 'Quotidien' :
           value === 'Weekly' ? 'Hebdomadaire' :
           value === 'Monthly' ? 'Mensuel' :
           value === 'Pre-Trip' ? 'Pré-mission' :
           value === 'Post-Trip' ? 'Post-mission' :
           value === 'annuel' ? 'Annuel' : value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
            {value === 'Pending' ? 'En attente' :
             value === 'In Progress' ? 'En cours' :
             value === 'Completed' ? 'Terminé' :
             value === 'Failed' ? 'Échec' : value}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Éléments',
      sortable: false,
      render: (items) => {
        const okCount = items.filter(item => item.status === 'OK').length;
        const warningCount = items.filter(item => item.status === 'Warning').length;
        const criticalCount = items.filter(item => item.status === 'Critical').length;
        
        return (
          <div className="flex items-center space-x-2 text-xs">
            {okCount > 0 && (
              <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                <span>{okCount}</span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                <span>{warningCount}</span>
              </span>
            )}
            {criticalCount > 0 && (
              <span className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                <XCircle className="h-3 w-3" />
                <span>{criticalCount}</span>
              </span>
            )}
            {okCount === 0 && warningCount === 0 && criticalCount === 0 && (
              <span className="text-gray-500 dark:text-gray-400">Aucun élément</span>
            )}
          </div>
        );
      }
    }
  ];

  const handleViewPrecheck = (precheck) => {
    setSelectedPrecheck(precheck);
    setShowDetailModal(true);
  };

  // const handleDeletePrecheck = (precheck) => {
  //   if (window.confirm('Confirmez-vous la suppression de ce contrôle ?')) {
  //     setPrechecks(prev => prev.filter(p => p.id !== precheck.id));
  //   }
  // };

  const handleAddToMalfunctions = (precheck) => {
    const criticalItems = precheck.items.filter(item => item.status === 'Critical' || item.status === 'Warning');
    
    if (criticalItems.length === 0) {
      alert('Aucun élément critique ou d\'avertissement trouvé dans ce contrôle.');
      return;
    }

    const description = criticalItems.map(item => 
      `${item.category} - ${item.item}: ${item.notes || 'Problème détecté'}`
    ).join('; ');

    const newMalfunction = {
      id: `MAL-${String(malfunctions.length + 1).padStart(3, '0')}`,
      materialId: precheck.materialId,
      materialName: precheck.materialName,
      materialType: precheck.materialType,
      precheckId: precheck.id,
      description,
      severity: criticalItems.some(item => item.status === 'Critical') ? 'Critical' : 'High',
      status: 'Reported',
      reportedBy: 'Système automatique',
      reportedAt: new Date().toISOString(),
      notes: `Généré automatiquement depuis le contrôle ${precheck.id}`
    };

    setMalfunctions(prev => [newMalfunction, ...prev]);
    alert(`Dysfonctionnement ${newMalfunction.id} créé avec succès.`);
  };

  const handleSendMessage = (message, type) => {
    alert(`${type === 'warning' ? 'Avertissement' : 'Remarque'} envoyé avec succès à ${selectedPrecheck?.inspectorName}`);
  };



// updated function
const handleDownloadPDF = async (precheck) => {
  // defensive defaults
  const safe = (v, def = '-') => (v === null || v === undefined || v === '') ? def : v;
  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return safe(d); }
  };
  const formatTime = (t) => safe(t, '');

  const A4_WIDTH_PX = 794;
  const A4_PADDING = 28;

  const statusBadge = (status) => {
    const st = (status || '').toLowerCase();
    const map = {
      ok: { color: '#2e7d32', text: 'OK' },
      critical: { color: '#d32f2f', text: 'Critique' },
      warning: { color: '#ed6c02', text: 'Avertissement' },
      pending: { color: '#b08900', text: 'En attente' },
      'in progress': { color: '#0b72b9', text: 'En cours' },
      completed: { color: '#2e7d32', text: 'Terminé' },
      failed: { color: '#d32f2f', text: 'Échec' }
    };
    const key = st === 'ok' ? 'ok' : st === 'critical' ? 'critical' : (st === 'warning' ? 'warning' : st);
    const { color, text } = map[key] || { color: '#444', text: status || '—' };

    return `<span style="
      display:inline-flex;
      align-items:center;
      gap:8px;
      font-weight:700;
      color:${color};
      font-size:12px;
      line-height:1;
      white-space:nowrap;
    ">
      <span style="width:10px;height:10px;border-radius:999px;background:${color};display:inline-block;flex:0 0 10px;"></span>
      <span style="letter-spacing:0.2px;">${text}</span>
    </span>`;
  };

  // build container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.padding = `${A4_PADDING}px`;
  container.style.fontFamily = 'Inter, Arial, Helvetica, sans-serif';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#222';
  container.style.boxSizing = 'border-box';
  container.style.fontSize = '13px';
  container.style.lineHeight = '1.4';

  const items = Array.isArray(precheck.items) ? precheck.items : [];

  const normalizeItemStatus = (s) => {
    if (!s) return '—';
    const low = String(s).toLowerCase();
    if (low === 'ok' || low === 'true' || low === 'yes') return 'OK';
    if (low === 'warning' || low === 'warn') return 'Warning';
    if (low === 'critical' || low === 'false' || low === 'no') return 'Critical';
    return s;
  };

  const itemsRowsHtml = items.map((it, idx) => {
    const statusLabel = normalizeItemStatus(it.status);
    const notes = safe(it.notes, '-');
    return `
      <tr style="page-break-inside:avoid; background:${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
        <td style="border: 1px solid #e6e6e6; padding:10px; vertical-align:top; width:22%;">${safe(it.category)}</td>
        <td style="border: 1px solid #e6e6e6; padding:10px; vertical-align:top; width:38%;">${safe(it.item)}</td>
        <td style="border: 1px solid #e6e6e6; padding:10px; vertical-align:top; width:15%;">${statusBadge(statusLabel)}</td>
        <td style="border: 1px solid #e6e6e6; padding:10px; vertical-align:top; width:25%;">${notes}</td>
      </tr>
    `;
  }).join('');

  // NOTE: use the imported `logo` variable here. If your bundler inlines the asset as a data URL, html2canvas will be fine.
  // If the asset is served from a different origin you may need CORS headers and `crossorigin="anonymous"`.
  container.innerHTML = `
    <div style="width:100%; box-sizing:border-box; color:#222;">
      <!-- HEADER: logo image on the left -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:18px; margin-bottom:18px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <div style="width:68px; height:68px; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid #eee;">
            <img src="${logo}" alt="VeYoo" style="width:100%; height:100%; object-fit:contain; display:block;" crossorigin="anonymous" />
          </div>
          <div>
            <div style="font-size:20px; font-weight:700; color:#0b2545;">VeYoo</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Gestion de parc · Contrôle technique</div>
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:18px; font-weight:700; color:#0b2545;">Rapport de contrôle</div>
          <div style="font-size:13px; color:#444; margin-top:4px;">ID: <strong>${safe(precheck.id)}</strong></div>
          <div style="font-size:12px; color:#666; margin-top:6px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      <!-- META GRID -->
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:18px;">
        <div style="background:#fbfbfd; padding:12px; border-radius:8px; border:1px solid #f0f0f4; box-shadow:0 1px 0 rgba(15,23,42,0.02);">
          <div style="font-size:12px; color:#666; margin-bottom:6px;">Matériel</div>
          <div style="font-weight:700; color:#0b2545;">${safe(precheck.materialName)}</div>
          <div style="font-size:12px; color:#666; margin-top:8px;">Type: <strong style="color:#333">${precheck.materialType === 'vehicle' ? 'Véhicule' : safe(precheck.materialType)}</strong></div>
        </div>

        <div style="background:#fbfbfd; padding:12px; border-radius:8px; border:1px solid #f0f0f4;">
          <div style="font-size:12px; color:#666; margin-bottom:6px;">Réservation</div>
          <div style="font-weight:700; color:#0b2545;">ID: ${safe(precheck.reservationId, '—')}</div>
          <div style="font-size:12px; color:#666; margin-top:6px;">
            ${safe(precheck.reservationStartDate, '') ? `Début: <strong>${formatDate(precheck.reservationStartDate)}</strong>` : ''}
            ${safe(precheck.reservationEndDate, '') ? `<div style="margin-top:6px;">Fin: <strong>${formatDate(precheck.reservationEndDate)}</strong></div>` : ''}
          </div>
        </div>

        <div style="background:#fbfbfd; padding:12px; border-radius:8px; border:1px solid #f0f0f4;">
          <div style="font-size:12px; color:#666; margin-bottom:6px;">Inspecteur</div>
          <div style="font-weight:700; color:#0b2545;">${safe(precheck.inspectorName)}</div>
          <div style="font-size:12px; color:#666; margin-top:8px;">Soumis: ${precheck.submitted_by_user ? 'Oui' : 'Non'}</div>
        </div>

        <div style="background:#fbfbfd; padding:12px; border-radius:8px; border:1px solid #f0f0f4;">
          <div style="font-size:12px; color:#666; margin-bottom:6px;">Informations</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <div style="font-weight:700; color:#0b2545;">${safe(precheck.type)}</div>
            <div style="margin-left:auto;">${statusBadge(safe(precheck.status))}</div>
          </div>
          <div style="font-size:12px; color:#666; margin-top:8px;">Heure: ${formatTime(precheck.time)}</div>
        </div>
      </div>

      <!-- CHECKS TABLE -->
      <div style="margin-bottom:18px;">
        <div style="font-size:15px; font-weight:700; margin-bottom:8px; color:#0b2545;">Détails des vérifications</div>
        <div style="border-radius:10px; overflow:hidden; border:1px solid #e9e9ef;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#0b2545; color:#fff;">
                <th style="padding:10px; text-align:left; width:22%;">Catégorie</th>
                <th style="padding:10px; text-align:left; width:38%;">Élément</th>
                <th style="padding:10px; text-align:left; width:15%;">Statut</th>
                <th style="padding:10px; text-align:left; width:25%;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml || `<tr><td colspan="4" style="padding:12px; text-align:center; color:#666;">Aucune vérification</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- NOTES & PROBLEMS -->
      <div style="display:flex; gap:12px; margin-bottom:22px; align-items:flex-start;">
        <div style="flex:1;">
          <div style="font-size:14px; font-weight:700; margin-bottom:8px; color:#0b2545;">Notes et observations</div>
          <div style="padding:12px; border-radius:8px; border:1px solid #f0f0f4; min-height:84px; background:#fff;">
            ${safe(precheck.notes, 'Aucune note')}
          </div>
        </div>

        <div style="flex:1;">
          <div style="font-size:14px; font-weight:700; margin-bottom:8px; color:#0b2545;">Problèmes identifiés</div>
          <div style="padding:12px; border-radius:8px; border:1px solid #f0f0f4; min-height:84px; background:#fff;">
            ${safe(precheck.problems, 'Aucun problème identifié')}
          </div>
        </div>
      </div>

      <!-- SIGNATURES -->
      <div style="display:flex; justify-content:space-between; gap:20px; margin-top:18px;">
        <div style="flex:1; text-align:left;">
          <div style="font-size:13px; color:#666; margin-bottom:8px;">Signature de l'inspecteur</div>
          <div style="height:64px; border-bottom:1px dashed #ddd; margin-bottom:8px;"></div>
          <div style="font-size:13px; color:#333;">${safe(precheck.inspectorName)}</div>
        </div>

        <div style="flex:1; text-align:left;">
          <div style="font-size:13px; color:#666; margin-bottom:8px;">Signature du responsable</div>
          <div style="height:64px; border-bottom:1px dashed #ddd; margin-bottom:8px;"></div>
          <div style="font-size:13px; color:#333;">Nom &amp; date</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:18px; color:#7b7b7b; font-size:11px;">
        VeYoo — Gestion de parc · Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // wait for images to load (logo). This ensures html2canvas captures it.
    const img = container.querySelector('img');
    if (img) {
      await new Promise((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // resolve on error so we don't hang
      });
    }

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const pxFullHeight = canvas.height;
    const pxFullWidth = canvas.width;
    const imgHeight = (pxFullHeight * imgWidth) / pxFullWidth;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > -0.1) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `precheck_${safe(precheck.id, 'report')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Erreur lors de la génération du PDF');
  } finally {
    if (container && container.parentNode) container.parentNode.removeChild(container);
  }
};

  const actions = (precheck) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewPrecheck(precheck)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDownloadPDF(precheck)}
        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
        title="Télécharger PDF"
      >
        <Download className="h-4 w-4" />
      </button>
      {/* <button
        onClick={() => {
          setSelectedPrecheck(precheck);
          setShowMessageModal(true);
        }}
        className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
        title="Envoyer un message"
      >
        <MessageSquare className="h-4 w-4" />
      </button> */}
      {/* <button
        onClick={() => handleDeletePrecheck(precheck)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button> */}
    </div>
  );

  const statusCounts = {
    all: summary.pending + summary.in_progress + summary.completed + summary.failed,
    pending: summary.pending,
    'in-progress': summary.in_progress,
    completed: summary.completed,
    failed: summary.failed
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading loading_txt={'Chargement des contrôles...'} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) :  (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des contrôles
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Suivez les contrôles techniques et inspections des matériels
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statusCounts.all}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{statusCounts.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{statusCounts['in-progress']}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{statusCounts.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Échecs</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{statusCounts.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs and Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="grid grid-cols-2 gap-4 md:flex md:flex-row space-x-8 px-6 overflow-x-auto">
                {[
                  { key: 'all', label: 'Tous', count: statusCounts.all },
                  { key: 'pending', label: 'En attente', count: statusCounts.pending },
                  { key: 'in-progress', label: 'En cours', count: statusCounts['in-progress'] },
                  { key: 'completed', label: 'Terminés', count: statusCounts.completed },
                  { key: 'failed', label: 'Échecs', count: statusCounts.failed }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
            {
              emptyDataList ? (
                  <ErrorGetData error={emptyDataList} />
             ) :
               <>
                {/* Prechecks Table */}
                <div className="p-6">
                  <DataTable
                    data={filteredPrechecks}
                    columns={columns}
                    onRowClick={handleViewPrecheck}
                    actions={actions}
                    searchable={true}
                    pageSize={10}
                  />
                </div>
              </>
      
            }
           
          </div>

          {/* Send Message Modal */}
          {showMessageModal && selectedPrecheck && (
            <SendMessageModal
              isOpen={showMessageModal}
              onClose={() => setShowMessageModal(false)}
              precheck={selectedPrecheck}
              onSend={handleSendMessage}
            />
          )}

          {/* Precheck Details Modal */}
          {showDetailModal && selectedPrecheck && (
            <PrecheckDetails
              precheck={selectedPrecheck}
              onClose={() => setShowDetailModal(false)}
              onDownloadPDF={handleDownloadPDF}
              onAddToMalfunctions={handleAddToMalfunctions}
              onSendMessage={() => {
                setShowDetailModal(false);
                setShowMessageModal(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PrecheckManagement;