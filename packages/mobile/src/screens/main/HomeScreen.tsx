import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {shipmentService, Shipment} from '../../services/api/shipment';
import {userService, UserStats} from '../../services/api/user';
import {notificationService, Notification} from '../../services/api/notification';

interface HomeScreenProps {
  navigation: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

interface RecentShipment {
  id: string;
  trackingNumber: string;
  destination: string;
  status: string;
  statusColor: string;
  estimatedDelivery: string;
}

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const {width} = Dimensions.get('window');
const cardWidth = (width - 48) / 2 - 8;

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {theme, isDarkMode, toggleTheme} = useTheme();
  const {user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Premium Quick Actions - iOS/Android style
  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: 'Yeni Gönderi',
      description: 'Hızlı gönderi oluştur',
      icon: '📦',
      color: theme.colors.primary,
      route: 'ShipmentCreate',
    },
    {
      id: '2',
      title: 'Takip Et',
      description: 'Gönderi durumunu kontrol et',
      icon: '🚚',
      color: theme.colors.secondary,
      route: 'Track',
    },
    {
      id: '3',
      title: 'Fiyat Hesapla',
      description: 'Anında fiyat teklifi al',
      icon: '💰',
      color: theme.colors.tertiary,
      route: 'QuoteCalculator',
    },
    {
      id: '4',
      title: 'Geçmiş',
      description: 'Gönderi geçmişini görüntüle',
      icon: '📋',
      color: theme.colors.warning,
      route: 'Shipments',
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Her dakika güncelle

    loadDashboardData();
    startAnimations();

    return () => clearInterval(timer);
  }, []);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for notification badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel API çağrıları
      const [statsResponse, shipmentsResponse, notificationsResponse] = await Promise.allSettled([
        userService.getStats(),
        shipmentService.getShipments(1, 3), // Son 3 gönderi
        notificationService.getNotifications(1, 5, undefined, true), // Son 5 okunmamış bildirim
      ]);

      // Stats verilerini işle
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      }

      // Shipments verilerini işle
      if (shipmentsResponse.status === 'fulfilled') {
        setRecentShipments(shipmentsResponse.value.data.shipments);
      }

      // Notifications verilerini işle
      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.data.notifications || []);
      }

    } catch (error) {
      console.error('Dashboard veri yükleme hatası:', error);
      // Fallback olarak mock data kullan
      setStats({
        totalShipments: 15,
        activeShipments: 3,
        deliveredShipments: 12,
        cancelledShipments: 0,
        totalSpent: 2450.50,
        monthlySavings: 387.25,
        averageDeliveryTime: 2.5,
        favoriteCarrier: 'Yurtiçi Kargo'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 17) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      Alert.alert('Hata', 'Veriler yenilenemedi');
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.route === 'ShipmentCreate') {
      navigation.navigate('ShipmentCreate');
    } else if (action.route === 'Shipments') {
      navigation.navigate('Shipments');
    } else if (action.route === 'Track') {
      navigation.navigate('Track');
    } else {
      // Diğer route'lar için placeholder
      console.log(`Navigate to ${action.route}`);
    }
  };

  const handleShipmentPress = (shipment: Shipment) => {
    navigation.navigate('ShipmentDetail', {shipmentId: shipment.id});
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#4CAF50';
      case 'in_transit': return '#2196F3';
      case 'created': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'Teslim Edildi';
      case 'in_transit': return 'Yolda';
      case 'created': return 'Hazırlanıyor';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  // Stats cards data oluştur
  const statsCards: StatsCard[] = stats ? [
    {
      title: 'Toplam Gönderi',
      value: stats.totalShipments.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: '📦',
    },
    {
      title: 'Aktif Gönderi',
      value: stats.activeShipments.toString(),
      change: `+${stats.activeShipments}`,
      changeType: 'positive',
      icon: '🚚',
    },
    {
      title: 'Teslim Edildi',
      value: stats.deliveredShipments.toString(),
      change: `+${stats.deliveredShipments}`,
      changeType: 'positive',
      icon: '✅',
    },
    {
      title: 'Toplam Harcama',
      value: formatPrice(stats.totalSpent),
      change: `+${formatPrice(stats.monthlySavings)}`,
      changeType: 'positive',
      icon: '💸',
    },
  ] : [];

  // Recent shipments data dönüştürme
  const formattedRecentShipments: RecentShipment[] = recentShipments.map(shipment => ({
    id: shipment.id,
    trackingNumber: shipment.trackingNumber,
    destination: `${shipment.senderAddress.city} → ${shipment.receiverAddress.city}`,
    status: getStatusText(shipment.status),
    statusColor: getStatusColor(shipment.status),
    estimatedDelivery: shipment.estimatedDelivery ?
      new Date(shipment.estimatedDelivery).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) :
      'Belirsiz'
  }));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {/* Premium Header with Gradient Background */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              backgroundColor: theme.colors.primary,
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={[styles.userAvatar, {backgroundColor: theme.colors.onPrimary + '20'}]}>
                <Text style={[styles.userInitial, {color: theme.colors.onPrimary}]}>
                  {(user?.firstName?.charAt(0) || 'K').toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[
                  styles.greeting,
                  {
                    color: theme.colors.onPrimary,
                    fontSize: theme.typography.h4.fontSize,
                    fontWeight: theme.typography.h4.fontWeight,
                  }
                ]}>
                  {getGreeting()}, {user?.firstName || 'Kullanıcı'}!
                </Text>
                <Text style={[
                  styles.date,
                  {
                    color: theme.colors.onPrimary + 'CC',
                    fontSize: theme.typography.body2.fontSize,
                  }
                ]}>
                  {formatDate(currentTime)}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              {/* Theme Toggle Button */}
              <TouchableOpacity
                style={[styles.themeToggle, {backgroundColor: theme.colors.onPrimary + '15'}]}
                onPress={toggleTheme}
              >
                <Text style={styles.themeEmoji}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Text>
              </TouchableOpacity>
              
              {/* Notification Button */}
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Animated.View
                  style={[
                    styles.notificationIcon,
                    {
                      backgroundColor: theme.colors.onPrimary + '15',
                      transform: [{scale: pulseAnim}],
                    }
                  ]}
                >
                  <Text style={styles.notificationEmoji}>🔔</Text>
                  <Animated.View style={[
                    styles.notificationBadge,
                    {
                      backgroundColor: theme.colors.error,
                      transform: [{scale: pulseAnim}],
                    }
                  ]}>
                    <Text style={[
                      styles.notificationBadgeText,
                      {color: theme.colors.onError}
                    ]}>
                      3
                    </Text>
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={[styles.searchBar, {backgroundColor: theme.colors.onPrimary + '15'}]}>
            <Text style={[styles.searchIcon, {color: theme.colors.onPrimary + 'AA'}]}>🔍</Text>
            <Text style={[styles.searchPlaceholder, {color: theme.colors.onPrimary + 'AA'}]}>
              Kargo takip numarası ara...
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Premium Quick Actions */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }
        ]}>
          <Text style={[
            styles.sectionTitle,
            {
              color: theme.colors.onBackground,
              fontSize: theme.typography.h5.fontSize,
              fontWeight: theme.typography.h5.fontWeight,
            }
          ]}>
            Hızlı İşlemler
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    width: cardWidth,
                  }
                ]}
                onPress={() => handleQuickAction(action)}
              >
                <View style={[
                  styles.quickActionIcon,
                  {backgroundColor: action.color + '15'}
                ]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={[
                  styles.quickActionTitle,
                  {
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.subtitle2.fontSize,
                    fontWeight: theme.typography.subtitle2.fontWeight,
                  }
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  styles.quickActionDescription,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: theme.typography.caption.fontSize,
                  }
                ]}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Premium Stats Cards */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {
              color: theme.colors.onBackground,
              fontSize: theme.typography.h5.fontSize,
              fontWeight: theme.typography.h5.fontWeight,
            }
          ]}>
            Özet
          </Text>
          
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statsCard,
                  {
                    backgroundColor: theme.colors.surface,
                    width: cardWidth,
                  }
                ]}
              >
                <View style={styles.statsHeader}>
                  <Text style={styles.statsEmoji}>{stat.icon}</Text>
                  <Text style={[
                    styles.statsChange,
                    {
                      color: stat.changeType === 'positive'
                        ? theme.colors.success
                        : stat.changeType === 'negative'
                        ? theme.colors.error
                        : theme.colors.onSurfaceVariant
                    }
                  ]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={[
                  styles.statsValue,
                  {
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.h4.fontSize,
                    fontWeight: theme.typography.h4.fontWeight,
                  }
                ]}>
                  {stat.value}
                </Text>
                <Text style={[
                  styles.statsTitle,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: theme.typography.caption.fontSize,
                  }
                ]}>
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Shipments - Premium Design */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              {
                color: theme.colors.onBackground,
                fontSize: theme.typography.h5.fontSize,
                fontWeight: theme.typography.h5.fontWeight,
              }
            ]}>
              Son Gönderiler
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shipments')}>
              <Text style={[
                styles.seeAllText,
                {color: theme.colors.primary, fontWeight: '600'}
              ]}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shipmentsContainer}>
            {formattedRecentShipments.map((shipment, index) => (
              <TouchableOpacity
                key={shipment.id}
                style={[
                  styles.shipmentCard,
                  {backgroundColor: theme.colors.surface}
                ]}
                onPress={() => handleShipmentPress(recentShipments[index])}
              >
                <View style={styles.shipmentHeader}>
                  <View style={styles.shipmentInfo}>
                    <Text style={[
                      styles.trackingNumber,
                      {
                        color: theme.colors.onSurface,
                        fontSize: theme.typography.subtitle1.fontSize,
                        fontWeight: theme.typography.subtitle1.fontWeight,
                      }
                    ]}>
                      {shipment.trackingNumber}
                    </Text>
                    <Text style={[
                      styles.shipmentDestination,
                      {
                        color: theme.colors.onSurfaceVariant,
                        fontSize: theme.typography.body2.fontSize,
                      }
                    ]}>
                      {shipment.destination}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {backgroundColor: shipment.statusColor + '15'}
                  ]}>
                    <Text style={[
                      styles.statusText,
                      {color: shipment.statusColor, fontWeight: '600'}
                    ]}>
                      {shipment.status}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.deliveryDate,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: theme.typography.caption.fontSize,
                  }
                ]}>
                  📅 Tahmini Teslimat: {shipment.estimatedDelivery}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Premium Promotion Banner */}
        <View style={styles.section}>
          <TouchableOpacity style={[
            styles.promotionBanner,
            {backgroundColor: theme.colors.primaryContainer}
          ]}>
            <View style={styles.promotionContent}>
              <Text style={[
                styles.promotionTitle,
                {
                  color: theme.colors.onPrimaryContainer,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: theme.typography.subtitle1.fontWeight,
                }
              ]}>
                🎉 Yeni Kullanıcı Kampanyası
              </Text>
              <Text style={[
                styles.promotionDescription,
                {
                  color: theme.colors.onPrimaryContainer,
                  fontSize: theme.typography.body2.fontSize,
                }
              ]}>
                İlk 3 gönderiinizde %20 indirim kazanın!
              </Text>
            </View>
            <View style={[
              styles.promotionArrow,
              {backgroundColor: theme.colors.primary}
            ]}>
              <Text style={[
                styles.promotionArrowText,
                {color: theme.colors.onPrimary}
              ]}>
                →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  greeting: {
    marginBottom: 4,
  },
  date: {
    opacity: 0.8,
  },
  notificationButton: {
    padding: 4,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationEmoji: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeEmoji: {
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionTitle: {
    marginBottom: 4,
  },
  quickActionDescription: {
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsEmoji: {
    fontSize: 16,
  },
  statsChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsValue: {
    marginBottom: 4,
  },
  statsTitle: {},
  shipmentsContainer: {},
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shipmentInfo: {
    flex: 1,
  },
  trackingNumber: {
    marginBottom: 4,
  },
  shipmentDestination: {
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shipmentFooter: {},
  deliveryDate: {
    marginTop: 4,
  },
  promotionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promotionContent: {
    flex: 1,
    marginRight: 16,
  },
  promotionTitle: {
    marginBottom: 4,
  },
  promotionDescription: {
    lineHeight: 18,
  },
  promotionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionArrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default HomeScreen;