import React from 'react';
import { Typography, Box } from '@mui/material';
import { usePageTitle, useBreadcrumbs } from '../../contexts/LayoutContext';
import { Business } from '@mui/icons-material';

export const CarriersPage: React.FC = () => {
  usePageTitle('Kargo Firmaları');
  useBreadcrumbs([
    {
      label: 'Kargo Firmaları',
      icon: <Business />,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Kargo Firmaları Yönetimi
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Bu sayfa henüz geliştirilme aşamasındadır. Kargo firma listesi, API entegrasyonları, fiyat yönetimi ve performans takibi burada yer alacak.
      </Typography>
    </Box>
  );
};

export default CarriersPage;