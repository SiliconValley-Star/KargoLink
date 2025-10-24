import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {shipmentService, Shipment} from '../../services/api/shipment';
import type {ShipmentStackParamList} from '../../navigation/AppNavigator';

// Mock data for fallback
const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'CL2024001234',
    status: 'in-transit',
    senderAddress: {
      name: 'Ahmet Yılmaz',
      phone: '+90 555 123 4567',
      street: 'Atatürk Cad. No:123',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
    },
    receiverAddress: {
      name: 'Mehmet Demir',
      phone: '+90 555 987 6543',
      street: 'İstiklal Cad. No:456',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06420',
    },
    packageDetails: {
      type: 'package',
      description: 'Elektronik ürün',
      weight: 2.5,
      dimensions: {
        length: 30,
        width: 20,
        height: 10,
      },
      value: 1500,
      specialRequirements: [],
    },
    carrierId: 'aras-kargo',
    carrierName: 'Aras Kargo',
    amount: 25.50,
    currency: 'TRY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    trackingNumber: 'CL2024001235',
    status: 'delivered',
    senderAddress: {
      name: 'Ayşe Kaya',
      phone: '+90 555 111 2222',
      street: 'Cumhuriyet Bulvarı No:789',
      district: 'Konak',
      city: 'İzmir',
      postalCode: '35220',
    },
    receiverAddress: {
      name: 'Can Öztürk',
      phone: '+90 555 333 4444',
      street: 'Barbaros Bulvarı No:321',
      district: 'Beşiktaş',
      city: 'İstanbul',
      postalCode: '34349',
    },
    packageDetails: {
      type: 'document',
      description: 'Önemli evraklar',
      weight: 0.5,
      dimensions: {
        length: 25,
        width: 18,
        height: 2,
      },
      value: 0,
      specialRequirements: ['fragile'],
    },
    carrierId: 'mng-kargo',
    carrierName: 'MNG Kargo',
    amount: 15.00,
    currency: 'TRY',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ShipmentListScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<NavigationProp<ShipmentStackParamList>>();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetchShipments();
  }, [user]);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchQuery, selectedFilter]);

  const fetchShipments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await shipmentService.getShipments(1, 50);
      
      if (response.success) {
        setShipments(response.data.shipments);
      } else {
        // Fallback to mock data if API fails
        setShipments(mockShipments);
        console.warn('API failed, using mock data:', response.message);
      }
    } catch (error) {
      console.error('Shipment fetch error:', error);
      // Fallback to mock data
      setShipments(mockShipments);
      Alert.alert('Bilgi', 'Gerçek veriler alınamadı, demo veriler gösteriliyor.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchShipments();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterShipments = () => {
    let filtered = shipments;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        shipment =>
          shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.senderAddress.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.receiverAddress.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.carrierName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === selectedFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    Alert.alert(
      'Gönderiyi Sil',
      'Bu gönderiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await shipmentService.cancelShipment(shipmentId, 'Kullanıcı tarafından iptal edildi');
              if (response.success) {
                setShipments(prev => prev.filter(s => s.id !== shipmentId));
                Alert.alert('Başarılı', 'Gönderi başarıyla iptal edildi.');
              } else {
                Alert.alert('Hata', response.message || 'Gönderi iptal edilemedi.');
              }
            } catch (error) {
              console.error('Cancel shipment error:', error);
              Alert.alert('Hata', 'Gönderi iptal edilemedi.');
            }
          }
        }
      ]
    );
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

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}>
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? theme.colors.onPrimary : theme.colors.onSurface,
          },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderShipment = ({item}: {item: Shipment}) => (
    <TouchableOpacity
      style={[styles.shipmentCard, {backgroundColor: theme.colors.surface}]}
      onPress={() => navigation.navigate('ShipmentDetail', {shipmentId: item.id})}
      onLongPress={() => handleDeleteShipment(item.id)}>
      <View style={styles.shipmentHeader}>
        <Text style={[styles.trackingNumber, {color: theme.colors.onSurface}]}>
          {item.trackingNumber}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.shipmentInfo}>
        <Text style={[styles.route, {color: theme.colors.onSurfaceVariant}]}>
          {item.senderAddress?.city || 'Bilinmiyor'} → {item.receiverAddress?.city || 'Bilinmiyor'}
        </Text>
        <Text style={[styles.date, {color: theme.colors.onSurfaceVariant}]}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      
      <View style={styles.shipmentFooter}>
        <Text style={[styles.carrier, {color: theme.colors.onSurfaceVariant}]}>
          {item.carrierName}
        </Text>
        <Text style={[styles.price, {color: theme.colors.primary}]}>
          ₺{item.amount?.toFixed(2) || '0.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, {color: theme.colors.onSurfaceVariant}]}>
        {searchQuery || selectedFilter !== 'all'
          ? 'Arama kriterlerinize uygun gönderi bulunamadı.'
          : 'Henüz hiç gönderi oluşturmamışsınız.'}
      </Text>
      <TouchableOpacity
        style={[styles.createButton, {backgroundColor: theme.colors.primary}]}
        onPress={() => navigation.navigate('ShipmentCreate')}>
        <Text style={[styles.createButtonText, {color: theme.colors.onPrimary}]}>
          Yeni Gönderi Oluştur
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline,
            },
          ]}
          placeholder="Gönderi ara... (takip no, şehir, kargo)"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('pending', 'Beklemede')}
        {renderFilterButton('in-transit', 'Yolda')}
        {renderFilterButton('delivered', 'Teslim')}
      </View>

      {/* Shipments List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.onSurfaceVariant}]}>
            Gönderiler yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredShipments}
          renderItem={renderShipment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={() => navigation.navigate('ShipmentCreate')}>
        <Text style={[styles.fabText, {color: theme.colors.onPrimary}]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  shipmentInfo: {
    marginBottom: 12,
  },
  route: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carrier: {
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: '300',
  },
});

export default ShipmentListScreen;