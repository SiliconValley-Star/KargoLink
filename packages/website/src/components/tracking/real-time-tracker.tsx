'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, Truck, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TrackingUpdate {
  trackingNumber: string;
  shipmentId: string;
  status: TrackingStatus;
  location: string;
  timestamp: string;
  description: string;
  estimatedDelivery?: string;
  metadata?: Record<string, any>;
}

interface LocationUpdate {
  trackingNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
}

enum TrackingStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  AT_HUB = 'at_hub',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception'
}

interface RealTimeTrackerProps {
  trackingNumbers: string[];
  userId?: string;
  className?: string;
  onStatusChange?: (update: TrackingUpdate) => void;
  onLocationUpdate?: (location: LocationUpdate) => void;
}

const statusConfig = {
  [TrackingStatus.CREATED]: {
    label: 'Oluşturuldu',
    color: 'bg-gray-500',
    icon: Package,
    description: 'Gönderi oluşturuldu ve hazırlığa alındı'
  },
  [TrackingStatus.PICKED_UP]: {
    label: 'Toplandı',
    color: 'bg-blue-500',
    icon: Truck,
    description: 'Gönderi kargo firması tarafından toplandı'
  },
  [TrackingStatus.IN_TRANSIT]: {
    label: 'Yolda',
    color: 'bg-yellow-500',
    icon: Truck,
    description: 'Gönderi taşıma sürecinde'
  },
  [TrackingStatus.AT_HUB]: {
    label: 'Dağıtım Merkezinde',
    color: 'bg-purple-500',
    icon: Package,
    description: 'Gönderi dağıtım merkezinde işlem görüyor'
  },
  [TrackingStatus.OUT_FOR_DELIVERY]: {
    label: 'Teslimat İçin Yolda',
    color: 'bg-orange-500',
    icon: Truck,
    description: 'Gönderi teslimat için kurye ile yolda'
  },
  [TrackingStatus.DELIVERED]: {
    label: 'Teslim Edildi',
    color: 'bg-green-500',
    icon: CheckCircle,
    description: 'Gönderi başarıyla teslim edildi'
  },
  [TrackingStatus.FAILED_DELIVERY]: {
    label: 'Teslimat Başarısız',
    color: 'bg-red-500',
    icon: XCircle,
    description: 'Teslimat gerçekleştirilemedi'
  },
  [TrackingStatus.RETURNED]: {
    label: 'İade Edildi',
    color: 'bg-gray-600',
    icon: Package,
    description: 'Gönderi gönderene iade edildi'
  },
  [TrackingStatus.CANCELLED]: {
    label: 'İptal Edildi',
    color: 'bg-red-600',
    icon: XCircle,
    description: 'Gönderi iptal edildi'
  },
  [TrackingStatus.EXCEPTION]: {
    label: 'Özel Durum',
    color: 'bg-yellow-600',
    icon: AlertCircle,
    description: 'Gönderi durumunda özel bir durum var'
  }
};

export function RealTimeTracker({ 
  trackingNumbers, 
  userId, 
  className = '',
  onStatusChange,
  onLocationUpdate
}: RealTimeTrackerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trackingData, setTrackingData] = useState<Map<string, TrackingUpdate>>(new Map());
  const [locationData, setLocationData] = useState<Map<string, LocationUpdate>>(new Map());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    const initSocket = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        // Connection events
        newSocket.on('connect', () => {
          setIsConnected(true);
          setConnectionError(null);
          setIsLoading(false);
          console.log('🔗 Real-time tracking bağlantısı kuruldu');
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('📡 Real-time tracking bağlantısı kesildi');
        });

        newSocket.on('connect_error', (error: any) => {
          setConnectionError(error.message);
          setIsConnected(false);
          setIsLoading(false);
          console.error('❌ WebSocket bağlantı hatası:', error);
        });

        // Tracking events
        newSocket.on('tracking_update', (update: TrackingUpdate) => {
          console.log('📦 Tracking güncellesi alındı:', update);
          setTrackingData(prev => new Map(prev.set(update.trackingNumber, update)));
          onStatusChange?.(update);
        });

        newSocket.on('location_update', (location: LocationUpdate) => {
          console.log('📍 Konum güncellesi alındı:', location);
          setLocationData(prev => new Map(prev.set(location.trackingNumber, location)));
          onLocationUpdate?.(location);
        });

        // Subscription events
        newSocket.on('subscription_confirmed', (data: { trackingNumbers: string[] }) => {
          console.log('✅ Tracking abonelikleri onaylandı:', data.trackingNumbers);
        });

        newSocket.on('subscription_error', (error: { error: string }) => {
          console.error('❌ Abonelik hatası:', error.error);
          setConnectionError(error.error);
        });

        setSocket(newSocket);
        
        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
        setConnectionError('Bağlantı kurulamadı');
        setIsLoading(false);
      }
    };

    initSocket();
  }, [onStatusChange, onLocationUpdate]);

  // Subscribe to tracking numbers
  useEffect(() => {
    if (socket && isConnected && trackingNumbers.length > 0) {
      console.log('📡 Tracking numaralarına abone olunuyor:', trackingNumbers);
      socket.emit('subscribe_tracking', {
        trackingNumbers,
        userId: userId || 'anonymous'
      });
    }

    return () => {
      if (socket && trackingNumbers.length > 0) {
        socket.emit('unsubscribe_tracking', { trackingNumbers });
      }
    };
  }, [socket, isConnected, trackingNumbers, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }, []);

  const getStatusBadge = useCallback((status: TrackingStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Real-time tracking bağlantısı kuruluyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectionError) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-800">
            <XCircle className="w-5 h-5" />
            <div>
              <div className="font-medium">Bağlantı Hatası</div>
              <div className="text-sm text-red-600">{connectionError}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                Real-time Tracking {isConnected ? 'Aktif' : 'Bağlantı Kesildi'}
              </span>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {trackingNumbers.length} Gönderi İzleniyor
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Items */}
      {trackingNumbers.map((trackingNumber) => {
        const tracking = trackingData.get(trackingNumber);
        const location = locationData.get(trackingNumber);

        return (
          <Card key={trackingNumber} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{trackingNumber}</div>
                  <div className="text-sm text-gray-600">
                    Gönderi Takip Numarası
                  </div>
                </div>
                {tracking && getStatusBadge(tracking.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {tracking ? (
                <div className="space-y-4">
                  {/* Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{tracking.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatTimestamp(tracking.timestamp)}
                        </div>
                        {tracking.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            {tracking.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  {location && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-blue-900">Anlık Konum</div>
                          <div className="text-sm text-blue-800 mt-1">
                            {location.address}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {formatTimestamp(location.timestamp)}
                          </div>
                          {location.driverInfo && (
                            <div className="mt-2 text-sm">
                              <div className="text-blue-800">
                                Kurye: {location.driverInfo.name}
                              </div>
                              <div className="text-blue-700">
                                Araç: {location.driverInfo.vehicleInfo}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {tracking.estimatedDelivery && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                      <Clock className="w-4 h-4" />
                      <span>Tahmini Teslimat: {formatTimestamp(tracking.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div>Bu gönderi için henüz güncelleme alınmadı</div>
                  <div className="text-sm mt-1">
                    Güncellemeler geldiğinde burada görüntülenecek
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {trackingNumbers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-600 mb-2">
              İzlenecek Gönderi Bulunamadı
            </div>
            <div className="text-sm text-gray-500">
              Takip numarası ekleyerek gönderinizi izleyebilirsiniz
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RealTimeTracker;