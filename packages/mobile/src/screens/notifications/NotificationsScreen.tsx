import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {
  notificationService,
  LocalNotification,
  useNotifications,
} from '../../services/notifications/notification.service';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    
    // Set up event listeners
    notificationService.onNewNotification(handleNewNotification);
    notificationService.onNotificationRead(handleNotificationRead);
    notificationService.onNavigateToTracking(handleNavigateToTracking);
    
    return () => {
      // Cleanup listeners
      notificationService.destroy();
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };

  const handleNewNotification = (notification: LocalNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleNotificationRead = () => {
    loadNotifications(); // Refresh to update read status
  };

  const handleNavigateToTracking = (data: any) => {
    if (data.trackingNumber) {
      navigation.navigate('TrackingDetail', {
        trackingNumber: data.trackingNumber,
        shipmentId: data.shipmentId,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: LocalNotification) => {
    // Mark as read
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
    }

    // Handle action based on notification type
    if (notification.type === 'shipment_update' && notification.data?.trackingNumber) {
      navigation.navigate('TrackingDetail', {
        trackingNumber: notification.data.trackingNumber,
        shipmentId: notification.data.shipmentId,
      });
    } else if (notification.type === 'delivery_notification' && notification.data?.shipmentId) {
      navigation.navigate('ShipmentDetail', {
        shipmentId: notification.data.shipmentId,
      });
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tüm Bildirimleri Temizle',
      'Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearAllNotifications();
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirimi silmek istediğinizden emin misiniz?',
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await notificationService.deleteNotification(notificationId);
            loadNotifications();
          },
        },
      ]
    );
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  };

  const getNotificationIcon = (type: LocalNotification['type']) => {
    switch (type) {
      case 'shipment_update': return '📦';
      case 'delivery_notification': return '🚚';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: LocalNotification['type']) => {
    switch (type) {
      case 'shipment_update': return theme.colors.primary;
      case 'delivery_notification': return theme.colors.success;
      case 'system': return theme.colors.info;
      case 'promotion': return theme.colors.secondary;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Şimdi';
    if (diffMinutes < 60) return `${diffMinutes}dk önce`;
    if (diffHours < 24) return `${diffHours}s önce`;
    if (diffDays < 7) return `${diffDays}g önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderNotificationItem = ({item}: {item: LocalNotification}) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: theme.colors.surface,
          opacity: item.isRead ? 0.8 : 1,
        }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={[
          styles.iconContainer,
          {backgroundColor: getNotificationColor(item.type) + '20'}
        ]}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.notificationTitle,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.subtitle1.fontSize,
                fontWeight: theme.typography.subtitle1.fontWeight,
              }
            ]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && (
              <View style={[
                styles.unreadDot,
                {backgroundColor: theme.colors.primary}
              ]} />
            )}
          </View>
          
          <Text style={[
            styles.notificationMessage,
            {
              color: theme.colors.onSurfaceVariant,
              fontSize: theme.typography.body2.fontSize,
            }
          ]} numberOfLines={2}>
            {item.message}
          </Text>
          
          <Text style={[
            styles.notificationTime,
            {
              color: theme.colors.onSurfaceVariant,
              fontSize: theme.typography.caption.fontSize,
            }
          ]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Text style={[styles.deleteIcon, {color: theme.colors.error}]}>
            ×
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={[
        styles.emptyTitle,
        {
          color: theme.colors.onBackground,
          fontSize: theme.typography.h6.fontSize,
        }
      ]}>
        {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
      </Text>
      <Text style={[
        styles.emptyDescription,
        {
          color: theme.colors.onSurfaceVariant,
          fontSize: theme.typography.body2.fontSize,
        }
      ]}>
        {filter === 'unread' 
          ? 'Tüm bildirimlerinizi okudunuz!'
          : 'Gönderi güncellemeleri burada görünecek'
        }
      </Text>
    </View>
  );

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notificationService.getUnreadCount();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.colors.surface}]}>
        <Text style={[
          styles.headerTitle,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.h6.fontSize,
            fontWeight: theme.typography.h6.fontWeight,
          }
        ]}>
          Bildirimler {unreadCount > 0 && `(${unreadCount})`}
        </Text>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllRead}
            >
              <Text style={[styles.headerButtonText, {color: theme.colors.primary}]}>
                Tümünü Okundu İşaretle
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === 'all' 
                ? theme.colors.primaryContainer 
                : 'transparent',
            }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            {
              color: filter === 'all' 
                ? theme.colors.onPrimaryContainer 
                : theme.colors.onSurface,
              fontWeight: filter === 'all' ? '600' : '400',
            }
          ]}>
            Tümü ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === 'unread' 
                ? theme.colors.primaryContainer 
                : 'transparent',
            }
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterTabText,
            {
              color: filter === 'unread' 
                ? theme.colors.onPrimaryContainer 
                : theme.colors.onSurface,
              fontWeight: filter === 'unread' ? '600' : '400',
            }
          ]}>
            Okunmamış ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Actions */}
      {notifications.length > 0 && (
        <View style={[styles.bottomActions, {backgroundColor: theme.colors.surface}]}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleClearAll}
          >
            <Text style={[styles.bottomButtonText, {color: theme.colors.error}]}>
              Tümünü Temizle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => notificationService.sendTestNotification()}
          >
            <Text style={[styles.bottomButtonText, {color: theme.colors.primary}]}>
              Test Bildirimi
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 14,
  },
  notificationItem: {
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 18,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationTime: {},
  deleteButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
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
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsScreen;