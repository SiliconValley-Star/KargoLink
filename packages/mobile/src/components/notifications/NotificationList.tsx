import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationListProps {
  unreadOnly?: boolean;
  onNotificationPress?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  unreadOnly = false,
  onNotificationPress,
}) => {
  const { theme } = useTheme();
  const { user, tokens } = useAuth();
  const colors = theme.colors;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (refresh = false) => {
    if (!user?.id || !tokens?.accessToken || loading) return;

    try {
      setLoading(true);
      const currentPage = refresh ? 1 : page;
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(unreadOnly && { unreadOnly: 'true' }),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/user?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const newNotifications = result.data;
        
        if (refresh) {
          setNotifications(newNotifications);
          setPage(2);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
          setPage(prev => prev + 1);
        }

        setHasMore(newNotifications.length === 20);
      } else {
        throw new Error(result.error || 'Bildirimler yüklenemedi');
      }
    } catch (error) {
      console.error('Notification fetch error:', error);
      Alert.alert('Hata', 'Bildirimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, tokens, page, unreadOnly, loading]);

  const markAsRead = async (notificationId: string) => {
    if (!tokens?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true, readAt: new Date().toISOString() }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!tokens?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/mark-all-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            read: true,
            readAt: new Date().toISOString()
          }))
        );
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(true);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    onNotificationPress?.(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment_update':
      case 'delivery':
        return 'cube-outline';
      case 'payment':
        return 'card-outline';
      case 'promotion':
        return 'gift-outline';
      case 'system':
        return 'settings-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shipment_update':
      case 'delivery':
        return colors.primary;
      case 'payment':
        return colors.success;
      case 'promotion':
        return colors.warning;
      case 'system':
        return colors.secondary;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return diffInMinutes < 1 ? 'Şimdi' : `${diffInMinutes} dakika önce`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    }

    return date.toLocaleDateString('tr-TR');
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: colors.surface,
          borderLeftColor: getNotificationColor(item.type),
        },
        !item.read && { backgroundColor: colors.primaryContainer + '20' }
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              { color: colors.onSurface },
              !item.read && styles.unreadTitle
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          
          <Text
            style={[
              styles.notificationMessage,
              { color: colors.onSurfaceVariant }
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          
          <Text style={[styles.notificationTime, { color: colors.onSurfaceVariant }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="notifications-outline"
        size={64}
        color={colors.onSurfaceVariant}
      />
      <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
        {unreadOnly ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderHeader = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount === 0) return null;
    
    return (
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerText, { color: colors.onSurface }]}>
          {unreadCount} okunmamış bildirim
        </Text>
        <TouchableOpacity
          onPress={markAllAsRead}
          style={[styles.markAllButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.markAllButtonText, { color: colors.onPrimary }]}>
            Tümünü Okundu İşaretle
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [unreadOnly]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default NotificationList;