import { 
  Menu, 
} from 'lucide-react';
import ThemeToggle from '../Context/ThemeToggle';
import { useAuth } from '../../components/Context/AuthContext';
const Header = ({ onMenuClick, onNotificationsClick ,user}) => {
   const {hasRole} = useAuth();
   const role = hasRole(); 
    
  

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>

         
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Selector */}
          <ThemeToggle/>

          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.initials || "UU"}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "Utilisateur"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {role ? role : "Rôle"}
              </p>
            </div>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;