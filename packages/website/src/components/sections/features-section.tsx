"use client"

import { 
  Truck, 
  Bell, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap,
  Clock,
  Globe,
  Users,
  FileText,
  CreditCard,
  Headphones
} from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Multi-Kargo Desteği',
    description: 'Aras, MNG, Yurtiçi, PTT ve 50+ kargo firmasını tek platformda yönetin.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Bell,
    title: 'Akıllı Bildirimler',
    description: 'Real-time push bildirimleri, SMS ve email ile kargo durumunuzu anında öğrenin.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Detaylı Raporlama',
    description: 'Kargo maliyetleri, teslimat süreleri ve performans analizleri ile optimizasyon yapın.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Smartphone,
    title: 'Mobil Uygulama',
    description: 'iOS ve Android uygulamaları ile her yerden kargolarınızı takip edin.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Shield,
    title: 'Güvenli Altyapı',
    description: 'ISO 27001 sertifikalı, end-to-end şifreleme ve KVKK uyumlu veri koruması.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Zap,
    title: 'API Entegrasyonu',
    description: 'RESTful API ile mevcut sistemlerinize kolay entegrasyon ve otomatik senkronizasyon.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Clock,
    title: '7/24 İzleme',
    description: 'Kesintisiz monitoring sistemi ile kargolarınız hiçbir zaman gözden kaçmaz.',
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    icon: Globe,
    title: 'Uluslararası Kargo',
    description: 'DHL, FedEx, UPS gibi global kargo firmalarını da destekliyoruz.',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Takım Yönetimi',
    description: 'Çoklu kullanıcı desteği, rol yönetimi ve departman bazlı erişim kontrolü.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: FileText,
    title: 'Otomatik Belgeler',
    description: 'Kargo etiketleri, irsaliyeler ve gümrük belgeleri otomatik oluşturma.',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: CreditCard,
    title: 'Ödeme Entegrasyonu',
    description: 'İyzico, PayTR ve diğer ödeme sağlayıcıları ile güvenli ödeme işlemleri.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Headphones,
    title: 'Premium Destek',
    description: 'Türkçe 24/7 müşteri desteği, canlı sohbet ve teknik yardım.',
    gradient: 'from-amber-500 to-yellow-500'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-cargolink-100 dark:bg-cargolink-900 rounded-full text-sm font-medium text-cargolink-800 dark:text-cargolink-200 border border-cargolink-200 dark:border-cargolink-800 mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Güçlü Özellikler
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Lojistik İşlemlerinizi
            <span className="text-cargolink-600"> Kolaylaştıran </span>
            Çözümler
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Modern teknoloji altyapısı ile kargo yönetiminde yeni standartlar belirleyen
            özelliklerimizi keşfedin.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-cargolink-200 dark:hover:border-cargolink-800 hover:-translate-y-2"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl from-cargolink-500 to-blue-500"></div>
                
                {/* Icon */}
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cargolink-600 dark:group-hover:text-cargolink-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-6 h-6 text-cargolink-500">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-cargolink-50 to-blue-50 dark:from-cargolink-900/30 dark:to-blue-900/30 rounded-3xl p-8 lg:p-12 border border-cargolink-100 dark:border-cargolink-800">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tüm Özellikleri Deneyimleyin
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              14 gün ücretsiz deneme süresi ile CargoLink'in tüm özelliklerini
              keşfedin. Kredi kartı bilgisi gerekmez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-cargolink-600 hover:bg-cargolink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                Ücretsiz Deneme Başlat
                <Zap className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600">
                <FileText className="mr-2 h-5 w-5" />
                Detaylı Bilgi Al
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}