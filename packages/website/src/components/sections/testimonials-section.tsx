"use client"

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Mehmet Özkan',
    position: 'CEO',
    company: 'E-Ticaret Dünyası',
    image: '/avatars/mehmet.jpg',
    rating: 5,
    text: 'CargoLink sayesinde kargo yönetimimiz tamamen değişti. Artık tüm kargolarımızı tek yerden takip ediyoruz ve müşteri memnuniyetimiz %40 arttı. Özellikle real-time bildirimler çok faydalı.',
    stats: '2,500+ aylık kargo'
  },
  {
    name: 'Ayşe Demir',
    position: 'Lojistik Müdürü', 
    company: 'TeknoMarket',
    image: '/avatars/ayse.jpg',
    rating: 5,
    text: 'API entegrasyonu çok kolay oldu. Mevcut sistemimizle 1 saatte entegre ettik. Artık manuel veri girişi yapmıyoruz, her şey otomatik. Zaman tasarrufu inanılmaz.',
    stats: '10,000+ aylık kargo'
  },
  {
    name: 'Can Yılmaz',
    position: 'Kurucu',
    company: 'Hızlı Gönder',
    image: '/avatars/can.jpg',
    rating: 5,
    text: 'Startup\'ımız için mükemmel bir çözüm. Hem uygun fiyatlı hem de tüm ihtiyaçlarımızı karşılıyor. Müşteri desteği de çok hızlı ve çözüm odaklı. Kesinlikle tavsiye ederim.',
    stats: '500+ aylık kargo'
  },
  {
    name: 'Fatma Kaya',
    position: 'Operasyon Direktörü',
    company: 'Global Lojistik',
    image: '/avatars/fatma.jpg',
    rating: 5,
    text: 'Kurumsal planı kullanıyoruz ve çok memnunuz. Özellikle detaylı raporlama özelliği operasyonlarımızı optimize etmemize çok yardımcı oldu. ROI\'mız %25 arttı.',
    stats: '25,000+ aylık kargo'
  },
  {
    name: 'Ahmet Şen',
    position: 'IT Müdürü',
    company: 'ModaWorld',
    image: '/avatars/ahmet.jpg',
    rating: 5,
    text: 'Güvenlik açısından çok titiz bir şirketiz ve CargoLink tüm standartlarımızı karşıladı. ISO 27001 sertifikası ve KVKK uyumluluğu bizim için çok önemliydi.',
    stats: '5,000+ aylık kargo'
  },
  {
    name: 'Zeynep Arslan',
    position: 'Pazarlama Müdürü',
    company: 'Organik Ürünler',
    image: '/avatars/zeynep.jpg',
    rating: 5,
    text: 'Müşteri deneyimimizi iyileştirmek için CargoLink\'i seçtik. Şimdi müşterilerimiz kargolarını real-time takip edebiliyor ve şikayetlerimiz %60 azaldı.',
    stats: '1,200+ aylık kargo'
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-cargolink-100 dark:bg-cargolink-900 rounded-full text-sm font-medium text-cargolink-800 dark:text-cargolink-200 border border-cargolink-200 dark:border-cargolink-800 mb-6">
            <Star className="w-4 h-4 mr-2" />
            Müşteri Yorumları
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-cargolink-600">Binlerce</span> Mutlu Müşteri
            <br />
            CargoLink'i Seviyor
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Türkiye'nin dört bir yanından müşterilerimizin gerçek deneyimlerini okuyun
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-cargolink-200 dark:hover:border-cargolink-800 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-cargolink-200 dark:text-cargolink-800 group-hover:text-cargolink-300 dark:group-hover:text-cargolink-700 transition-colors duration-300">
                <Quote className="w-8 h-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic">
                "{testimonial.text}"
              </blockquote>

              {/* Stats */}
              <div className="mb-6 px-3 py-2 bg-cargolink-50 dark:bg-cargolink-900/30 rounded-lg border border-cargolink-100 dark:border-cargolink-800">
                <span className="text-sm font-medium text-cargolink-700 dark:text-cargolink-300">
                  📦 {testimonial.stats}
                </span>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-cargolink-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.position}
                  </div>
                  <div className="text-sm font-medium text-cargolink-600 dark:text-cargolink-400">
                    {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cargolink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-cargolink-50 to-blue-50 dark:from-cargolink-900/20 dark:to-blue-900/20 rounded-3xl p-8 lg:p-12 border border-cargolink-100 dark:border-cargolink-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Güvenilir ve Kaliteli Hizmet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Müşteri memnuniyeti bizim en büyük önceliğimiz. İşte rakamlarla başarılarımız.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-cargolink-600 mb-2">
                4.9/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ortalama Puan
              </div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                %99.5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Müşteri Memnuniyeti
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Aktif Müşteri
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
                %95
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tavsiye Oranı
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-8 border-t border-cargolink-200 dark:border-cargolink-700">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ISO 27001 Sertifikalı
              </span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">★</span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                5 Yıldız Desteği
              </span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                %99.9 Uptime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}