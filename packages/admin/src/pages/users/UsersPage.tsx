import React from 'react';
import { Typography, Box } from '@mui/material';
import { usePageTitle, useBreadcrumbs } from '../../contexts/LayoutContext';
import { People } from '@mui/icons-material';

export const UsersPage: React.FC = () => {
  usePageTitle('Kullanıcılar');
  useBreadcrumbs([
    {
      label: 'Kullanıcılar',
      icon: <People />,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Kullanıcı Yönetimi
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Bu sayfa henüz geliştirilme aşamasındadır. Kullanıcı listesi, yetkilendirme, profil yönetimi ve doğrulama işlemleri burada yer alacak.
      </Typography>
    </Box>
  );
};

export default UsersPage;