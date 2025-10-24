import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zaten giriş yapılmışsa dashboard'a yönlendir
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'rememberMe' ? event.target.checked : event.target.value,
    }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error toast AuthContext'te gösteriliyor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (formData.email) {
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } else {
      toast.error('Lütfen önce e-posta adresinizi girin');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white',
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 40 }} />
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Admin Paneli
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              CargoLink yönetim sistemine hoş geldiniz
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box mb={3}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  disabled={isSubmitting}
                  color="primary"
                />
              }
              label="Beni hatırla"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                mb: 2,
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                veya
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="text"
              onClick={handleForgotPassword}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            >
              Şifremi Unuttum
            </Button>
          </form>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Demo Giriş Bilgileri:</strong><br />
              E-posta: admin@cargolink.com<br />
              Şifre: admin123
            </Typography>
          </Alert>

          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} CargoLink. Tüm hakları saklıdır.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;