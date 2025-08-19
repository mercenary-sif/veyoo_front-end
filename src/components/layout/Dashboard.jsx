import React, { useState, useEffect } from 'react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Loading, ErrorGetData } from '../../components/export';
import { 
  Users, 
  Package, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';
import { QuickActions, RecentActivity, StatCard } from '../export';
import { useAuth } from '../../components/Context/AuthContext';
import { useMyProfile } from '../../components/hooks/useMyProfile';

const Dashboard = () => {
  const { hasRole } = useAuth();
  const { userData } = useMyProfile();
  const user = {
    name: userData?.fullname,
  };
  const role = hasRole()
  const VeYooAxios = useVeYooAxios();

  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    assets: { total: 0, available: 0, reserved: 0, out_of_service: 0 },
    reservations: { total: 0, pending: 0, accepted: 0, declined: 0, completed: 0 },
    assets_by_type: { vehicles: { total: 0, available: 0, reserved: 0, out_of_service: 0 }, tools: { total: 0, available: 0, reserved: 0, out_of_service: 0 } },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get('/dashboard/stats/');
        if (response.status === 200) {
          setStats(response.data);
        } else {
          setError('Erreur lors de la récupération des statistiques');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(err.response.data.message || 'Aucune donnée disponible');
        } else if (err.request) {
          setError('Erreur de connexion au serveur');
        } else {
          setError('Une erreur est survenue');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [VeYooAxios]);

  // Disable body scroll when loading (optional, can be removed if not needed)
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  const outOfServiceAssets = stats.assets.out_of_service;

  return (
    <div className="space-y-6 relative">
      {isLoading ? (
        <Loading loading_txt={'Chargement des statistiques...'} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : (
        <>
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-subtext to-indigo-600 rounded-lg shadow-sm text-white p-6">
            <h1 className="text-2xl font-bold">
              Bonjour, {user?.name ?? 'Utilisateur'} 👋
            </h1>
            <p className="mt-2 opacity-90">
              Voici un aperçu de votre plateforme VeYoo
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(
              <StatCard
                title="Utilisateurs"
                value={stats.users.total}
                subtitle={`${stats.users.active} actifs`}
                icon={Users}
                color="bg-blue-500"
              />
            )}
            {(
              <>
                <StatCard
                  title="Actifs totaux"
                  value={stats.assets.total}
                  subtitle={`${stats.assets.available} disponibles`}
                  icon={Package}
                  color="bg-green-500"
                />
                <StatCard
                  title="Réservations"
                  value={stats.reservations.total}
                  subtitle={`${stats.reservations.pending} en attente`}
                  icon={Calendar}
                  color="bg-purple-500"
                />
              </>
            )}
            {(
              <StatCard
                title="Alertes"
                value={outOfServiceAssets}
                subtitle="Équipements défaillants"
                icon={AlertTriangle}
                color="bg-red-500"
              />
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity mockReservations={stats.reservations} /> {/* Update mockReservations prop */}
            </div>
            <div>
              <QuickActions hasRole={role} />
            </div>
          </div>

          {/* Assets Status Overview */}
          {hasRole(['admin', 'manager']) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">État des actifs</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.assets.available}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.assets.reserved}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Réservés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {outOfServiceAssets}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Hors service</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;