"use client"

import { 
  UserPlus, 
  Package, 
  Bell, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Ücretsiz Kayıt Olun',
    description: 'Sadece 2 dakikada hesabınızı oluşturun. Kredi kartı bilgisi gerekmez, 14 gün ücretsiz deneme hakkınız var.',
    features: [
      'Anında aktivasyon',
      'Kredi kartı gerekmez',
      '14 gün ücretsiz deneme'
    ],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    number: '02',
    icon: Package,
    title: 'Kargo Firmalarını Entegre Edin',
    description: 'Aras, MNG, Yurtiçi ve 50+ kargo firmasını tek tıkla hesabınıza bağlayın. API entegrasyonu otomatik olarak yapılır.',
    features: [
      'Tek tıkla entegrasyon',
      '50+ kargo firması desteği',
      'Otomatik API bağlantısı'
    ],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    number: '03',
    icon: Bell,
    title: 'Akıllı Bildirimleri Aktifleştirin',
    description: 'Real-time push bildirimler, SMS ve email uyarıları ile kargo durumlarını anında takip edin.',
    features: [
      'Real-time bildirimler',
      'SMS ve email uyarıları',
      'Özelleştirilebilir ayarlar'
    ],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Raporları İnceleyin ve Optimize Edin',
    description: 'Detaylı analizlerle kargo maliyetlerinizi düşürün, teslimat sürelerinizi optimize edin.',
    features: [
      'Detaylı maliyet analizi',
      'Performans raporları',
      'Optimize edilmiş süreçler'
    ],
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-cargolink-100 dark:bg-cargolink-900 rounded-full text-sm font-medium text-cargolink-800 dark:text-cargolink-200 border border-cargolink-200 dark:border-cargolink-800 mb-6">
            <Package className="w-4 h-4 mr-2" />
            Nasıl Çalışır?
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-cargolink-600">4 Adımda</span> CargoLink'e
            <br />
            Başlayın
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Dakikalar içinde kurulum yapın ve hemen kargo takibine başlayın.
            Karmaşık teknik bilgi gerektirmez.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-1/2 w-0.5 h-full bg-gradient-to-b from-cargolink-200 via-cargolink-300 to-transparent dark:from-cargolink-800 dark:via-cargolink-700 transform -translate-x-0.5 -z-10"></div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0

              return (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Step Content */}
                  <div className={`flex-1 ${isEven ? 'lg:pr-16' : 'lg:pl-16'}`}>
                    <div className={`relative ${isEven ? 'lg:text-right' : 'lg:text-left'} text-center`}>
                      {/* Step Number */}
                      <div className={`inline-block text-6xl lg:text-7xl font-bold text-gray-100 dark:text-gray-800 mb-4 ${isEven ? 'lg:float-right lg:ml-4' : 'lg:float-left lg:mr-4'}`}>
                        {step.number}
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {step.title}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          {step.description}
                        </p>
                        
                        {/* Features List */}
                        <div className={`space-y-3 ${isEven ? 'lg:items-end' : 'lg:items-start'} flex flex-col items-center`}>
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Visual */}
                  <div className="relative flex-shrink-0">
                    {/* Main Circle */}
                    <div className={`relative w-32 h-32 lg:w-40 lg:h-40 rounded-full ${step.bgColor} border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform duration-500`}>
                      {/* Icon Background */}
                      <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                      </div>
                      
                      {/* Pulse Effect */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} opacity-20 animate-ping`}></div>
                    </div>

                    {/* Arrow to Next Step */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 text-cargolink-300 dark:text-cargolink-700">
                        <ArrowRight 
                          className={`w-8 h-8 ${
                            isEven ? '-right-20' : '-left-20'
                          } absolute`} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-cargolink-600 to-blue-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full transform translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-16 translate-y-16"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Hazır mısınız? Hemen başlayalım!
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                14 gün boyunca tüm özellikleri ücretsiz deneyin. 
                Dilediğiniz zaman iptal edebilirsiniz.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cargolink-600 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Ücretsiz Hesap Oluştur
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-white/30">
                  <Package className="mr-2 h-5 w-5" />
                  Demo Talep Et
                </button>
              </div>
              
              <div className="mt-6 text-sm opacity-75">
                💳 Kredi kartı gerekmez • ⚡ Anında aktivasyon • 📞 Türkçe destek
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}