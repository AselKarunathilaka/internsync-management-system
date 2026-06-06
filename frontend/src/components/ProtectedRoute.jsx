import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0].authority : null;
    const mappedRole = userRole ? userRole.replace('ROLE_', '') : null;
    
    if (!roles.includes(mappedRole)) {
      // Redirect based on role if unauthorized
      if (mappedRole === 'INTERN') {
        return <Navigate to="/intern-dashboard" replace />;
      }
      if (mappedRole === 'EMPLOYEE') {
        return <Navigate to="/employee-dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
