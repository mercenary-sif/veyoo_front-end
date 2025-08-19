import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useEffect , useState } from 'react';
import { useMyProfile } from '../../components/hooks/useMyProfile';
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { userData} = useMyProfile();
  useEffect(() => {
        const fetchUserData = async () => {
            const userObj = {
              name: userData?.fullname,
            };
            setUser(userObj);   
        };
      
        fetchUserData();
      }, [userData ]);
     
  return (
    <div className="flex pb-3 bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (fixed on all screens) */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
      />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-64 h-auto">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user = {user}
        />
        
        {/* Main Content Area */}
        <main className="p-4 md:p-6 relative">
          <div className="max-w-7xl">
            <Outlet user={user} />
          </div>
        </main>
      </div>
     
    </div>
  );
};

export default DashboardLayout;