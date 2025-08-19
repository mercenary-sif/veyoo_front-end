import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Send } from 'lucide-react';

const PreCheck = ({ onComplete }) => {
  const [checklist, setChecklist] = useState([
    { id: 1, description: "Carrosserie en bon état", status: null },
    { id: 2, description: "Pneus en bon état (pression correcte, pas usés ni abîmés)", status: null },
    { id: 3, description: "Éclairage fonctionnel (phares, clignotants, feux de frein)", status: null },
    { id: 4, description: "Prochaine révision dans moins de 1000 km (à vérifier avec le compteur ou carnet d'entretien)", status: null },
    { id: 5, description: "Liquide de refroidissement adblue (niveau suffisant, pas de fuites)", status: null },
    { id: 6, description: "Aucun voyant allumé (pas de voyants rouges/orange sur le tableau de bord)", status: null },
    { id: 7, description: "Véhicule propre (intérieur et extérieur propres)", status: null },
    { id: 8, description: "Documents présents (assurance, carte grise, constat dans la boîte à gants)", status: null },
  ]);

  const [problems, setProblems] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCheckStatus = (id, status) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // build both the checklist and the boolean keyed payload (server expects these keys)
      const car_body_ok = !!checklist[0].status;
      const tires_ok = !!checklist[1].status;
      const lighting_ok = !!checklist[2].status;
      const next_service_within_1k = !!checklist[3].status;
      const adblue_ok = !!checklist[4].status;
      const no_warning_lights = !!checklist[5].status;
      const clean_vehicle = !!checklist[6].status;
      const docs_present = !!checklist[7].status;

      const payload = {
        // booleans expected by backend
        car_body_ok,
        tires_ok,
        lighting_ok,
        next_service_within_1k,
        adblue_ok,
        no_warning_lights,
        clean_vehicle,
        docs_present,
        // additional info
        report: problems || '',
        // also include full checklist for local use if parent needs it
        checklist: checklist.map(c => ({ id: c.id, description: c.description, status: c.status })),
        problems,
        timestamp: new Date().toISOString(),
      };

      // call parent with a shape that includes both booleans and checklist
      if (typeof onComplete === 'function') {
        await onComplete(payload);
      }
    } catch (error) {
      console.error('Failed to submit pre-check:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allChecked = checklist.every(item => item.status !== null);
  const hasProblems = checklist.some(item => item.status === false) || problems.trim() !== '';

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pré-vérification du véhicule</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Vérifiez chaque point et signalez tout problème rencontré
        </p>
      </div>

      <div className="space-y-5">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all hover:shadow-md"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 dark:text-white">{item.description}</h3>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => updateCheckStatus(item.id, true)}
                className={`p-2 rounded-full ${item.status === true
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                aria-label="Confirmé"
                type="button"
              >
                <CheckCircle2 size={20} />
              </button>

              <button
                onClick={() => updateCheckStatus(item.id, false)}
                className={`p-2 rounded-full ${item.status === false
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                aria-label="Problème"
                type="button"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label htmlFor="problems" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" size={18} />
            Signalez les problèmes rencontrés
          </div>
        </label>
        <textarea
          id="problems"
          rows={4}
          value={problems}
          onChange={(e) => setProblems(e.target.value)}
          placeholder="Décrivez en détail les problèmes constatés..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {hasProblems && (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="mr-2" size={16} />
              Des problèmes ont été signalés
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allChecked || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${allChecked
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
        >
          {isSubmitting ? (
            <span>Envoi en cours...</span>
          ) : (
            <>
              <Send className="mr-2" size={18} />
              Envoyer au management
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PreCheck;
