import React from 'react';
import { Typography, Box } from '@mui/material';
import { usePageTitle, useBreadcrumbs } from '../../contexts/LayoutContext';
import { Assessment } from '@mui/icons-material';

export const ReportsPage: React.FC = () => {
  usePageTitle('Raporlar');
  useBreadcrumbs([
    {
      label: 'Raporlar',
      icon: <Assessment />,
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Raporlar ve Analizler
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Bu sayfa henüz geliştirilme aşamasındadır. Mali raporlar, performans analizi, grafikler ve istatistiksel veriler burada yer alacak.
      </Typography>
    </Box>
  );
};

export default ReportsPage;