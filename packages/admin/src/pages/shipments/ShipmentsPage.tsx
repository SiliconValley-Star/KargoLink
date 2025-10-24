import React from 'react';
import { Typography, Box } from '@mui/material';
import { usePageTitle, useBreadcrumbs } from '../../contexts/LayoutContext';
import { LocalShipping } from '@mui/icons-material';

export const ShipmentsPage: React.FC = () => {
  usePageTitle('Gönderiler');
  useBreadcrumbs([
    {
      label: 'Gönderiler',
      icon: <LocalShipping />,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gönderiler Yönetimi
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Bu sayfa henüz geliştirilme aşamasındadır. Gönderi listesi, filtreleme, detay görüntüleme ve yönetim özellikleri burada yer alacak.
      </Typography>
    </Box>
  );
};

export default ShipmentsPage;