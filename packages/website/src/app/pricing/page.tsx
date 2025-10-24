"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Star, Package, Truck, Shield, Zap, Users, BarChart3 } from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      id: 'starter',
      name: 'Başlangıç',
      description: 'Bireysel kullanıcılar ve küçük işletmeler için',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        'Ayda 50 kargo gönderimi',
        'Temel kargo takibi',
        'E-posta bildirimleri',
        'Web paneli erişimi',
        'Temel raporlama',
        'Standart destek'
      ],
      limitations: [
        'API erişimi yok',
        'Özel entegrasyon yok',
        'Öncelikli destek yok'
      ],
      buttonText: 'Ücretsiz Başla',
      buttonVariant: 'outline' as const
    },
    {
      id: 'professional',
      name: 'Profesyonel',
      description: 'Büyüyen işletmeler ve e-ticaret siteleri için',
      monthlyPrice: 299,
      yearlyPrice: 2990, // 2 ay ücretsiz
      popular: true,
      features: [
        'Aylık 500 kargo gönderimi',
        'Gerçek zamanlı takip',
        'Push, SMS ve e-posta bildirimleri',
        'Gelişmiş web paneli',
        'Detaylı raporlama ve analiz',
        'Öncelikli destek',
        'REST API erişimi',
        'Temel entegrasyon desteği',
        'Otomatik fiyat karşılaştırma',
        'Toplu kargo işlemleri'
      ],
      limitations: [
        'Özel SLA yok',
        'Dedicated hesap yöneticisi yok'
      ],
      buttonText: 'Şimdi Başla',
      buttonVariant: 'default' as const
    },
    {
      id: 'enterprise',
      name: 'Kurumsal',
      description: 'Büyük işletmeler ve kargo yoğun operasyonlar için',
      monthlyPrice: 999,
      yearlyPrice: 9990, // 2 ay ücretsiz
      popular: false,
      features: [
        'Sınırsız kargo gönderimi',
        'Gerçek zamanlı takip ve bildirimler',
        'Tüm bildirim kanalları',
        'Tam özellikli admin paneli',
        'İleri düzey raporlama ve BI',
        '7/24 öncelikli destek',
        'Full REST API + GraphQL',
        'Özel entegrasyonlar',
        'Webhook desteği',
        'Toplu işlemler ve automation',
        'Özel SLA (99.9% uptime)',
        'Dedicated hesap yöneticisi',
        'Özel training ve onboarding',
        'İstediğiniz kargo firması entegrasyonu'
      ],
      limitations: [],
      buttonText: 'Satış Ekibi ile Görüş',
      buttonVariant: 'default' as const
    }
  ]

  const features = [
    {
      icon: Package,
      title: 'Kargo Yönetimi',
      description: 'Tüm kargo operasyonlarınızı tek platformdan yönetin'
    },
    {
      icon: Truck,
      title: 'Çoklu Kargo Firması',
      description: 'Aras, MNG, Yurtiçi ve daha fazlası ile entegrasyon'
    },
    {
      icon: Shield,
      title: 'Güvenli Ödeme',
      description: '256-bit SSL şifreleme ile güvenli ödeme işlemleri'
    },
    {
      icon: Zap,
      title: 'Hızlı Entegrasyon',
      description: 'API ile dakikalar içinde sisteminize entegre edin'
    },
    {
      icon: Users,
      title: 'Ekip Yönetimi',
      description: 'Çalışanlarınız için farklı yetki seviyeleri oluşturun'
    },
    {
      icon: BarChart3,
      title: 'Detaylı Raporlama',
      description: 'Kargo maliyetlerinizi ve performansınızı analiz edin'
    }
  ]

  const faqs = [
    {
      question: 'Ücretsiz plan ile ne kadar kargo gönderebilirim?',
      answer: 'Ücretsiz plan ile ayda 50 adet kargo gönderebilirsiniz. Bu limit her ay yenilenir.'
    },
    {
      question: 'Planımı istediğim zaman değiştirebilir miyim?',
      answer: 'Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklik bir sonraki fatura döneminde geçerli olur.'
    },
    {
      question: 'API erişimi hangi planlarda mevcut?',
      answer: 'API erişimi Profesyonel ve Kurumsal planlarda mevcuttur. Ücretsiz planda API erişimi yoktur.'
    },
    {
      question: 'Kargo maliyetleri fiyata dahil mi?',
      answer: 'Hayır, platform kullanım ücretleri ayrı, kargo maliyetleri ayrı faturalanır. Kargo ücretlerini doğrudan kargo firmalarına ödersiniz.'
    },
    {
      question: 'İptal etmek istersem ne yapmalıyım?',
      answer: 'Hesabınızı istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmetten yararlanabilirsiniz.'
    },
    {
      question: 'Kurumsal plan için özel fiyat alabilir miyim?',
      answer: 'Evet, yüksek hacimli kullanım için özel fiyatlandırma seçeneklerimiz mevcuttur. Satış ekibimizle iletişime geçin.'
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'yearly' && plan.monthlyPrice > 0) {
      const yearlyTotal = plan.monthlyPrice * 12
      const savings = yearlyTotal - plan.yearlyPrice
      return savings
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Basit ve Şeffaf Fiyatlandırma
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              İhtiyaçlarınıza uygun planı seçin. İstediğiniz zaman plan değiştirebilir veya iptal edebilirsiniz.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-12 flex justify-center items-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Aylık
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yıllık
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                2 ay bedava
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    En Popüler
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ₺{getPrice(plan).toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 ml-1">/ay</span>
                  </div>
                  {getSavings(plan) > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Yıllık ₺{getSavings(plan).toLocaleString()} tasarruf
                    </p>
                  )}
                </div>

                <Button 
                  variant={plan.buttonVariant}
                  className="w-full mt-8"
                  size="lg"
                >
                  {plan.buttonText}
                </Button>

                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">Özellikler:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-600 mb-3">Dahil değil:</h5>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Tüm Planlar ile Erişebileceğiniz Özellikler
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              CargoLink platformunun sunduğu temel özellikler
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <feature.icon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Sıkça Sorulan Sorular
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Fiyatlandırma hakkında merak ettikleriniz
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Hazır mısınız? Hemen başlayın!
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              14 gün ücretsiz deneme, kredi kartı gerektirmez
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button size="lg" variant="secondary">
                Ücretsiz Dene
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-700">
                Satış Ekibi ile Görüş
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}