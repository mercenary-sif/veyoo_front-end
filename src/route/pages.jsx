import React from 'react';
import {Routes ,  Route,BrowserRouter as  Router ,Navigate } from "react-router-dom"
import ScrollToTop from "../ScrollToTop/ScrollResteration"
import { DashboardLayout, Home, Malfunctions, Materials, Notifications, Profile, Reservations, signin, Support, Vihecules } from "../pages/expost"
import { Dashboard } from "../components/export"
import { AnnouncementManagement, AssetManagement, MalfunctionManagement, NotificationManagement, PrecheckManagement, ProfileManagement, ReservationManagement, SupportManagement, UserManagement, VehicleManagement } from "../Dashboard/export"
import { AuthProvide, useAuth } from "../components/Context/AuthContext"
import PrivateRoutes from "./ProtectedRoutes"
import RoleRoute from "./RoleRoute"

const Pages = () => {
  return (
    <> 
    <Router>
      <AuthProvide>
     <ScrollToTop/>
      <Routes>
           <Route path="/" element={<SigninOrRedirect />} />
         <Route Component={PrivateRoutes}>
            <Route element={<RoleRoute allowedRoles={["inspector"]} redirectTo="/dashboard" />}>
            
              <Route path="/Accueil" element={<Home/>} />
              <Route path="/Profile" Component={Profile}/> 
              <Route path="/notifications" element={<Notifications/>}/> 
              <Route path="/vehicles" element={<Vihecules/>}/> 
              <Route path="/équipement" element={<Materials/>}/> 
              <Route path="/pannes" element={<Malfunctions/>}/> 
              <Route path="/reservation" element={<Reservations />} />
              <Route path="/support" element={<Support />} />
            </Route>  
             <Route 
          element={
            <RoleRoute 
              allowedRoles={["admin", "manager"]} 
              redirectTo="/Accueil" 
            />
          }
        >
              <Route path="/dashboard" element={<DashboardLayout />} >
                  <Route path="" element={<Dashboard />} /> 
                  <Route path="users" element={<UserManagement />} />
                  <Route path="reservations" element={<ReservationManagement />} />  
                  <Route path="vehicles" element={<VehicleManagement />} />
                  <Route path="assets" element={<AssetManagement />} /> 
                  <Route path="notifications" element={<NotificationManagement/>}/>
                  <Route path="announcements" element={<AnnouncementManagement/>}/>
                  <Route path="profile" element={<ProfileManagement/>}/>
                  <Route path="malfunctions" element={<MalfunctionManagement/>}/>
                  <Route path="prechecks" element={<PrecheckManagement/>}/> 
                  <Route path="support" element={<SupportManagement/>} />  
              </Route> 
            </Route>
         </Route>
         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvide>
      </Router>
      
      
    </>
  )
}

export default Pages

function SigninOrRedirect() {
  const { AuthTokens, hasRole } = useAuth();
  const tokens = AuthTokens?.() || {};
  const access = tokens?.accessToken;

  if (!access) return React.createElement(signin); 

  // If token exists, route by role
  if (hasRole && typeof hasRole === 'function') {
    if (hasRole(['admin', 'manager'])) return <Navigate to="/dashboard" replace />;
    if (hasRole(['inspector'])) return <Navigate to="/Accueil" replace />;
  }

  return <Navigate to="/Accueil" replace />;
}