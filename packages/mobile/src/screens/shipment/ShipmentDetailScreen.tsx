import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
// @ts-ignore - Navigation type issue
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {shipmentService, Shipment, ShipmentTracking} from '../../services/api/shipment';

type RouteParams = {
  ShipmentDetail: {
    shipment: Shipment;
  };
};

const ShipmentDetailScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ShipmentDetail'>>();
  
  const [shipment, setShipment] = useState<Shipment>(route.params?.shipment);
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (shipment?.id) {
      fetchTrackingInfo();
    }
  }, [shipment]);

  const fetchTrackingInfo = async () => {
    if (!shipment?.id) return;
    
    setIsLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await shipmentService.trackShipment(shipment.id);
      
      if (response.success) {
        setTracking(response.data);
      } else {
        // Mock tracking data for fallback
        setTracking({
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          currentStatus: shipment.status,
          currentLocation: 'İstanbul Dağıtım Merkezi',
          events: [
            {
              id: '1',
              status: 'created',
              description: 'Gönderi oluşturuldu',
              location: 'İstanbul',
              timestamp: shipment.createdAt,
            },
            {
              id: '2',
              status: 'picked-up',
              description: 'Gönderi alındı',
              location: 'İstanbul Merkez',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              status: 'in-transit',
              description: 'Gönderi yola çıktı',
              location: 'Ankara Transfer Merkezi',
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            },
          ],
          estimatedDelivery: shipment.estimatedDelivery,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
      Alert.alert('Bilgi', 'Takip bilgileri alınamadı, genel bilgiler gösteriliyor.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTrackingInfo();
      // Also refresh shipment details
      if (shipment?.id) {
        const response = await shipmentService.getShipment(shipment.id);
        if (response.success) {
          setShipment(response.data);
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelShipment = () => {
    Alert.alert(
      'Gönderiyi İptal Et',
      'Bu gönderiyi iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await shipmentService.cancelShipment(
                shipment.id,
                'Kullanıcı tarafından iptal edildi'
              );
              
              if (response.success) {
                Alert.alert('Başarılı', 'Gönderi başarıyla iptal edildi.', [
                  {
                    text: 'Tamam',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Hata', response.message || 'Gönderi iptal edilemedi.');
              }
            } catch (error) {
              console.error('Cancel shipment error:', error);
              Alert.alert('Hata', 'Gönderi iptal edilemedi.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCallCarrier = async () => {
    // Mock phone number - in real app, this would come from carrier data
    const phoneNumber = '+90 850 XXX XX XX';
    const url = `tel:${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Telefon uygulaması açılamadı.');
      }
    } catch (error) {
      console.error('Phone call error:', error);
      Alert.alert('Hata', 'Arama yapılamadı.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'picked-up':
        return '#2196F3';
      case 'in-transit':
        return '#FF9800';
      case 'out-for-delivery':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'returned':
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'picked-up':
        return 'Alındı';
      case 'in-transit':
        return 'Yolda';
      case 'out-for-delivery':
        return 'Dağıtımda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      case 'returned':
        return 'İade Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const renderTrackingEvent = (event: any, index: number) => (
    <View key={event.id} style={styles.timelineItem}>
      <View style={styles.timelineMarker}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: index === 0 ? theme.colors.primary : theme.colors.outline,
            },
          ]}
        />
        {index < (tracking?.events.length || 0) - 1 && (
          <View style={[styles.timelineLine, {backgroundColor: theme.colors.outline}]} />
        )}
      </View>
      <View style={[styles.timelineContent, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.timelineTitle, {color: theme.colors.onSurface}]}>
          {event.description}
        </Text>
        <Text style={[styles.timelineLocation, {color: theme.colors.onSurfaceVariant}]}>
          {event.location}
        </Text>
        <Text style={[styles.timelineDate, {color: theme.colors.onSurfaceVariant}]}>
          {new Date(event.timestamp).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  if (!shipment) {
    return (
      <View style={[styles.container, styles.centerContent, {backgroundColor: theme.colors.background}]}>
        <Text style={[styles.errorText, {color: theme.colors.error}]}>
          Gönderi bilgileri bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }>
      
      {/* Header Card */}
      <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={[styles.trackingNumber, {color: theme.colors.onSurface}]}>
              {shipment.trackingNumber}
            </Text>
            <Text style={[styles.carrierName, {color: theme.colors.onSurfaceVariant}]}>
              {shipment.carrierName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(shipment.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(shipment.status)}</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, {color: theme.colors.onSurfaceVariant}]}>
            Toplam Ücret
          </Text>
          <Text style={[styles.priceValue, {color: theme.colors.primary}]}>
            ₺{shipment.amount?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>

      {/* Address Information */}
      <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.cardTitle, {color: theme.colors.onSurface}]}>
          Adres Bilgileri
        </Text>
        
        <View style={styles.addressSection}>
          <Text style={[styles.addressLabel, {color: theme.colors.onSurfaceVariant}]}>
            Gönderen
          </Text>
          <Text style={[styles.addressName, {color: theme.colors.onSurface}]}>
            {shipment.senderAddress.name}
          </Text>
          <Text style={[styles.addressText, {color: theme.colors.onSurfaceVariant}]}>
            {shipment.senderAddress.street}
          </Text>
          <Text style={[styles.addressText, {color: theme.colors.onSurfaceVariant}]}>
            {shipment.senderAddress.district}, {shipment.senderAddress.city}
          </Text>
          <Text style={[styles.phoneText, {color: theme.colors.primary}]}>
            {shipment.senderAddress.phone}
          </Text>
        </View>

        <View style={styles.addressSection}>
          <Text style={[styles.addressLabel, {color: theme.colors.onSurfaceVariant}]}>
            Alıcı
          </Text>
          <Text style={[styles.addressName, {color: theme.colors.onSurface}]}>
            {shipment.receiverAddress.name}
          </Text>
          <Text style={[styles.addressText, {color: theme.colors.onSurfaceVariant}]}>
            {shipment.receiverAddress.street}
          </Text>
          <Text style={[styles.addressText, {color: theme.colors.onSurfaceVariant}]}>
            {shipment.receiverAddress.district}, {shipment.receiverAddress.city}
          </Text>
          <Text style={[styles.phoneText, {color: theme.colors.primary}]}>
            {shipment.receiverAddress.phone}
          </Text>
        </View>
      </View>

      {/* Package Information */}
      <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.cardTitle, {color: theme.colors.onSurface}]}>
          Paket Bilgileri
        </Text>
        
        <View style={styles.packageInfo}>
          <View style={styles.packageRow}>
            <Text style={[styles.packageLabel, {color: theme.colors.onSurfaceVariant}]}>
              Tür:
            </Text>
            <Text style={[styles.packageValue, {color: theme.colors.onSurface}]}>
              {shipment.packageDetails.type === 'package' ? 'Paket' : 
               shipment.packageDetails.type === 'document' ? 'Evrak' : 'Diğer'}
            </Text>
          </View>
          
          <View style={styles.packageRow}>
            <Text style={[styles.packageLabel, {color: theme.colors.onSurfaceVariant}]}>
              Açıklama:
            </Text>
            <Text style={[styles.packageValue, {color: theme.colors.onSurface}]}>
              {shipment.packageDetails.description}
            </Text>
          </View>
          
          <View style={styles.packageRow}>
            <Text style={[styles.packageLabel, {color: theme.colors.onSurfaceVariant}]}>
              Ağırlık:
            </Text>
            <Text style={[styles.packageValue, {color: theme.colors.onSurface}]}>
              {shipment.packageDetails.weight} kg
            </Text>
          </View>
          
          <View style={styles.packageRow}>
            <Text style={[styles.packageLabel, {color: theme.colors.onSurfaceVariant}]}>
              Boyutlar:
            </Text>
            <Text style={[styles.packageValue, {color: theme.colors.onSurface}]}>
              {shipment.packageDetails.dimensions.length}x
              {shipment.packageDetails.dimensions.width}x
              {shipment.packageDetails.dimensions.height} cm
            </Text>
          </View>
          
          {shipment.packageDetails.value > 0 && (
            <View style={styles.packageRow}>
              <Text style={[styles.packageLabel, {color: theme.colors.onSurfaceVariant}]}>
                Değer:
              </Text>
              <Text style={[styles.packageValue, {color: theme.colors.onSurface}]}>
                ₺{shipment.packageDetails.value.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tracking Information */}
      {tracking && (
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.onSurface}]}>
            Takip Bilgileri
          </Text>
          
          {tracking.currentLocation && (
            <View style={styles.currentLocation}>
              <Text style={[styles.currentLocationLabel, {color: theme.colors.onSurfaceVariant}]}>
                Şu Anki Konum:
              </Text>
              <Text style={[styles.currentLocationValue, {color: theme.colors.primary}]}>
                {tracking.currentLocation}
              </Text>
            </View>
          )}

          {tracking.estimatedDelivery && (
            <View style={styles.estimatedDelivery}>
              <Text style={[styles.estimatedLabel, {color: theme.colors.onSurfaceVariant}]}>
                Tahmini Teslimat:
              </Text>
              <Text style={[styles.estimatedValue, {color: theme.colors.onSurface}]}>
                {new Date(tracking.estimatedDelivery).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          <View style={styles.timeline}>
            {tracking.events.map((event, index) => renderTrackingEvent(event, index))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleCallCarrier}>
          <Text style={[styles.actionButtonText, {color: theme.colors.onPrimary}]}>
            Kargo Firmasını Ara
          </Text>
        </TouchableOpacity>

        {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, {borderColor: theme.colors.error}]}
            onPress={handleCancelShipment}>
            <Text style={[styles.actionButtonText, {color: theme.colors.error}]}>
              Gönderiyi İptal Et
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  carrierName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    marginTop: 4,
  },
  packageInfo: {
    gap: 8,
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLabel: {
    fontSize: 14,
    flex: 1,
  },
  packageValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  currentLocation: {
    marginBottom: 12,
  },
  currentLocationLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  currentLocationValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  estimatedDelivery: {
    marginBottom: 16,
  },
  estimatedLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  estimatedValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
  },
  timelineContent: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ShipmentDetailScreen;