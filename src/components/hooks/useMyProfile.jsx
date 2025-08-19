import { useState, useEffect} from 'react';
import useVeYooAxios from '../Context/useVeYooAxios';
export function useMyProfile() {
  const api = useVeYooAxios();
  const [userData, setUserData] = useState(null);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState(null);
  useEffect(() => {
    let mounted = true;
    api.get('/auth/my-profile/')
      .then(res => {
        if (!mounted) return;
        setUserData(res.data.user);
        setStatus(res.status);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message);
        setStatus(err.response?.status || 500);
      });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userData, error, status };
}
