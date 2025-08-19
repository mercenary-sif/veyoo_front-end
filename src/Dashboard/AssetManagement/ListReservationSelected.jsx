// src/pages/ListReservationSelected.jsx
import React, { useRef } from 'react';
import { Calendar, FileText, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/VEYoo_Logo.png';

const ListReservationSelected = ({ reservations, getStatusColor }) => {
  const pdfRef = useRef(null);

  // Normalize reservations prop to always be an array (handles single-object case)
  const reservationsArray = Array.isArray(reservations)
    ? reservations
    : reservations
      ? [reservations]
      : [];

  const safe = (v, def = '—') => (v === null || v === undefined || v === '' ? def : v);

  const safeDate = (val) => {
    try { if (!val) return '—'; return new Date(val).toLocaleDateString('fr-FR'); } catch { return val; }
  };
  const safeDateTime = (val) => {
    try { if (!val) return '—'; return new Date(val).toLocaleString('fr-FR'); } catch { return val; }
  };

  const getStatusText = (status) => {
    switch ((status || '').toString()) {
      case 'Pending': return 'En attente';
      case 'Approved': return 'Approuvée';
      case 'Rejected': return 'Refusée';
      case 'Active': return 'Active';
      case 'Completed': return 'Terminée';
      default: return status || '—';
    }
  };

  // Counts for header summary
  const totalCount = reservationsArray.length;
  const vehiclesCount = reservationsArray.filter(r => ((r?.material?.type || r?.materialType || '') + '').toLowerCase() === 'vehicle').length;
  const toolsCount = reservationsArray.filter(r => ((r?.material?.type || r?.materialType || '') + '').toLowerCase() === 'tool').length;

  // Use all reservations for export (both vehicles and tools)
  const exportReservations = reservationsArray;

  const statusBadgeHtml = (status) => {
    const s = (status || '').toString().toLowerCase();
    const map = {
      pending: { color: '#b08900', text: 'En attente' },
      approved: { color: '#16a34a', text: 'Approuvée' },
      rejected: { color: '#dc2626', text: 'Refusée' },
      active: { color: '#0b72b9', text: 'Active' },
      completed: { color: '#2e7d32', text: 'Terminée' },
    };
    const e = map[s] || { color: '#4b5563', text: status || '—' };
    return `<span style="display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:12px;color:${e.color};">
              <span style="width:10px;height:10px;border-radius:999px;background:${e.color};display:inline-block;flex:0 0 10px;"></span>
              <span style="letter-spacing:0.2px;">${e.text}</span>
            </span>`;
  };

  const buildCard = (r) => {
    const initials = (r.userName || r.created_by?.username || '—')
      .split(' ')
      .map(n => (n && n[0]) || '')
      .join('')
      .slice(0, 2) || '—';

    const material = r.material || {};
    return `
      <div style="margin-bottom:26px;border:1px solid #e8e8ef;border-radius:10px;padding:16px;page-break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;">
          <div style="flex:1;">
            <div style="font-size:18px;font-weight:700;color:#0b2545;margin-bottom:6px;">Réservation #${safe(r.id)}</div>
            <div style="display:flex;align-items:center;gap:10px;font-size:14px;color:#374151;">
              <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;background:linear-gradient(135deg,#3b82f6,#8b5cf6);">
                ${initials}
              </div>
              <div>
                <div style="font-weight:600;color:#0b2545;">${safe(r.userName || r.created_by?.username)}</div>
                <div style="font-size:13px;color:#6b7280;">${material.name ? `${material.name} (${material.type || '—'})` : 'Matériel : —'}</div>
              </div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Créée le</div>
            <div style="font-weight:700;color:#0b2545;">${safeDateTime(r.created_at || r.createdAt)}</div>
            ${r.updated_at ? `<div style="font-size:12px;color:#6b7280;margin-top:6px;">Modifiée: ${safeDateTime(r.updated_at)}</div>` : ''}
            <div style="margin-top:10px;">${statusBadgeHtml(r.status)}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;font-size:13px;color:#374151;">
          <div style="background:#fbfbfd;padding:10px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Période</div>
            <div style="font-weight:700;color:#0b2545;">${safeDate(r.start_date || r.startDate)}</div>
            <div style="font-size:13px;color:#6b7280;">${safe(r.start_time || '—')}</div>
          </div>

          <div style="background:#fbfbfd;padding:10px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Fin</div>
            <div style="font-weight:700;color:#0b2545;">${safeDate(r.end_date || r.endDate)}</div>
            <div style="font-size:13px;color:#6b7280;">${safe(r.end_time || '—')}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;color:#374151;">
          <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Type</div>
            <div style="font-weight:700;color:#0b2545;">${safe(r.reservation_type)}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px;">But: ${safe(r.purpose)}</div>
          </div>

          <div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Assigné à</div>
            <div style="font-weight:700;color:#0b2545;">${safe(r.assigned_to?.username)}</div>
          </div>
        </div>

        ${r.notes ? `<div style="margin-top:12px;font-size:13px;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Notes</div>
          <div style="background:#fbfbfd;padding:10px;border-radius:8px;border:1px solid #f0f4f8;color:#374151;">${r.notes}</div>
        </div>` : ''}

        <div style="border-top:1px solid #eef2f6;margin-top:12px;padding-top:12px;font-size:12px;color:#6b7280;display:flex;justify-content:space-between;">
          <div>ID: ${safe(r.id)}</div>
          <div>Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
    `;
  };

  const generateReservationsPdf = async () => {
    if (!exportReservations || exportReservations.length === 0) {
      alert("Aucune réservation à exporter.");
      return;
    }

    // A4 render size used when converting to canvas
    const A4_WIDTH_PX = 794;
    const A4_PADDING = 28;

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

    // header & summary - now shows both tools and vehicles counts
    container.innerHTML = `
      <div style="width:100%;box-sizing:border-box;color:#222;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:18px;">
          <div style="display:flex;gap:12px;align-items:center;">
            <div style="width:68px;height:68px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #eee;">
              <img src="${logo}" alt="VeYoo" style="width:100%;height:100%;object-fit:contain;display:block;" crossorigin="anonymous" />
            </div>
            <div>
              <div style="font-size:20px;font-weight:700;color:#0b2545;">VeYoo</div>
              <div style="font-size:12px;color:#666;margin-top:4px;">Gestion des réservations · Rapport</div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:700;color:#0b2545;">Rapport des réservations — Tous les matériels</div>
            <div style="font-size:13px;color:#444;margin-top:4px;">Total: <strong>${totalCount}</strong> — Véhicules: <strong>${vehiclesCount}</strong> — Outils: <strong>${toolsCount}</strong></div>
            <div style="font-size:12px;color:#666;margin-top:6px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
        </div>

        <div style="margin-bottom:18px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          <div style="background:#fbfbfd;padding:12px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;">Total</div>
            <div style="font-weight:700;color:#0b2545;font-size:16px;">${totalCount}</div>
          </div>
          <div style="background:#fbfbfd;padding:12px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;">Véhicules</div>
            <div style="font-weight:700;color:#0b2545;font-size:16px;">${vehiclesCount}</div>
          </div>
          <div style="background:#fbfbfd;padding:12px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;">Outils</div>
            <div style="font-weight:700;color:#0b2545;font-size:16px;">${toolsCount}</div>
          </div>
          <div style="background:#fbfbfd;padding:12px;border-radius:8px;border:1px solid #f0f0f4;">
            <div style="font-size:12px;color:#6b7280;">En attente</div>
            <div style="font-weight:700;color:#0b2545;font-size:16px;">${exportReservations.filter(r => (r.status || '').toLowerCase() === 'pending').length}</div>
          </div>
        </div>

        ${exportReservations.map(r => buildCard(r)).join('')}

        <div style="text-align:center;margin-top:18px;color:#7b7b7b;font-size:11px;">VeYoo — Gestion de parc · Document généré le ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>
    `;

    document.body.appendChild(container);

    // wait images (logo) to load
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(imgs.map(img => new Promise(resolve => {
      if (img.complete) return resolve();
      img.onload = () => resolve();
      img.onerror = () => resolve();
    })));

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pxFullHeight = canvas.height;
      const pxFullWidth = canvas.width;
      const imgHeight = (pxFullHeight * imgWidth) / pxFullWidth;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > -0.1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`reservations_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Erreur lors de la génération du PDF');
    } finally {
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }
  };

  if (!reservationsArray || reservationsArray.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Aucune réservation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={pdfRef}>
      <div className="flex justify-end">
        <button
          onClick={generateReservationsPdf}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          Télécharger PDF 
        </button>
      </div>

      <div className="space-y-3">
        {reservationsArray.map((reservation) => (
          <div key={reservation.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {(reservation.userName || reservation.created_by?.username || '—').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{reservation.userName || (reservation.created_by?.username || '—')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {reservation.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Période:</span>
                      <p className="text-gray-900 dark:text-white">
                        {safeDate(reservation.start_date || reservation.startDate)} {reservation.start_time ? `à ${reservation.start_time}` : ''}
                        {' '}au{' '}
                        {safeDate(reservation.end_date || reservation.endDate)} {reservation.end_time ? `à ${reservation.end_time}` : ''}
                      </p>
                      {reservation.reservation_type && <p className="text-xs text-gray-500 mt-1">Type: {reservation.reservation_type}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Objet:</span>
                      <p className="text-gray-900 dark:text-white">{reservation.purpose || '—'}</p>
                      {reservation.material && (
                        <p className="text-xs text-gray-500 mt-1">Matériel: {reservation.material.name || '—'} ({reservation.material.type || '—'})</p>
                      )}
                    </div>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Notes:</strong> {reservation.notes}</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Créée le {safeDateTime(reservation.created_at || reservation.createdAt)} {reservation.created_by?.username ? `par ${reservation.created_by.username}` : ''}
                  {reservation.assigned_to?.username ? ` — Assignée à ${reservation.assigned_to.username}` : ''}
                  {reservation.updated_at && <><br/>Dernière modification: {safeDateTime(reservation.updated_at || reservation.updatedAt)}</>}
                </div>
              </div>

              <div className="ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListReservationSelected;
