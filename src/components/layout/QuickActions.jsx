// src/components/QuickActions.jsx
import { Users, Calendar, Truck, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreatUser } from '../export';
import CreateReservationModal from '../../Dashboard/Reservation/CreateReservation';
import CreateToolModal from '../../Dashboard/AssetManagement/CreateToolModal';       
import CreateVehicleModal from '../../Dashboard/VehicleManagement/CreateVehicleModal'; 

const QuickActions = ({ hasRole, users = [], assets = [], existingReservations = [], onReservationCreated, onAssetCreated }) => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateReservationOpen, setIsCreateReservationOpen] = useState(false);
  const [isCreateToolOpen, setIsCreateToolOpen] = useState(false);
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);
  useEffect(() => {
      if (isCreateUserOpen || isCreateReservationOpen || isCreateToolOpen || isCreateVehicleOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
  
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [isCreateUserOpen, isCreateReservationOpen, isCreateToolOpen, isCreateVehicleOpen]);
  const handleReservationCreated = (newReservation) => {
    setIsCreateReservationOpen(false);
    if (typeof onReservationCreated === 'function') onReservationCreated(newReservation);
  };

  // bubble asset up
  const handleAssetCreated = (asset) => {
    setIsCreateToolOpen(false);
    setIsCreateVehicleOpen(false);
    if (typeof onAssetCreated === 'function') onAssetCreated(asset);
  };

  // hasRole helper that supports: function, string or array
  const hasAnyRole = (roles = []) => {
    if (!roles || roles.length === 0) return false;
    if (typeof hasRole === 'function') {
      // some implementations expect a single role, some expect array — try array first
      try {
        return Boolean(hasRole(roles));
      } catch (e) {
        // fall back to checking each role
        return roles.some(r => Boolean(hasRole(r)));
      }
    }
    if (Array.isArray(hasRole)) {
      return roles.some(r => hasRole.map(h => String(h).toLowerCase()).includes(String(r).toLowerCase()));
    }
    if (typeof hasRole === 'string') {
      return roles.map(r => r.toLowerCase()).includes(hasRole.toLowerCase());
    }
    return false;
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions rapides</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Create user only for Admin */}
            {hasAnyRole(['Admin']) && (
              <button
                onClick={() => setIsCreateUserOpen(true)}
                className="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Créer un utilisateur</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter un nouveau compte</p>
                </div>
              </button>
            )}

            {/* Create tool (available to managers/admins) */}
            {hasAnyRole(['Admin', 'Manager']) && (
              <>
                <button
                  onClick={() => setIsCreateToolOpen(true)}
                  title="Créer un nouvel outil"
                  className="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Wrench className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Créer un outil</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter un nouvel équipement</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsCreateVehicleOpen(true)}
                  title="Créer un nouveau véhicule"
                  className="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Truck className="h-5 w-5 text-teal-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Créer un véhicule</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter un nouveau véhicule</p>
                  </div>
                </button>
              </>
            )}

            {/* Create reservation (available to manager/admin too) */}
            {hasAnyRole(['Admin', 'Manager']) && (
              <button
                onClick={() => setIsCreateReservationOpen(true)}
                className="flex items-center p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Créer une réservation</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Planifier une nouvelle réservation</p>
                </div>
              </button>
            )}
          </div>
        </div>

        <CreatUser
          isOpen={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
        />
      </div>

      {/* Create Reservation Modal */}
      {isCreateReservationOpen && (
        <CreateReservationModal
          isOpen={isCreateReservationOpen}
          onClose={() => setIsCreateReservationOpen(false)}
          onSubmit={handleReservationCreated}
          users={users}
          assets={assets}
          existingReservations={existingReservations}
        />
      )}

      {/* Create Tool Modal */}
      {isCreateToolOpen && (
        <CreateToolModal
          isOpen={isCreateToolOpen}
          onClose={() => setIsCreateToolOpen(false)}
          onSubmit={handleAssetCreated}
        />
      )}

      {/* Create Vehicle Modal */}
      {isCreateVehicleOpen && (
        <CreateVehicleModal
          isOpen={isCreateVehicleOpen}
          onClose={() => setIsCreateVehicleOpen(false)}
          onSubmit={handleAssetCreated}
        />
      )}
    </>
  );
};

export default QuickActions;
