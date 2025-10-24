'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  Phone,
  Mail,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Home,
  Calendar
} from 'lucide-react';

interface FailureDetails {
  paymentId?: string;
  errorCode: string;
  errorMessage: string;
  provider?: string;
  amount?: number;
  currency?: string;
  failedAt: string;
  retryable: boolean;
}

const PaymentFailurePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(null);

  useEffect(() => {
    const paymentId = searchParams?.get('paymentId');
    const errorCode = searchParams?.get('errorCode') || 'PAYMENT_FAILED';
    const errorMessage = searchParams?.get('errorMessage') || 'Ödeme işlemi başarısız oldu';
    const provider = searchParams?.get('provider');

    // Simulate fetching failure details
    setTimeout(() => {
      setFailureDetails({
        paymentId: paymentId || undefined,
        errorCode,
        errorMessage,
        provider: provider || undefined,
        amount: 177.00,
        currency: 'TRY',
        failedAt: new Date().toISOString(),
        retryable: !['CARD_BLOCKED', 'INSUFFICIENT_FUNDS', 'INVALID_CARD'].includes(errorCode)
      });
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const getErrorSeverity = (errorCode: string): 'error' | 'warning' => {
    const criticalErrors = ['CARD_BLOCKED', 'FRAUD_DETECTED', 'INVALID_CARD'];
    return criticalErrors.includes(errorCode) ? 'error' : 'warning';
  };

  const getErrorSolution = (errorCode: string): string => {
    const solutions: { [key: string]: string } = {
      'INSUFFICIENT_FUNDS': 'Kartınızda yeterli bakiye olmayabilir. Lütfen bakiyenizi kontrol edin veya başka bir kart deneyin.',
      'INVALID_CARD': 'Kart bilgileri hatalı girilmiş olabilir. Lütfen kart numarası, son kullanma tarihi ve CVV kodunu kontrol edin.',
      'EXPIRED_CARD': 'Kartınızın süresi dolmuş. Lütfen geçerli bir kart kullanın.',
      'CARD_BLOCKED': 'Kartınız bloke olmuş olabilir. Bankanızla iletişime geçin.',
      'BANK_ERROR': 'Bankanızdan kaynaklı geçici bir sorun var. Birkaç dakika sonra tekrar deneyin.',
      'NETWORK_ERROR': 'Bağlantı sorunu yaşandı. İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
      'TIMEOUT': 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
      'PROVIDER_ERROR': 'Ödeme sağlayıcısında geçici bir sorun var. Farklı bir ödeme yöntemi deneyin.',
      'FRAUD_DETECTED': 'Güvenlik nedeniyle işlem engellenmiştir. Bankanızla iletişime geçin.',
      'LIMIT_EXCEEDED': 'Günlük işlem limitiniz aşılmış. Bankanızla iletişime geçin.',
      'PAYMENT_FAILED': 'Ödeme işlemi tamamlanamadı. Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.'
    };
    
    return solutions[errorCode] || solutions['PAYMENT_FAILED'];
  };

  const handleRetryPayment = () => {
    router.push('/payment');
  };

  const handleContactSupport = () => {
    window.open('mailto:destek@cargolink.com?subject=Ödeme Sorunu&body=Merhaba, ödeme işlemimde sorun yaşıyorum. Detaylar: ' + JSON.stringify(failureDetails, null, 2));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ödeme durumu kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!failureDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata Bilgisi Bulunamadı</h1>
          <Button onClick={() => router.push('/')} className="mt-4">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h1>
          <p className="text-gray-600 text-lg">
            Ödeme işlemi tamamlanamadı. Aşağıdaki bilgileri kontrol edin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Error Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Hata Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant={getErrorSeverity(failureDetails.errorCode) === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {failureDetails.errorMessage}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hata Kodu</label>
                    <div className="mt-1">
                      <Badge variant="destructive" className="font-mono">
                        {failureDetails.errorCode}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hata Zamanı</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(failureDetails.failedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>

                {failureDetails.paymentId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">İşlem ID</label>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {failureDetails.paymentId}
                    </p>
                  </div>
                )}

                {failureDetails.provider && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ödeme Sağlayıcısı</label>
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">{failureDetails.provider}</span>
                    </div>
                  </div>
                )}

                {failureDetails.amount && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">İşlem Tutarı</label>
                    <p className="font-semibold text-lg text-gray-900 mt-1">
                      ₺{failureDetails.amount.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Solution Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Çözüm Önerileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>
                      {getErrorSolution(failureDetails.errorCode)}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Deneyebilecekleriniz:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 font-semibold text-xs">1</span>
                        </span>
                        Kart bilgilerini tekrar kontrol edin (numara, tarih, CVV)
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 font-semibold text-xs">2</span>
                        </span>
                        Farklı bir kredi kartı veya banka kartı deneyin
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 font-semibold text-xs">3</span>
                        </span>
                        İnternet bağlantınızın stabil olduğundan emin olun
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 font-semibold text-xs">4</span>
                        </span>
                        Birkaç dakika bekleyip tekrar deneyin
                      </li>
                      {!failureDetails.retryable && (
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-red-600 font-semibold text-xs">!</span>
                          </span>
                          Bu hata için bankanızla iletişime geçmeniz gerekebilir
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Alternatif Ödeme Yöntemleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-all">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="font-medium">Farklı Kart</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Başka bir kredi kartı veya banka kartı ile ödeme yapın
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-all">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      <h4 className="font-medium">Havale/EFT</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Banka havalesi ile ödeme yapabilirsiniz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Support */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {failureDetails.retryable && (
                  <Button
                    className="w-full"
                    onClick={handleRetryPayment}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tekrar Dene
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri Dön
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yardım Alın</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sorun devam ederse, müşteri hizmetlerimize başvurun. Size yardımcı olmaktan mutluluk duyarız.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>0850 123 45 67</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>destek@cargolink.com</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleContactSupport}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta Gönder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('tel:+908501234567')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Hemen Ara
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center mt-4">
                  Destek hattımız 7/24 hizmetinizdedir
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Güvenlik Bilgisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    • Ödeme işlemi başarısız olsa da kart bilgileriniz hiçbir yerde saklanmaz
                  </p>
                  <p>
                    • Tüm işlemler SSL ile şifrelenmiş güvenli bağlantı üzerinden yapılır
                  </p>
                  <p>
                    • Başarısız işlemler için kartınızdan herhangi bir ücret çekilmez
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;