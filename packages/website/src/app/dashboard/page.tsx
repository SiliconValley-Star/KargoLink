'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Search, 
  Bell, 
  User, 
  LogOut,
  TrendingUp,
  Clock,
  MapPin,
  CreditCard,
  BarChart3,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalSpent: number;
  monthlySavings: number;
  pendingPayments: number;
}

interface RecentShipment {
  id: string;
  trackingNumber: string;
  recipient: string;
  destination: string;
  status: 'created' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  amount: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
}

const statusConfig = {
  created: { label: 'Oluşturuldu', color: 'bg-gray-500', icon: Package },
  in_transit: { label: 'Yolda', color: 'bg-blue-500', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-500', icon: XCircle },
};

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch recent shipments
      const shipmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json();
        setRecentShipments(shipmentsData.data || []);
      }

      // Fetch notifications
      const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.data || []);
      }

    } catch (error) {
      console.error('Dashboard verisi alınamadı:', error);
      // Fallback to mock data for development
      setStats({
        totalShipments: 15,
        activeShipments: 3,
        deliveredShipments: 12,
        totalSpent: 2450.50,
        monthlySavings: 387.25,
        pendingPayments: 0
      });

      setRecentShipments([
        {
          id: '1',
          trackingNumber: 'CL123456789',
          recipient: 'Ahmet Yılmaz',
          destination: 'İstanbul → Ankara',
          status: 'in_transit',
          createdAt: '2025-10-25T10:30:00Z',
          estimatedDelivery: '2025-10-26T15:00:00Z',
          amount: 28.50
        },
        {
          id: '2',
          trackingNumber: 'CL987654321',
          recipient: 'Fatma Demir',
          destination: 'İzmir → Bursa',
          status: 'delivered',
          createdAt: '2025-10-24T14:20:00Z',
          amount: 35.75
        }
      ]);

      setNotifications([
        {
          id: '1',
          title: 'Gönderi Teslim Edildi',
          message: 'CL987654321 numaralı gönderiniz teslim edildi.',
          type: 'success',
          createdAt: '2025-10-25T09:15:00Z',
          read: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/shipment/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Gönderi
              </Button>
              
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                <User className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Gönderi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Truck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktif Gönderi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Teslim Edildi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.deliveredShipments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Son Gönderiler</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/shipments')}>
                  <Search className="w-4 h-4 mr-2" />
                  Tümünü Gör
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentShipments.length > 0 ? (
                  recentShipments.map((shipment) => {
                    const config = statusConfig[shipment.status];
                    const StatusIcon = config.icon;
                    
                    return (
                      <div key={shipment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${config.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                            <StatusIcon className={`w-4 h-4 ${config.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{shipment.trackingNumber}</p>
                            <p className="text-sm text-gray-600">{shipment.destination}</p>
                            <p className="text-xs text-gray-500">{formatDate(shipment.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatPrice(shipment.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz gönderi bulunmuyor</p>
                    <Button 
                      onClick={() => router.push('/shipment/create')} 
                      className="mt-4"
                    >
                      İlk Gönderinizi Oluşturun
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Bildirimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'warning' ? 'bg-yellow-100' :
                          notification.type === 'error' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          {notification.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : notification.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          ) : notification.type === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Bildirim bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => router.push('/shipment/create')} 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Plus className="w-6 h-6" />
                  <span>Yeni Gönderi</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/tracking')} 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Search className="w-6 h-6" />
                  <span>Takip Et</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/payments')} 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Ödemeler</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}