import React from 'react';
import { Typography, Box } from '@mui/material';
import { usePageTitle, useBreadcrumbs } from '../../contexts/LayoutContext';
import { Settings } from '@mui/icons-material';

export const SettingsPage: React.FC = () => {
  usePageTitle('Ayarlar');
  useBreadcrumbs([
    {
      label: 'Ayarlar',
      icon: <Settings />,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Sistem Ayarları
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Bu sayfa henüz geliştirilme aşamasındadır. Sistem konfigürasyonu, güvenlik ayarları, entegrasyon ayarları ve genel parametreler burada yer alacak.
      </Typography>
    </Box>
  );
};

export default SettingsPage;