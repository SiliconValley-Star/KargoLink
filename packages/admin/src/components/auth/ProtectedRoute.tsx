import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'support';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'admin'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Loading durumu
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Box mt={2} color="text.secondary">
            Yetkilendirme kontrol ediliyor...
          </Box>
        </Box>
      </Box>
    );
  }

  // Giriş yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin yetkisi kontrolü
  if (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'support') {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
        p={3}
      >
        <Box textAlign="center">
          <Box fontSize="4rem" mb={2}>🚫</Box>
          <Box variant="h4" component="h1" mb={2} color="error.main">
            Yetkisiz Erişim
          </Box>
          <Box color="text.secondary" mb={3}>
            Bu sayfaya erişim için admin yetkilerine sahip olmalısınız.
          </Box>
          <Box 
            component="button"
            onClick={() => window.location.href = '/login'}
            sx={{
              px: 3,
              py: 1,
              bgcolor: 'primary.main',
              color: 'white',
              border: 'none',
              borderRadius: 1,
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Giriş Sayfasına Dön
          </Box>
        </Box>
      </Box>
    );
  }

  // Özel rol kontrolü (eğer belirtilmişse)
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        p={3}
      >
        <Box textAlign="center">
          <Box fontSize="4rem" mb={2}>⚠️</Box>
          <Box variant="h4" component="h1" mb={2} color="warning.main">
            Yetki Seviyesi Yetersiz
          </Box>
          <Box color="text.secondary" mb={3}>
            Bu işlem için {requiredRole} yetkilerine sahip olmalısınız.
          </Box>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;