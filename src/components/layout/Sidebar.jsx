import { useNavigate } from 'react-router-dom';
import logo from '../../assets/VEYoo_Logo.png';
import { 
  Home, 
  Users, 
  Package, 
  Calendar, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  LogOut,
  X,
  Car,
  AlertTriangle,
  Bell,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../components/Context/AuthContext';

const Sidebar = ({ isOpen, onClose ,user }) => {
  const { logout  , hasRole} = useAuth();
  const navigate  = useNavigate();
  const role = hasRole();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminMenuItems = [
    { icon: Home, label: 'Tableau de bord', href: '/dashboard', roles: ['admin', 'manager'] },
    { icon: Users, label: 'Gestion des comptes', href: '/dashboard/users', roles: ['admin'] },
    { icon: Car, label: 'Gestion des véhicules', href: '/dashboard/vehicles', roles: ['admin', 'manager'] },
    { icon: ClipboardCheck, label: 'Gestion des contrôles', href: '/dashboard/prechecks', roles: ['admin', 'manager'] },
    { icon: Package, label: 'Gestion des actifs', href: '/dashboard/assets', roles: ['admin', 'manager'] },
    { icon: Calendar, label: 'Réservations', href: '/dashboard/reservations', roles: ['admin', 'manager'] },
    { icon: AlertTriangle, label: 'Dysfonctionnements', href: '/dashboard/malfunctions', roles: ['admin', 'manager'] },
    { icon: MessageSquare, label: 'Annonces', href: '/dashboard/announcements', roles: ['admin', 'manager'] },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', roles: ['admin', 'manager'] },
    { icon: Settings, label: 'Profil', href: '/dashboard/profile', roles: ['admin', 'manager'] },
    { icon: HelpCircle, label: 'Support', href: '/dashboard/support', roles: ['admin', 'manager'] },
  ];

   const filteredMenuItems = adminMenuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile overlay with 70% opacity */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-70 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex justify-between items-center px-[2rem] w-[185px] h-[90px]">
              <img className="object-full w-full h-full transition-all duration-300" src={logo} alt="scarabé_logo" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {/* Scrollable menu section */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {filteredMenuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 hover:text-subtext dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-subtext transition-colors duration-200"
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            ))}
          </div>
          
          {/* Fixed footer section */}
          <div className="border-t border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.initials || "UU"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || "Utilisateur"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {role ? role : "Rôle"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/70 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;