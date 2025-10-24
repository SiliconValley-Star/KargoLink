'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Share2,
  ArrowLeft,
  Receipt,
  Clock,
  CreditCard,
  Building2,
  Truck,
  Copy,
  Mail,
  Phone
} from 'lucide-react';

interface PaymentDetails {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  transactionId: string;
  paidAt: string;
  method: string;
  shipmentId?: string;
}

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paymentId = searchParams?.get('paymentId');
    const status = searchParams?.get('status');

    if (paymentId && status === 'success') {
      // Simulate fetching payment details
      setTimeout(() => {
        setPaymentDetails({
          paymentId: paymentId,
          amount: 177.00,
          currency: 'TRY',
          status: 'completed',
          provider: 'iyzico',
          transactionId: `TXN_${Date.now()}`,
          paidAt: new Date().toISOString(),
          method: 'credit_card',
          shipmentId: 'SHP_12345'
        });
        setLoading(false);
      }, 1000);
    } else {
      router.push('/payment/failure');
    }
  }, [searchParams, router]);

  const handleCopyTransactionId = async () => {
    if (paymentDetails) {
      await navigator.clipboard.writeText(paymentDetails.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReceipt = () => {
    // Implement receipt download logic
    console.log('Downloading receipt...');
  };

  const handleShareReceipt = async () => {
    if (navigator.share && paymentDetails) {
      try {
        await navigator.share({
          title: 'CargoLink Ödeme Makbuzu',
          text: `Ödeme başarıyla tamamlandı. İşlem No: ${paymentDetails.transactionId}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ödeme detayları kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ödeme detayları bulunamadı.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
          <p className="text-gray-600 text-lg">
            Ödemeniz başarıyla işleme alındı. E-posta adresinize makbuz gönderildi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-green-600" />
                  Ödeme Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">İşlem Numarası</label>
                    <div className="flex items-center mt-1">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {paymentDetails.transactionId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyTransactionId}
                        className="ml-2"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ödeme Tutarı</label>
                    <p className="font-semibold text-lg text-green-600 mt-1">
                      ₺{paymentDetails.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ödeme Yöntemi</label>
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">
                        {paymentDetails.method.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ödeme Sağlayıcısı</label>
                    <div className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="capitalize">{paymentDetails.provider}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">İşlem Tarihi</label>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {new Date(paymentDetails.paidAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Durum</label>
                    <div className="mt-1">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Tamamlandı
                      </Badge>
                    </div>
                  </div>
                </div>

                {paymentDetails.shipmentId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gönderi Numarası</label>
                    <div className="flex items-center mt-1">
                      <Truck className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-mono">{paymentDetails.shipmentId}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Sonraki Adımlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">E-posta Kontrolü</h4>
                      <p className="text-gray-600 text-sm">
                        E-posta adresinize ödeme makbuzu ve gönderi detayları gönderildi.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Gönderi Hazırlığı</h4>
                      <p className="text-gray-600 text-sm">
                        Gönderinizi paketleyin ve kargo firmasının alımını bekleyin.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Takip</h4>
                      <p className="text-gray-600 text-sm">
                        Gönderinizi hesabınızdan veya takip numarası ile takip edebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Support */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Makbuz İşlemleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleDownloadReceipt}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Makbuzu İndir
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShareReceipt}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Makbuzu Paylaş
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/tracking')}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Gönderiyi Takip Et
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yardıma mı İhtiyacınız Var?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Herhangi bir sorunuz varsa, müşteri hizmetlerimizle iletişime geçin.
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => window.open('mailto:destek@cargolink.com')}
                >
                  E-posta Gönder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigasyon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Hesabıma Dön
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Ana Sayfaya Dön
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;