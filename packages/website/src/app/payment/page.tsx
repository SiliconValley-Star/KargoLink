'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Lock,
  Zap,
  Star,
  Truck,
  Timer
} from 'lucide-react';

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  supportedMethods: string[];
  features: string[];
  processingTime: string;
  fees: string;
  rating: number;
}

interface InstallmentOption {
  count: number;
  interestRate: number;
  installmentPrice: number;
  totalPrice: number;
}

interface PaymentFormData {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  provider: string;
  installmentCount?: number;
  customerInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  billingAddress: {
    address: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
}

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState('card');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 150.00,
    currency: 'TRY',
    description: 'Kargo Gönderim Ücreti',
    paymentMethod: 'credit_card',
    provider: '',
    customerInfo: {
      email: '',
      phone: '',
      firstName: '',
      lastName: ''
    },
    billingAddress: {
      address: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Turkey'
    }
  });

  // Mock payment providers data
  const mockProviders: PaymentProvider[] = [
    {
      id: 'iyzico',
      name: 'İyzico',
      logo: '/providers/iyzico-logo.svg',
      description: 'Türkiye\'nin önde gelen ödeme altyapısı',
      supportedMethods: ['Kredi Kartı', 'Banka Kartı', 'Taksit'],
      features: ['3D Secure', 'Anında Ödeme', 'Taksit Seçenekleri', 'Mobil Ödeme'],
      processingTime: 'Anında',
      fees: '%2.9 + 0.25₺',
      rating: 4.8
    },
    {
      id: 'paytr',
      name: 'PayTR',
      logo: '/providers/paytr-logo.svg',
      description: 'Güvenilir Türk ödeme sistemi',
      supportedMethods: ['Kredi Kartı', 'Banka Kartı', 'Havale/EFT'],
      features: ['SSL Güvenliği', 'Hızlı İşlem', 'Çoklu Banka Desteği'],
      processingTime: 'Anında',
      fees: '%2.7 + 0.30₺',
      rating: 4.6
    }
  ];

  const mockInstallments: InstallmentOption[] = [
    { count: 1, interestRate: 0, installmentPrice: 150.00, totalPrice: 150.00 },
    { count: 2, interestRate: 0, installmentPrice: 75.00, totalPrice: 150.00 },
    { count: 3, interestRate: 1.5, installmentPrice: 51.13, totalPrice: 153.38 },
    { count: 6, interestRate: 3.5, installmentPrice: 26.06, totalPrice: 156.38 },
    { count: 9, interestRate: 5.5, installmentPrice: 18.04, totalPrice: 162.38 },
    { count: 12, interestRate: 7.5, installmentPrice: 13.78, totalPrice: 165.38 }
  ];

  useEffect(() => {
    setProviders(mockProviders);
    setInstallments(mockInstallments);
    setSelectedProvider('iyzico');
  }, []);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setFormData(prev => ({ ...prev, provider: providerId }));
  };

  const handleInputChange = (
    field: string,
    value: string,
    section?: 'customerInfo' | 'billingAddress'
  ) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment initialization
      const paymentResult = {
        success: true,
        data: {
          paymentId: 'payment_12345',
          paymentUrl: 'https://sandbox.iyzipay.com/payment/12345',
          status: 'pending'
        }
      };

      if (paymentResult.success && paymentResult.data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentResult.data.paymentUrl;
      }
    } catch (err) {
      setError('Ödeme başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Güvenli Ödeme</h1>
            <p className="text-gray-600 mt-1">Kargo gönderiminizi tamamlamak için ödeme yapın</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Provider Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Ödeme Sağlayıcısı Seçin
                </CardTitle>
                <CardDescription>
                  Güvenilir ödeme altyapıları arasından seçim yapın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedProvider === provider.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleProviderSelect(provider.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <Building2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                              <div className="flex items-center">
                                <div className="flex text-yellow-400 mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(provider.rating) ? 'fill-current' : 'stroke-current'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">{provider.rating}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {provider.features.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              {provider.processingTime} • {provider.fees}
                            </span>
                          </div>
                        </div>
                        {selectedProvider === provider.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Yöntemi</CardTitle>
                <CardDescription>
                  Kullanmak istediğiniz ödeme yöntemini seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Kredi Kartı
                    </TabsTrigger>
                    <TabsTrigger value="installment" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Taksit
                    </TabsTrigger>
                    <TabsTrigger value="bank" className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Banka
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Kart Numarası</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardHolder">Kart Sahibi</Label>
                        <Input
                          id="cardHolder"
                          placeholder="ADI SOYADI"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Son Kullanma Tarihi</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="installment" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label>Taksit Seçenekleri</Label>
                      {installments.map((option) => (
                        <div
                          key={option.count}
                          className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="installment"
                              value={option.count}
                              className="mr-3"
                            />
                            <span className="font-medium">
                              {option.count} Taksit
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {option.installmentPrice.toFixed(2)} ₺ x {option.count}
                            </div>
                            <div className="text-sm text-gray-600">
                              Toplam: {option.totalPrice.toFixed(2)} ₺
                              {option.interestRate > 0 && (
                                <span className="text-orange-600 ml-2">
                                  (%{option.interestRate} faiz)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-4 mt-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Banka transferi ile ödeme yapmak için önce ödeme talimatını oluşturacağız.
                        Ardından size banka bilgilerini göndereceğiz.
                      </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="bankSelect">Banka Seçin</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue>
                            <span className="text-muted-foreground">Bankanızı seçin</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ziraat">Ziraat Bankası</SelectItem>
                          <SelectItem value="isbank">İş Bankası</SelectItem>
                          <SelectItem value="akbank">Akbank</SelectItem>
                          <SelectItem value="garanti">Garanti BBVA</SelectItem>
                          <SelectItem value="yapikredi">Yapı Kredi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Bilgileri</CardTitle>
                <CardDescription>
                  Ödeme için gerekli bilgilerinizi girin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      placeholder="Adınız"
                      className="mt-1"
                      value={formData.customerInfo.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value, 'customerInfo')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      placeholder="Soyadınız"
                      className="mt-1"
                      value={formData.customerInfo.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value, 'customerInfo')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      className="mt-1"
                      value={formData.customerInfo.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value, 'customerInfo')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      placeholder="+90 555 123 45 67"
                      className="mt-1"
                      value={formData.customerInfo.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value, 'customerInfo')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Sipariş Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo Ücreti</span>
                  <span className="font-medium">₺{formData.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hizmet Bedeli</span>
                  <span className="font-medium">₺5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV</span>
                  <span className="font-medium">₺{((formData.amount + 5) * 0.18).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span>₺{((formData.amount + 5) * 1.18).toFixed(2)}</span>
                </div>

                {selectedProviderData && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      {selectedProviderData.name} ile Ödeme
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 mr-1 text-green-600" />
                        {selectedProviderData.processingTime}
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1 text-green-600" />
                        SSL Güvenli Ödeme
                      </div>
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1 text-green-600" />
                        3D Secure
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePaymentSubmit}
                  disabled={loading || !selectedProvider}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Güvenli Ödeme Yap
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ödemeniz SSL ile şifrelenmiş güvenli bağlantı üzerinden işlenir.
                  Kart bilgileriniz saklanmaz.
                </p>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Güvenlik Özellikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-green-600 mr-2" />
                    256-bit SSL Şifreleme
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    PCI DSS Sertifikalı
                  </div>
                  <div className="flex items-center text-sm">
                    <Lock className="h-4 w-4 text-green-600 mr-2" />
                    3D Secure Doğrulama
                  </div>
                  <div className="flex items-center text-sm">
                    <Zap className="h-4 w-4 text-green-600 mr-2" />
                    Anında İşlem
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;