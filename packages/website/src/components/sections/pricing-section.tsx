"use client"

import { Check, Star, Zap, Crown, Building } from 'lucide-react'

const plans = [
  {
    name: 'Başlangıç',
    description: 'Küçük işletmeler için ideal',
    price: 299,
    period: 'ay',
    icon: Zap,
    popular: false,
    features: [
      '500 kargo takibi/ay',
      '5 kargo firması entegrasyonu',
      'Email bildirimleri',
      'Temel raporlama',
      'Web dashboard',
      'Email destek'
    ],
    limitations: [
      'SMS bildirimleri yok',
      'API erişimi yok'
    ],
    color: 'from-blue-500 to-cyan-500',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'Profesyonel',
    description: 'Büyüyen işletmeler için',
    price: 799,
    period: 'ay',
    icon: Star,
    popular: true,
    features: [
      '5,000 kargo takibi/ay',
      'Sınırsız kargo firması',
      'Email + SMS bildirimleri',
      'Gelişmiş raporlama & analitik',
      'Web + mobil uygulama',
      'API erişimi',
      'Öncelikli destek',
      'Çoklu kullanıcı desteği'
    ],
    limitations: [
      'Özel entegrasyon yok'
    ],
    color: 'from-purple-500 to-pink-500',
    buttonColor: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    name: 'Kurumsal',
    description: 'Büyük organizasyonlar için',
    price: 1999,
    period: 'ay',
    icon: Crown,
    popular: false,
    features: [
      'Sınırsız kargo takibi',
      'Tüm kargo firmaları',
      'Tüm bildirim kanalları',
      'Özel raporlama',
      'Tüm platformlar',
      'Tam API erişimi',
      '24/7 öncelikli destek',
      'Sınırsız kullanıcı',
      'Özel entegrasyonlar',
      'Dedicated hesap yöneticisi',
      'SLA garantisi'
    ],
    limitations: [],
    color: 'from-orange-500 to-red-500',
    buttonColor: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    name: 'Özel Çözüm',
    description: 'Kurumsal ihtiyaçlara özel',
    price: null,
    period: null,
    icon: Building,
    popular: false,
    features: [
      'Tamamen özelleştirilebilir',
      'Kendi altyapınızda kurulum',
      'Özel güvenlik protokolleri',
      'Sınırsız entegrasyonlar',
      'Özel geliştirme',
      'Eğitim ve danışmanlık',
      'Teknik ekip desteği',
      'Bakım ve güncelleme hizmeti'
    ],
    limitations: [],
    color: 'from-gray-600 to-gray-800',
    buttonColor: 'bg-gray-700 hover:bg-gray-800'
  }
]

const faqs = [
  {
    question: 'Ücretsiz deneme süresi var mı?',
    answer: 'Evet! Tüm planlar için 14 gün ücretsiz deneme sunuyoruz. Kredi kartı bilgisi gerekmez.'
  },
  {
    question: 'Plan değişikliği yapabilir miyim?',
    answer: 'Tabii ki! İstediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Değişiklik bir sonraki fatura döneminde geçerli olur.'
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı, havale/EFT ve kurumsal fatura seçeneklerini destekliyoruz.'
  },
  {
    question: 'API kullanım limiti var mı?',
    answer: 'Her plan için farklı API limitleri bulunmaktadır. Profesyonel ve üzeri planlarda daha yüksek limitler mevcuttur.'
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-cargolink-100 dark:bg-cargolink-900 rounded-full text-sm font-medium text-cargolink-800 dark:text-cargolink-200 border border-cargolink-200 dark:border-cargolink-800 mb-6">
            <Crown className="w-4 h-4 mr-2" />
            Fiyatlandırma
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            İhtiyacınıza Uygun
            <span className="text-cargolink-600"> Plan </span>
            Seçin
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            14 gün ücretsiz deneme ile başlayın. İstediğiniz zaman iptal edebilirsiniz.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border ${
                  plan.popular 
                    ? 'border-purple-200 dark:border-purple-800 ring-4 ring-purple-100 dark:ring-purple-900 scale-105' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-cargolink-200 dark:hover:border-cargolink-800'
                } p-8 ${plan.popular ? 'xl:transform xl:-translate-y-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      🔥 En Popüler
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Info */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>
                  
                  {/* Pricing */}
                  <div className="flex items-baseline mb-2">
                    {plan.price ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ₺{plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          /{plan.period}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        Özel Fiyat
                      </span>
                    )}
                  </div>
                  
                  {plan.price && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      KDV dahil fiyat
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className={`w-full py-4 px-6 rounded-xl font-semibold text-white ${plan.buttonColor} shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200`}>
                  {plan.price ? 'Ücretsiz Başla' : 'İletişime Geç'}
                </button>

                {/* Additional Info */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  {plan.price ? '14 gün ücretsiz deneme' : 'Özel teklif alın'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-16 overflow-x-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Özellik Karşılaştırması
          </h3>
          
          <div className="min-w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Özellikler
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Başlangıç
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-600 dark:text-purple-400">
                    Profesyonel
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Kurumsal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ['Kargo takip limiti', '500/ay', '5,000/ay', 'Sınırsız'],
                  ['Kargo firması sayısı', '5', 'Sınırsız', 'Sınırsız'],
                  ['Mobil uygulama', '❌', '✅', '✅'],
                  ['API erişimi', '❌', '✅', '✅'],
                  ['SMS bildirimleri', '❌', '✅', '✅'],
                  ['Öncelikli destek', '❌', '✅', '✅'],
                  ['Özel entegrasyonlar', '❌', '❌', '✅']
                ].map(([feature, basic, pro, enterprise], index) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                      {feature}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                      {basic}
                    </td>
                    <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">
                      {pro}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                      {enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Sık Sorulan Sorular
          </h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}