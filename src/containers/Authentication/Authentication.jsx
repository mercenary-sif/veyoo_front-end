// src/pages/Authentication.jsx
import signin_pic from '../../assets/amico.png';
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { RiLoginCircleLine } from "react-icons/ri";
import { useAuth } from '../../components/Context/AuthContext';
import { useEffect, useState } from 'react';
import { Loading, Message } from '../../components/export';
import { useNavigate } from 'react-router-dom';
import EmailVerificationModal from '../../Dashboard/ProfileManagement/EmailVerificationModal';
import CodeVerificationModal from '../../Dashboard/ProfileManagement/CodeVerificationModal';
import ChangePasswordModal from '../../Dashboard/ProfileManagement/ChangePasswordModal';

const Authentication = () => { 
  const { login, hasRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(true);
  const navigate = useNavigate();

  // State for password reset modals
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  // <-- fixed: keep separate setter for password-change modal
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);

  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result === 'Connexion réussie.') {
      setMsgContent(result);
      setMsgSuccess(true);
      setShowMsg(true);
      const role = hasRole();
      const targetPath = role === 'inspector' ? '/Accueil' : '/dashboard';
     
       setTimeout(() => {
         setShowMsg(false);
         navigate(targetPath);
      }, 2000);    
    } else {
      setMsgContent(result);
      setMsgSuccess(false);
      setShowMsg(true);
       
      const timer = setTimeout(() => {
        setShowMsg(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  const handleForgotPasswordClick = () => {
    setIsEmailVerificationOpen(true);
  };

  const handleEmailVerified = (verifiedEmail) => {
    // store email and proceed to code verification
    setResetEmail(verifiedEmail);
    setIsEmailVerificationOpen(false);
    setIsCodeVerificationOpen(true);
  };

  const handleCodeVerified = () => {
    // close code modal and open change-password modal
    setIsCodeVerificationOpen(false);
    setIsPasswordChangeOpen(true);
    setIsLoading(false); // Ensure loading is off if it was on
  };

  const handlePasswordChanged = () => {
    // Called after password change success inside ChangePasswordModal
    setIsLoading(false);
    setMsgContent('Mot de passe changé avec succès');
    setMsgSuccess(true);
    setShowMsg(true);

    // Close all reset-related modals
    setIsEmailVerificationOpen(false);
    setIsCodeVerificationOpen(false);
    setIsPasswordChangeOpen(false);

    const timer = setTimeout(() => {
      setShowMsg(false);
    }, 2000);
    return () => clearTimeout(timer);
  };

  return (
    <>
      {isLoading && <Loading loading_txt={'Authentification encore'} />}
      {showMsg && <Message message={msgContent} isSuccess={msgSuccess} />}
      <div className="flex flex-col-reverse md:flex-row justify-center items-center p-[2rem]">
        {/* Left Column - Form */}
        <div className="flex flex-1 flex-col justify-center items-center gap-[2rem] p-[2rem]">
          <div className="flex flex-col justify-center items-center gap-[5px] p-[5px] md:p-[2rem]">
            <h1 
              className='text-[26px] md:text-[28px] lg:text-[45px] font-bold text-center'
              style={{ color: 'var(--color-text)' }}
            >
              Bienvenue sur <span className='text-[var(--color-subtext)]'> VEYOO </span>
            </h1>
            <h3 
              className='text-[16px] lg:text-[22px] font-normal text-center'
              style={{ color: 'var(--color-text)' }}
            >
              Simplifiez la gestion de vos véhicules et équipements , Connectez-vous pour accéder à des fonctionnalités
            </h3>
          </div>
       
          <div className="flex flex-col justify-center items-center gap-8">
            {/* Email Input */}
            <div className="flex w-[320px] items-center relative group focus-within:group">
              <FaUser 
                className="absolute left-4 h-5 w-5 text-black/50 group-focus-within:text-[var(--color-subtext)] 
                           dark:text-white/50"
              />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-base pl-12 transition duration-300 ease-in-out 
                           focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/80
                           border-black/20 dark:border-white/20
                           bg-white/20 dark:bg-black/20
                           text-black/55 dark:text-white/60
                           placeholder:text-black/60 dark:placeholder:text-white/50
                           focus:border-[#00c6ff]"
              />
            </div>
            
            {/* Password Input */}
            <div className="flex w-[320px] items-center relative group focus-within:group">
              <IoIosLock 
                className="absolute left-4 h-5 w-5 text-black/50 group-focus-within:text-[var(--color-subtext)] 
                           dark:text-white/50"
              />
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-base pl-12 transition duration-300 ease-in-out 
                           focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/80
                           border-black/20 dark:border-white/20
                           bg-white/20 dark:bg-black/20
                           text-black/55 dark:text-white/60
                           placeholder:text-black/60 dark:placeholder:text-white/50
                           focus:border-[#00c6ff]"
              />
            </div>
          </div>
          <div className="flex justify-end items-center w-[320px]">
            <p 
              className='text-[14px] lg:text-[16px] font-normal text-center hover:cursor-pointer hover:text-subtext' 
              onClick={handleForgotPasswordClick}
            >
              Oublier le mot de passe ?
            </p>
          </div>
          {/* Login Button */}
          <button
            type="button"
            className="w-[320px] p-3 inline-flex justify-center items-center gap-1.5 text-base font-bold border-none rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
            style={{
              backgroundColor: 'var(--color-subtext)',
              color: 'white',
              boxShadow: '0 4px 8px rgba(0, 198, 255, 0.5)'
            }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Connectez-vous'}
            <RiLoginCircleLine className="h-5 w-5" />
          </button>
        </div>
        
        {/* Right Column - Image */}
        <div className="flex flex-1 justify-center items-start gap-[2rem] p-[2rem]">
          <img 
            className='objective-content w-[80%] h-[80%]' 
            src={signin_pic} 
            alt="signin_pic" 
          />
        </div>
      </div>

      {/* Password reset flow modals */}
      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
        onEmailVerified={handleEmailVerified}
      />
      <CodeVerificationModal
        isOpen={isCodeVerificationOpen}
        onClose={() => setIsCodeVerificationOpen(false)}
        onCodeVerified={handleCodeVerified}
        email={resetEmail}
      />
      <ChangePasswordModal
        isOpen={isPasswordChangeOpen}
        onClose={() => setIsPasswordChangeOpen(false)}
        onPasswordChanged={handlePasswordChanged}
        email={resetEmail}
      />
    </>
  );
};

export default Authentication;
