import { useNavigate } from 'react-router-dom';
import logo from '../../assets/VEYoo_Logo.png';
import { FaUserCircle } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { RiLogoutCircleRLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import ThemeToggle from '../Context/ThemeToggle';
import { useAuth } from '../../components/Context/AuthContext';
const Navbar = () => {
   const navigate  = useNavigate();
   const { logout } = useAuth();
   const [menu, setMenu] = useState(false);
   const isLogin = true; 
   
     useEffect(() => {
       if (
         menu
       ) {
         document.body.style.overflow = "hidden";
       } else {
         document.body.style.overflow = "auto";
       }
   
       // Cleanup function
       return () => {
         document.body.style.overflow = "auto";
       };
     }, [menu]);
   const handleLogout = () => {
    logout();
    navigate('/');
  };
  const Menu = ({ navigate }) => { 
    return(
      <>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/Accueil')}>Accueil</p>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/reservation')}>Réservation</p>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/équipement')}>l'équipement</p>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/vehicles')}>Véhicules</p>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/pannes')}>Pannes</p>
        <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/support')}>Support</p>
      </>
    )
  }; 

  return (
    <>
      {/* Main Navbar */}
      <div className="relative flex justify-between items-center pr-[2rem] pl-[1rem] lg:px-[4rem] bg-nav shadow-nav h-[12vh]">
        <div className="flex justify-between items-center px-[2rem] w-[200px] md:w-[240px] xl:w-[285px] h-[85px] md:h-[90px]">
          <img 
            className='object-full w-full h-full transition-all duration-300' 
            src={logo} 
            alt="VEYoo_logo" 
          />
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-4">
          <Menu navigate={navigate} />
        </div>
        
        {/* Desktop Icons */}
        {isLogin && (
          <div className="hidden lg:flex justify-center items-center px-[1rem] gap-[1rem]">
            <ThemeToggle/> 
            <FaUserCircle 
              size={20} 
              className="text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300" 
              onClick={() => navigate('/Profile')} 
            />
            <IoNotifications 
              size={22} 
              className="text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300" 
              onClick={() => navigate('/notifications')}
            />
            <RiLogoutCircleRLine 
              size={22} 
              className="text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300" 
              onClick={handleLogout} 
            />
          </div>
        )}
        
        {/* Mobile Menu Button */}
        {!menu && (
          <RiMenu3Line 
            size={25} 
            className='block lg:hidden text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300' 
            onClick={() => setMenu(true)}
          />
        )}
      </div>
   
      {/* Mobile Menu */}
      {menu && (
        <div className="lg:hidden absolute top-0 right-0 p-[1rem] h-full w-[70%] sm:w-[40%] md:w-[30%] bg-mobile-menu backdrop-blur-md shadow-[-6px_0_12px_rgba(0,0,0,0.1)] z-[999] flex flex-col justify-start items-center gap-[1rem]">
          <div className="w-full mt-[1rem]">
            <RiCloseLine 
              size={25} 
              className='text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300' 
              onClick={() => setMenu(false)}
            />
          </div>
          
          <div className="flex flex-col py-[2rem] w-full h-[85vh] justify-start items-center gap-4">
            <Menu navigate={navigate} />
            <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/Profile')}>
              Profile
            </p>
            <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400" onClick={() => navigate('/notifications')}>
              Notifications
            </p>
             <div className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 flex justify-center items-center gap-[1rem] mt-auto">
               <ThemeToggle/>
                <p> Theme</p>
            </div>
            <p className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-subtext dark:hover:text-blue-400 flex justify-center items-center gap-[1rem] mt-auto"  onClick={handleLogout}>
              <RiLogoutCircleRLine size={22} className="hover:text-subtext dark:hover:text-blue-400 cursor-pointer transition-colors duration-300" /> 
              LogOut
            </p>
           
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar;