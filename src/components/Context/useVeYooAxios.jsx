import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from './AuthContext';

const baseURL = 'https://veyoo-backend-server.onrender.com';
let _instance = null;

const useVeYooAxios = () => {
  // We only need logout from the auth context here — token values are always read from localStorage
  // to avoid stale closures.
  const { logout } = useAuth();

  // Create instance once, but always sync its default Authorization header with localStorage
  if (!_instance) {
    _instance = axios.create({ baseURL });

    // Request interceptor: always read latest tokens from localStorage and refresh when needed
    _instance.interceptors.request.use(
      async (req) => {
        const stored = localStorage.getItem('user');
        if (!stored) return req;

        let tokens;
        try {
          tokens = JSON.parse(stored);
        } catch (e) {
          return req;
        }

        const access = tokens?.access || tokens?.accessToken;

        // If we have an access token, attach it and check expiration
        if (access) {
          req.headers = req.headers || {};
          req.headers.Authorization = `Bearer ${access}`;

          try {
            const payload = JSON.parse(atob(access.split('.')[1]));
            const isExpired = dayjs.unix(payload.exp).diff(dayjs()) < 1;
            if (!isExpired) {
              return req;
            }
          } catch (err) {
            // If decoding fails, we'll try to refresh below
          }
        } else {
          // No access token — nothing to do
          return req;
        }

        // Access token expired -> try to refresh
        const refresh = tokens?.refresh || tokens?.refreshToken;
        if (!refresh) {
          // No refresh token -> force logout
          logout();
          return req;
        }

        try {
          // Use plain axios (no interceptors) to call refresh endpoint
          const response = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh });

          // Support both response shapes: { tokens: { access, refresh } } or { access, refresh }
          const newTokens = response.data.tokens ?? response.data;

          // Persist refreshed tokens
          localStorage.setItem('user', JSON.stringify(newTokens));

          const newAccess = newTokens?.access || newTokens?.accessToken;
          if (newAccess) {
            req.headers.Authorization = `Bearer ${newAccess}`;
            // keep instance defaults in sync
            _instance.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          }

          return req;
        } catch (err) {
          // Refresh failed -> logout and reject so caller can handle (401 etc.)
          logout();
          return Promise.reject(err);
        }
      },
      (error) => Promise.reject(error)
    );
  } else {
    // If instance already exists, sync default header with latest localStorage value.
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const access = parsed?.access || parsed?.accessToken;
        if (access) {
          _instance.defaults.headers.common.Authorization = `Bearer ${access}`;
        } else {
          delete _instance.defaults.headers.common.Authorization;
        }
      } catch (e) {
        // ignore parsing error
      }
    } else {
      delete _instance.defaults.headers.common.Authorization;
    }
  }

  return _instance;
};

export default useVeYooAxios;