import { useNavigate } from 'react-router-dom';
import logo from '../../assets/VEYoo_Logo.png'

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col justify-center items-center w-full py-[2rem] bg-nav shadow-[3px_-3px_3px_var(--color-nav-shadow)]">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-[2rem] p-[5rem] w-full">
        <div className="flex justify-start items-center px-[2rem] w-[220px] md:w-[240px] xl:w-[285px] h-[125px] md:h-[200px]">
          <img 
            className='object-full w-full h-full transition-all duration-300' 
            src={logo} 
            alt="VEYoo_logo" 
          />
        </div>
        
        <div className="flex flex-col justify-start items-start gap-[1rem]">
          <h4 className='text-[18px] font-semibold text-gray-900 dark:text-white'>Links</h4>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/Accueil')}
          >
            Accueil
          </p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/reservation')}
          >
            Réservation
          </p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/équipement')}
          >
            l'équipement
          </p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/vehicles')}
          >
            Véhicules
          </p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/pannes')}
          >
            Pannes
          </p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/support')}
          >
            Support
          </p>
        </div>
        
        <div className="flex flex-col justify-start items-start gap-[1rem]">
          <h4 className='text-[18px] font-semibold text-gray-900 dark:text-white'>Contact</h4>
          <p className="text-gray-600 dark:text-gray-400">veyooplatforme@gmail.com</p>
          <p className="text-gray-600 dark:text-gray-400">+3312329320</p>
          <p 
            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-subtext" 
            onClick={() => navigate('/support')}
          >
            Support
          </p>
        </div>
      </div>    
      
      <p className='text-[14px] md:text-[16px] lg:text-[18px] font-normal text-center text-gray-600 dark:text-gray-400'>
        © 2025 <span className='text-subtext'>VEYOO</span>. All rights reserved.
      </p>
    </div>
  )
}

export default Footer