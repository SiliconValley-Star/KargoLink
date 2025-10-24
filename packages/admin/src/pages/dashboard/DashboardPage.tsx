import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  Fade,
  Grow,
  Tooltip,
  IconButton,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  LocalShipping,
  People,
  AttachMoney,
  Business,
  Refresh,
  Timeline,
  Speed,
  Security,
  NotificationsActive,
  Analytics,
  Dashboard as DashboardIcon,
  ArrowUpward,
  ArrowDownward,
  Circle,
  CheckCircle,
  Schedule,
  Error,
  Warning,
  Info,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { usePageTitle } from '../../contexts/LayoutContext';

// Premium Mock Data with real-time updates
const mockMetrics = {
  totalShipments: { value: 12847, change: 15.2, trend: 'up' as const, target: 15000 },
  activeUsers: { value: 8925, change: 23.8, trend: 'up' as const, target: 10000 },
  totalRevenue: { value: 245680, change: 8.4, trend: 'up' as const, target: 300000 },
  carrierPartners: { value: 124, change: 12.1, trend: 'up' as const, target: 150 },
};

const mockRealTimeData = {
  systemHealth: 98.5,
  activeShipments: 1247,
  todayDeliveries: 847,
  avgDeliveryTime: 2.8,
  customerSatisfaction: 4.7,
  apiResponseTime: 145,
};

const mockActivities = [
  {
    id: '1',
    type: 'success',
    title: 'Yeni Premium Müşteri',
    description: 'Ahmet Logistics aylık paket satın aldı',
    time: '2 dakika önce',
    value: '₺2,450',
    avatar: 'A',
  },
  {
    id: '2',
    type: 'shipment',
    title: 'Bulk Gönderi Oluşturuldu',
    description: '250 paket İstanbul → Ankara rotasında',
    time: '5 dakika önce',
    value: '+250',
    avatar: 'B',
  },
  {
    id: '3',
    type: 'achievement',
    title: '10K Teslimat Milestone',
    description: 'Bu ay 10.000 başarılı teslimat tamamlandı',
    time: '12 dakika önce',
    value: '10K',
    avatar: '🎉',
  },
  {
    id: '4',
    type: 'integration',
    title: 'API Entegrasyonu',
    description: 'Yeni kargo ortağı sisteme bağlandı',
    time: '18 dakika önce',
    value: 'NEW',
    avatar: 'I',
  },
];

const mockPerformanceData = [
  { label: 'Sistem Durumu', value: 98.7, color: 'success' as const, icon: <Security /> },
  { label: 'API Performance', value: 92.3, color: 'primary' as const, icon: <Speed /> },
  { label: 'Müşteri Memnuniyeti', value: 96.8, color: 'secondary' as const, icon: <People /> },
  { label: 'Teslimat Başarısı', value: 94.2, color: 'info' as const, icon: <LocalShipping /> },
];

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [animatedValues, setAnimatedValues] = useState(mockMetrics);
  const [realTimeData, setRealTimeData] = useState(mockRealTimeData);

  usePageTitle('Dashboard');

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeShipments: prev.activeShipments + Math.floor(Math.random() * 10) - 5,
        todayDeliveries: prev.todayDeliveries + Math.floor(Math.random() * 5),
        apiResponseTime: Math.max(100, prev.apiResponseTime + Math.floor(Math.random() * 20) - 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  const PremiumMetricCard: React.FC<{
    title: string;
    value: number;
    change: number;
    trend: 'up' | 'down';
    target: number;
    icon: React.ReactNode;
    format?: 'number' | 'currency';
    delay?: number;
  }> = ({ title, value, change, trend, target, icon, format = 'number', delay = 0 }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') {
        return `₺${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    };

    const progressValue = (value / target) * 100;
    const isPositive = trend === 'up';

    return (
      <Grow in timeout={800 + delay * 200}>
        <Card
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {title}
                </Typography>
                <Typography 
                  variant="h3" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: '2rem',
                    background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  {formatValue(value)}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                {icon}
              </Box>
            </Box>
            
            <Box mb={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {isPositive ? (
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  bu ay
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressValue, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Hedef: {formatValue(target)} ({Math.round(progressValue)}%)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  const RealTimeMetric: React.FC<{
    label: string;
    value: number | string;
    unit?: string;
    color: 'primary' | 'success' | 'warning' | 'error';
    icon: React.ReactNode;
    trend?: number;
  }> = ({ label, value, unit = '', color, icon, trend }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)} 0%, ${alpha(theme.palette[color].main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.12)} 0%, ${alpha(theme.palette[color].main, 0.06)} 100%)`,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box display="flex" alignItems="baseline" gap={1}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: `${color}.main` }}>
          {value}{unit}
        </Typography>
        {trend !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {trend > 0 ? (
              <KeyboardArrowUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : trend < 0 ? (
              <KeyboardArrowDown sx={{ fontSize: 16, color: 'error.main' }} />
            ) : null}
            {trend !== 0 && (
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  const ActivityItem: React.FC<{
    activity: typeof mockActivities[0];
    index: number;
  }> = ({ activity, index }) => {
    const getActivityColor = (type: string) => {
      switch (type) {
        case 'success': return 'success.main';
        case 'shipment': return 'primary.main';
        case 'achievement': return 'secondary.main';
        case 'integration': return 'info.main';
        default: return 'text.primary';
      }
    };

    return (
      <Fade in timeout={600 + index * 100}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateX(4px)',
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: getActivityColor(activity.type),
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {activity.avatar}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {activity.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {activity.value}
            </Box>
          </Box>
        </Box>
      </Fade>
    );
  };

  const PerformanceIndicator: React.FC<{
    data: typeof mockPerformanceData[0];
    index: number;
  }> = ({ data, index }) => {
    const getColorValue = (colorName: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error') => {
      return theme.palette[colorName].main;
    };

    return (
      <Grow in timeout={800 + index * 150}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(getColorValue(data.color), 0.08)} 0%, ${alpha(getColorValue(data.color), 0.03)} 100%)`,
            border: `1px solid ${alpha(getColorValue(data.color), 0.12)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 28px ${alpha(getColorValue(data.color), 0.15)}`,
            },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: `${data.color}.main` }}>
                {data.icon}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {data.label}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: `${data.color}.main` }}>
              {data.value}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={data.value}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(getColorValue(data.color), 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: `${data.color}.main`,
              },
            }}
          />
        </Box>
      </Grow>
    );
  };

  return (
    <Box>
      {/* Premium Header */}
      <Fade in timeout={600}>
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                CargoLink Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Premium Enterprise Analytics & Control Center
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Analitik Rapor
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={isLoading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Yenile
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>

      {isLoading && <LinearProgress sx={{ mb: 2, height: 3, borderRadius: 1.5 }} />}

      {/* Premium Metrics Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <PremiumMetricCard
            title="Toplam Gönderiler"
            value={animatedValues.totalShipments.value}
            change={animatedValues.totalShipments.change}
            trend={animatedValues.totalShipments.trend}
            target={animatedValues.totalShipments.target}
            icon={<LocalShipping />}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <PremiumMetricCard
            title="Aktif Kullanıcılar"
            value={animatedValues.activeUsers.value}
            change={animatedValues.activeUsers.change}
            trend={animatedValues.activeUsers.trend}
            target={animatedValues.activeUsers.target}
            icon={<People />}
            delay={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <PremiumMetricCard
            title="Toplam Gelir"
            value={animatedValues.totalRevenue.value}
            change={animatedValues.totalRevenue.change}
            trend={animatedValues.totalRevenue.trend}
            target={animatedValues.totalRevenue.target}
            icon={<AttachMoney />}
            format="currency"
            delay={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <PremiumMetricCard
            title="Kargo Ortakları"
            value={animatedValues.carrierPartners.value}
            change={animatedValues.carrierPartners.change}
            trend={animatedValues.carrierPartners.trend}
            target={animatedValues.carrierPartners.target}
            icon={<Business />}
            delay={3}
          />
        </Grid>
      </Grid>

      {/* Real-time Monitoring */}
      <Fade in timeout={1000}>
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                }}
              >
                <Timeline />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gerçek Zamanlı Sistem Durumu
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'success.main',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  animation: 'pulse 2s infinite',
                }}
              >
                CANLI
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <RealTimeMetric
                  label="Sistem Sağlığı"
                  value={realTimeData.systemHealth}
                  unit="%"
                  color="success"
                  icon={<Security />}
                  trend={0.3}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RealTimeMetric
                  label="Aktif Gönderiler"
                  value={realTimeData.activeShipments}
                  color="primary"
                  icon={<LocalShipping />}
                  trend={2.1}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RealTimeMetric
                  label="Bugünkü Teslimatlar"
                  value={realTimeData.todayDeliveries}
                  color="success"
                  icon={<CheckCircle />}
                  trend={5.7}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RealTimeMetric
                  label="API Yanıt Süresi"
                  value={realTimeData.apiResponseTime}
                  unit="ms"
                  color="warning"
                  icon={<Speed />}
                  trend={-1.2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Performance Indicators */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: 'fit-content',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Performans Göstergeleri
              </Typography>
              <Stack spacing={2}>
                {mockPerformanceData.map((data, index) => (
                  <PerformanceIndicator key={index} data={data} index={index} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Premium Activities */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Premium İş Aktiviteleri
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NotificationsActive />}
                  sx={{ minWidth: 'auto' }}
                >
                  Tümünü Gör
                </Button>
              </Box>
              <Stack spacing={1}>
                {mockActivities.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;