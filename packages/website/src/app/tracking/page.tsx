'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import RealTimeTracker from '@/components/tracking/real-time-tracker';
import { Search, Package, Plus, Trash2 } from 'lucide-react';

export default function TrackingPage() {
  const [trackingNumbers, setTrackingNumbers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const addTrackingNumber = () => {
    const trimmedValue = inputValue.trim().toUpperCase();
    
    if (trimmedValue && !trackingNumbers.includes(trimmedValue)) {
      setTrackingNumbers(prev => [...prev, trimmedValue]);
      setInputValue('');
      setIsTracking(true);
    }
  };

  const removeTrackingNumber = (trackingNumber: string) => {
    setTrackingNumbers(prev => prev.filter(num => num !== trackingNumber));
    if (trackingNumbers.length <= 1) {
      setIsTracking(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTrackingNumber();
    }
  };

  const handleStatusChange = (update: any) => {
    console.log('Status güncellemesi:', update);
    // Burada status değişikliği bildirimleri gösterilebilir
  };

  const handleLocationUpdate = (location: any) => {
    console.log('Konum güncellemesi:', location);
    // Burada konum güncellemeleri işlenebilir
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gerçek Zamanlı Kargo Takibi
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Gönderi numaranızı girerek canlı takip yapabilirsiniz
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tracking Input */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="w-5 h-5" />
              Gönderi Takip Numarası Ekle
            </h2>
            <p className="text-sm text-gray-600">
              Takip numaranızı girerek real-time gönderi durumu alabilirsiniz
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Takip numaranızı girin (örn: CL12345678)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button 
                onClick={addTrackingNumber}
                disabled={!inputValue.trim()}
                className="px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ekle
              </Button>
            </div>

            {/* Added Tracking Numbers */}
            {trackingNumbers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  İzlenen Gönderi Numaraları:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trackingNumbers.map((number) => (
                    <div
                      key={number}
                      className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200"
                    >
                      <span className="text-sm font-medium">{number}</span>
                      <button
                        onClick={() => removeTrackingNumber(number)}
                        className="text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Tracker */}
        {isTracking && trackingNumbers.length > 0 ? (
          <RealTimeTracker
            trackingNumbers={trackingNumbers}
            onStatusChange={handleStatusChange}
            onLocationUpdate={handleLocationUpdate}
            className="mb-8"
          />
        ) : (
          /* Welcome Message */
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                Gerçek Zamanlı Takip Başlayın
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Yukarıdaki alana gönderi takip numaranızı girerek canlı takip 
                yapabilir, konum güncellemelerini anlık olarak görebilirsiniz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Takip Numarası Girin</h4>
                  <p className="text-sm text-gray-600">
                    Gönderi takip numaranızı yukarıdaki alana girin
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Canlı Takip</h4>
                  <p className="text-sm text-gray-600">
                    WebSocket ile gerçek zamanlı gönderi durumu alın
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Konum Güncellemeleri</h4>
                  <p className="text-sm text-gray-600">
                    Gönderinizin konumunu anlık olarak görün
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">
              WebSocket ile anlık durum güncellemeleri
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Kolay Takip</h3>
            <p className="text-sm text-gray-600">
              Sadece takip numarası ile hızlı sorgulama
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Çoklu Takip</h3>
            <p className="text-sm text-gray-600">
              Birden fazla gönderiyi aynı anda izleyin
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Detaylı Bilgi</h3>
            <p className="text-sm text-gray-600">
              Konum, durum ve tahmini teslimat bilgileri
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}