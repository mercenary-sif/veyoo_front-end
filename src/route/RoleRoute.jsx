// src/components/Routes/RoleRoute.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../components/Context/AuthContext";

const RoleRoute = ({ allowedRoles = [], redirectTo = "/" }) => {
  const { AuthTokens , hasRole } = useAuth();
  const tokens = AuthTokens();
  const access = tokens?.accessToken;

  if (!access) {
    return <Navigate to="/" replace />;
  }

 
  let role;
  try {
    role =hasRole();
    if(!role){
      return <Navigate to="/" replace />;
    } 
  } catch {
    return <Navigate to="/" replace />;
  }

  const userRole = role;
  return(
       allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to={redirectTo}/>
    )
};

export default RoleRoute;
