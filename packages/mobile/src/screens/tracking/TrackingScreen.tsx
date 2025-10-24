import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {webSocketClient, TrackingUpdate} from '../../services/websocket/websocket.client';

interface TrackingScreenProps {
  navigation: any;
  route?: {
    params?: {
      trackingNumber?: string;
      shipmentId?: string;
    };
  };
}

interface TrackingEvent {
  id: string;
  status: string;
  message: string;
  location?: string;
  timestamp: string;
  isCompleted: boolean;
}

interface TrackingInfo {
  trackingNumber: string;
  shipmentId: string;
  currentStatus: string;
  statusMessage: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const TrackingScreen: React.FC<TrackingScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const [trackingNumber, setTrackingNumber] = useState(
    route?.params?.trackingNumber || ''
  );
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Status progression for UI
  const statusSteps = [
    {key: 'PENDING', label: 'Hazırlanıyor', icon: '📋'},
    {key: 'PICKED_UP', label: 'Toplandı', icon: '📦'},
    {key: 'IN_TRANSIT', label: 'Taşımada', icon: '🚚'},
    {key: 'OUT_FOR_DELIVERY', label: 'Dağıtımda', icon: '🚛'},
    {key: 'DELIVERED', label: 'Teslim Edildi', icon: '✅'},
  ];

  useEffect(() => {
    initializeWebSocket();
    
    // If we have a shipment ID from route params, start tracking
    if (route?.params?.shipmentId) {
      startTrackingShipment(route.params.shipmentId);
    }

    return () => {
      cleanupWebSocket();
    };
  }, []);

  useEffect(() => {
    // Start pulse animation for active tracking
    if (trackingInfo && ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(trackingInfo.currentStatus)) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [trackingInfo?.currentStatus]);

  const initializeWebSocket = async () => {
    try {
      if (!webSocketClient.isConnected) {
        await webSocketClient.connect();
      }
      
      setIsConnected(webSocketClient.isConnected);
      
      // Set up event listeners
      webSocketClient.on('tracking_update', handleTrackingUpdate);
      webSocketClient.on('connection_established', () => setIsConnected(true));
      webSocketClient.on('connection_lost', () => setIsConnected(false));
      webSocketClient.on('connection_restored', () => setIsConnected(true));
      
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  };

  const cleanupWebSocket = () => {
    if (trackingInfo?.shipmentId) {
      webSocketClient.unsubscribeFromShipment(trackingInfo.shipmentId);
    }
    
    // Remove event listeners
    webSocketClient.off('tracking_update', handleTrackingUpdate);
  };

  const handleTrackingUpdate = (update: TrackingUpdate) => {
    console.log('📍 Received tracking update:', update);
    
    if (trackingInfo && update.shipmentId === trackingInfo.shipmentId) {
      updateTrackingInfo(update);
    }
  };

  const updateTrackingInfo = (update: TrackingUpdate) => {
    setTrackingInfo(prev => {
      if (!prev) return null;

      const newEvent: TrackingEvent = {
        id: Date.now().toString(),
        status: update.status,
        message: update.message,
        location: update.location?.address,
        timestamp: update.timestamp,
        isCompleted: true
      };

      return {
        ...prev,
        currentStatus: update.status,
        statusMessage: update.message,
        estimatedDelivery: update.estimatedDelivery || prev.estimatedDelivery,
        events: [newEvent, ...prev.events],
        driverInfo: update.driverInfo || prev.driverInfo,
        location: update.location || prev.location
      };
    });

    // Show notification for important status changes
    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(update.status)) {
      Alert.alert(
        'Gönderi Durumu Güncellemesi',
        update.message,
        [{text: 'Tamam', style: 'default'}]
      );
    }
  };

  const searchShipment = async () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Hata', 'Lütfen takip numarası giriniz.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock API call - gerçek uygulamada API'den gelecek
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockShipmentId = trackingNumber.replace('CL', '');
      const mockTrackingInfo: TrackingInfo = {
        trackingNumber: trackingNumber,
        shipmentId: mockShipmentId,
        currentStatus: 'IN_TRANSIT',
        statusMessage: 'Gönderiniz taşıma sürecinde',
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            id: '1',
            status: 'PENDING',
            message: 'Gönderi hazırlandı',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isCompleted: true
          },
          {
            id: '2',
            status: 'PICKED_UP',
            message: 'Gönderi toplandı - İstanbul Şube',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isCompleted: true
          },
          {
            id: '3',
            status: 'IN_TRANSIT',
            message: 'Gönderiniz İstanbul-Ankara rotasında',
            location: 'Ankara yolunda',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            isCompleted: true
          }
        ],
        location: {
          lat: 40.1234,
          lng: 32.5678,
          address: 'Ankara yolu üzeri, KM 150'
        }
      };
      
      setTrackingInfo(mockTrackingInfo);
      
      // Subscribe to real-time updates for this shipment
      await startTrackingShipment(mockShipmentId);
      
    } catch (error) {
      Alert.alert('Hata', 'Gönderi bulunamadı. Lütfen takip numarasını kontrol ediniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const startTrackingShipment = async (shipmentId: string) => {
    try {
      await webSocketClient.subscribeToShipment(shipmentId);
      console.log(`🔔 Started tracking shipment: ${shipmentId}`);
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  const handleRefresh = async () => {
    if (!trackingInfo) return;
    
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const startPulseAnimation = () => {
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

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': theme.colors.warning,
      'PICKED_UP': theme.colors.info,
      'IN_TRANSIT': theme.colors.primary,
      'OUT_FOR_DELIVERY': theme.colors.secondary,
      'DELIVERED': theme.colors.success,
      'CANCELLED': theme.colors.error,
    };
    return colorMap[status] || theme.colors.onSurfaceVariant;
  };

  const getCurrentStepIndex = () => {
    if (!trackingInfo) return -1;
    return statusSteps.findIndex(step => step.key === trackingInfo.currentStatus);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeliveryDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    return `${diffDays} gün sonra`;
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Search Section */}
      <View style={[styles.searchSection, {backgroundColor: theme.colors.surface}]}>
        <Text style={[
          styles.searchTitle,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.h6.fontSize,
            fontWeight: theme.typography.h6.fontWeight,
          }
        ]}>
          Gönderi Takibi
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.background,
                color: theme.colors.onBackground,
              }
            ]}
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            placeholder="CL123456789"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCapitalize="characters"
            onSubmitEditing={searchShipment}
          />
          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={searchShipment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            ) : (
              <Text style={[
                styles.searchButtonText,
                {color: theme.colors.onPrimary}
              ]}>
                Takip Et
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={[
            styles.connectionDot,
            {backgroundColor: isConnected ? theme.colors.success : theme.colors.error}
          ]} />
          <Text style={[
            styles.connectionText,
            {color: theme.colors.onSurfaceVariant}
          ]}>
            {isConnected ? 'Canlı takip aktif' : 'Bağlantı bekleniyor'}
          </Text>
        </View>
      </View>

      {/* Tracking Results */}
      {trackingInfo ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Current Status Card */}
          <View style={[styles.statusCard, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.statusHeader}>
              <Animated.View style={[
                styles.statusIcon,
                {
                  backgroundColor: getStatusColor(trackingInfo.currentStatus) + '20',
                  transform: [{scale: pulseAnim}]
                }
              ] as any}>
                <Text style={styles.statusEmoji}>
                  {statusSteps.find(s => s.key === trackingInfo.currentStatus)?.icon || '📦'}
                </Text>
              </Animated.View>
              
              <View style={styles.statusInfo}>
                <Text style={[
                  styles.statusTitle,
                  {
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.h6.fontSize,
                    fontWeight: theme.typography.h6.fontWeight,
                  }
                ]}>
                  {trackingInfo.trackingNumber}
                </Text>
                <Text style={[
                  styles.statusMessage,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: theme.typography.body2.fontSize,
                  }
                ]}>
                  {trackingInfo.statusMessage}
                </Text>
              </View>
            </View>

            {trackingInfo.estimatedDelivery && (
              <View style={[styles.deliveryInfo, {backgroundColor: theme.colors.primaryContainer}]}>
                <Text style={[
                  styles.deliveryLabel,
                  {color: theme.colors.onPrimaryContainer}
                ]}>
                  Tahmini Teslimat: {formatDeliveryDate(trackingInfo.estimatedDelivery)}
                </Text>
                <Text style={[
                  styles.deliveryDate,
                  {color: theme.colors.onPrimaryContainer}
                ]}>
                  {formatDate(trackingInfo.estimatedDelivery)}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Stepper */}
          <View style={[styles.progressCard, {backgroundColor: theme.colors.surface}]}>
            <Text style={[
              styles.progressTitle,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.subtitle1.fontSize,
                fontWeight: theme.typography.subtitle1.fontWeight,
              }
            ]}>
              Gönderi Durumu
            </Text>
            
            <View style={styles.stepper}>
              {statusSteps.map((step, index) => {
                const isActive = index <= getCurrentStepIndex();
                const isCurrent = index === getCurrentStepIndex();
                
                return (
                  <View key={step.key} style={styles.stepContainer}>
                    <View style={styles.stepItem}>
                      <View style={[
                        styles.stepCircle,
                        {
                          backgroundColor: isActive 
                            ? getStatusColor(step.key)
                            : theme.colors.surfaceVariant,
                          borderColor: isCurrent 
                            ? getStatusColor(step.key)
                            : 'transparent',
                          borderWidth: isCurrent ? 2 : 0,
                        }
                      ]}>
                        <Text style={[
                          styles.stepIcon,
                          {opacity: isActive ? 1 : 0.5}
                        ]}>
                          {step.icon}
                        </Text>
                      </View>
                      <Text style={[
                        styles.stepLabel,
                        {
                          color: isActive 
                            ? theme.colors.onSurface 
                            : theme.colors.onSurfaceVariant,
                          fontWeight: isCurrent ? '600' : '400',
                        }
                      ]}>
                        {step.label}
                      </Text>
                    </View>
                    
                    {index < statusSteps.length - 1 && (
                      <View style={[
                        styles.stepLine,
                        {
                          backgroundColor: isActive 
                            ? getStatusColor(step.key)
                            : theme.colors.surfaceVariant,
                        }
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Timeline Events */}
          <View style={[styles.timelineCard, {backgroundColor: theme.colors.surface}]}>
            <Text style={[
              styles.timelineTitle,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.subtitle1.fontSize,
                fontWeight: theme.typography.subtitle1.fontWeight,
              }
            ]}>
              Detaylı Takip
            </Text>
            
            <View style={styles.timeline}>
              {trackingInfo.events.map((event, index) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    {backgroundColor: getStatusColor(event.status)}
                  ]} />
                  
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineMessage,
                      {
                        color: theme.colors.onSurface,
                        fontSize: theme.typography.body2.fontSize,
                      }
                    ]}>
                      {event.message}
                    </Text>
                    
                    {event.location && (
                      <Text style={[
                        styles.timelineLocation,
                        {
                          color: theme.colors.onSurfaceVariant,
                          fontSize: theme.typography.caption.fontSize,
                        }
                      ]}>
                        📍 {event.location}
                      </Text>
                    )}
                    
                    <Text style={[
                      styles.timelineDate,
                      {
                        color: theme.colors.onSurfaceVariant,
                        fontSize: theme.typography.caption.fontSize,
                      }
                    ]}>
                      {formatDate(event.timestamp)}
                    </Text>
                  </View>
                  
                  {index < trackingInfo.events.length - 1 && (
                    <View style={[
                      styles.timelineConnector,
                      {backgroundColor: theme.colors.outline}
                    ]} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Driver Info */}
          {trackingInfo.driverInfo && (
            <View style={[styles.driverCard, {backgroundColor: theme.colors.surface}]}>
              <Text style={[
                styles.driverTitle,
                {
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: theme.typography.subtitle1.fontWeight,
                }
              ]}>
                Sürücü Bilgileri
              </Text>
              
              <View style={styles.driverInfo}>
                <Text style={[
                  styles.driverName,
                  {color: theme.colors.onSurface}
                ]}>
                  👤 {trackingInfo.driverInfo.name}
                </Text>
                <Text style={[
                  styles.driverPhone,
                  {color: theme.colors.onSurfaceVariant}
                ]}>
                  📞 {trackingInfo.driverInfo.phone}
                </Text>
                <Text style={[
                  styles.driverVehicle,
                  {color: theme.colors.onSurfaceVariant}
                ]}>
                  🚚 {trackingInfo.driverInfo.vehicleInfo}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={[
            styles.emptyTitle,
            {
              color: theme.colors.onBackground,
              fontSize: theme.typography.h6.fontSize,
            }
          ]}>
            Gönderi Takip Sistemi
          </Text>
          <Text style={[
            styles.emptyDescription,
            {
              color: theme.colors.onSurfaceVariant,
              fontSize: theme.typography.body2.fontSize,
            }
          ]}>
            Takip numarası girerek gönderinizin anlık durumunu öğrenin
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchTitle: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    marginBottom: 4,
  },
  statusMessage: {
    lineHeight: 20,
  },
  deliveryInfo: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    marginBottom: 20,
  },
  stepper: {
    gap: 16,
  },
  stepContainer: {
    position: 'relative',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepIcon: {
    fontSize: 16,
  },
  stepLabel: {
    fontSize: 14,
  },
  stepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 32,
  },
  timelineCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineTitle: {
    marginBottom: 20,
  },
  timeline: {},
  timelineItem: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    marginBottom: 4,
    lineHeight: 20,
  },
  timelineLocation: {
    marginBottom: 2,
  },
  timelineDate: {},
  timelineConnector: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    bottom: -20,
  },
  driverCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  driverTitle: {
    marginBottom: 16,
  },
  driverInfo: {
    gap: 8,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
  },
  driverPhone: {
    fontSize: 14,
  },
  driverVehicle: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TrackingScreen;