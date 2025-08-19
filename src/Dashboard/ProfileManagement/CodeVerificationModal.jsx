import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, RefreshCw } from 'lucide-react';
import useVeYooAxios from '../../components/Context/useVeYooAxios';
import { Message } from '../../components/export';

const CodeVerificationModal = ({
  isOpen,
  onClose,
  onCodeVerified,
  email
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef(Array(6).fill(null));
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError('');
      setShowMessage(false);
      setTimeLeft(600);
      inputRefs.current[0]?.focus(); // Auto-focus the first input on open
    }
  }, [isOpen, email]);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setError('Le code a expiré. Veuillez demander un nouveau code.');
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Ensure only digits (0-9) or empty
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const digits = pasted.split('');
    const newCode = [...digits, ...Array(6 - digits.length).fill('')];
    setCode(newCode);
    setError('');
    const firstEmpty = newCode.findIndex(d => d === '');
    const focusIdx = firstEmpty === -1 ? 5 : firstEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setError('Le code a expiré. Veuillez demander un nouveau code.');
      return;
    }
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet à 6 chiffres');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await VeYooAxios.post('/auth/verify-reset-code/', { email, code: fullCode });
      if (response.status === 200) {
        setMessage(response.data.message || 'Code vérifié avec succès');
        setIsSuccess(true);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          setCode(['', '', '', '', '', '']); // Clear code after success
          onCodeVerified(); // Proceed to next step
        }, 2000);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                       (err.response?.status === 400 && 'Code invalide ou expiré') || 
                       'Erreur lors de la vérification du code';
      setMessage(errorMsg);
      setIsSuccess(false);
      setShowMessage(true);
      setCode(['', '', '', '', '', '']); // Clear code on error
      inputRefs.current[0]?.focus(); // Refocus on first input
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    setShowMessage(false);

    try {
      const response = await VeYooAxios.post('/auth/resend-reset-code/', { email });
      setMessage(response.data.message || 'Nouveau code envoyé avec succès');
      setIsSuccess(true);
      setShowMessage(true);
      setTimeLeft(600); // Reset timer to 10 minutes
      setCode(['', '', '', '', '', '']); // Clear existing code
      inputRefs.current[0]?.focus(); // Refocus on first input
      setTimeout(() => setShowMessage(false), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la réexpédition du code');
      setIsSuccess(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    setShowMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {showMessage && <Message isSuccess={isSuccess} message={message} />}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Code de vérification</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nous avons envoyé un code de vérification à 6 chiffres à</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} onPaste={handlePaste} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Entrez le code de vérification
              </label>
              <div className="flex justify-center space-x-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    ref={el => inputRefs.current[idx] = el}      
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={isLoading || timeLeft <= 0}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                      timeLeft <= 0 ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'
                    } ${
                      error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    autoFocus={idx === 0 && isOpen}
                  />
                ))}
              </div>
              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Le code expire dans{' '}
                <span className={`font-medium ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
              {timeLeft > 0 ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Renvoyer le code
                </button>
              ) : (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <span className="text-sm text-red-600 dark:text-red-400">Code expiré</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Renvoyer</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || code.join('').length !== 6 || timeLeft <= 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Vérifier</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationModal;