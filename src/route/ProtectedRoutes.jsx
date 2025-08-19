import { Outlet , Navigate } from "react-router-dom";
import { useAuth } from '../components/Context/AuthContext';
const PrivateRoutes = ({ redirectTo = '/' }) => { 
    let {AuthTokens} = useAuth()
    const tokens = AuthTokens(); 
    return(
        tokens?.accessToken ? <Outlet/> : <Navigate to={redirectTo} replace />
    )
}
export default PrivateRoutes ;

