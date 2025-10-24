"use client"

import { Button } from '@/components/ui/button'
import { Package, Users, Globe, Shield, Zap, Heart, Award, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: 'Mutlu Müşteri', value: '10,000+', icon: Users },
    { label: 'Kargo Gönderimi', value: '1M+', icon: Package },
    { label: 'Entegre Kargo Firması', value: '15+', icon: Globe },
    { label: 'Uptime Oranı', value: '%99.9', icon: Shield }
  ]

  const team = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Kurucu & CEO',
      image: '/team/ceo.jpg',
      description: '15+ yıl lojistik sektörü deneyimi'
    },
    {
      name: 'Elif Demir',
      role: 'CTO',
      image: '/team/cto.jpg',
      description: 'Ex-Google, yazılım mimarisi uzmanı'
    },
    {
      name: 'Mehmet Özkan',
      role: 'VP Operations',
      image: '/team/vp-ops.jpg',
      description: 'Operasyon verimliliği ve süreç optimizasyonu'
    },
    {
      name: 'Zeynep Kaya',
      role: 'Head of Customer Success',
      image: '/team/cs-head.jpg',
      description: 'Müşteri deneyimi ve memnuniyeti odaklı'
    }
  ]

  const values = [
    {
      icon: Zap,
      title: 'Hız ve Verimlilik',
      description: 'Teknoloji ile lojistik süreçlerini hızlandırıyor, verimliliği artırıyoruz.'
    },
    {
      icon: Shield,
      title: 'Güvenilirlik',
      description: 'Kargolarınızın güvenliği bizim için öncelik. %99.9 uptime garantisi veriyoruz.'
    },
    {
      icon: Heart,
      title: 'Müşteri Odaklılık',
      description: 'Müşteri memnuniyeti her kararımızın merkezinde yer alır.'
    },
    {
      icon: TrendingUp,
      title: 'Sürekli İyileştirme',
      description: 'Teknoloji ve süreçlerimizi sürekli geliştirerek daha iyi hizmet sunuyoruz.'
    }
  ]

  const timeline = [
    {
      year: '2020',
      title: 'Kuruluş',
      description: 'CargoLink fikri doğdu ve ilk prototip geliştirildi'
    },
    {
      year: '2021',
      title: 'İlk Entegrasyonlar',
      description: 'Aras Kargo ve MNG Kargo entegrasyonları tamamlandı'
    },
    {
      year: '2022',
      title: 'Platform Lansmanı',
      description: 'Beta sürümü piyasaya sürüldü, ilk 1000 kullanıcıya ulaşıldı'
    },
    {
      year: '2023',
      title: 'Büyüme',
      description: '10+ kargo firması entegrasyonu, 10,000+ aktif kullanıcı'
    },
    {
      year: '2024',
      title: 'Yenilikler',
      description: 'AI destekli rota optimizasyonu ve mobil uygulama lansmanı'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Lojistiği Dijitalleştiriyoruz
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              CargoLink olarak, Türkiye'nin en büyük dijital lojistik platformunu oluşturarak 
              işletmelerin kargo süreçlerini kolaylaştırıyor, maliyetlerini düşürüyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
              <p className="mt-4 text-lg text-gray-600">
                Türkiye'deki tüm işletmelerin, boyutları ne olursa olsun, en gelişmiş lojistik 
                teknolojilerine erişebilmesini sağlamak. Kargo gönderimi sürecini basitleştirerek, 
                maliyetleri düşürerek ve şeffaflığı artırarak e-ticaret ekosistemini güçlendiriyoruz.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Amacımız sadece bir platform olmak değil, Türkiye'nin lojistik altyapısını 
                dijitalleştiren, veri odaklı çözümler sunan bir teknoloji şirketi olmak.
              </p>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Vizyonumuz</h3>
                <p className="text-blue-800">
                  2025 yılına kadar Türkiye'nin lider dijital lojistik platformu olmak ve 
                  bölgedeki diğer ülkelere genişleyerek, milyonlarca işletmeye hizmet veren 
                  küresel bir teknoloji şirketi haline gelmek.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Değerlerimiz</h2>
            <p className="mt-4 text-lg text-gray-600">
              İş yapış şeklimizi belirleyen temel ilkeler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Yolculuğumuz</h2>
            <p className="mt-4 text-lg text-gray-600">
              CargoLink'in gelişim hikayesi
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-20">
                  <div className="text-2xl font-bold text-blue-600">{item.year}</div>
                </div>
                <div className="ml-8">
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Takımımız</h2>
            <p className="mt-4 text-lg text-gray-600">
              CargoLink'i hayata geçiren deneyimli profesyoneller
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium">{member.role}</p>
                <p className="mt-2 text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Ödüllerimiz</h2>
            <p className="mt-4 text-lg text-gray-600">
              Çalışmalarımızın takdir gördüğü anlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Award className="w-16 h-16 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                TechCrunch Startup Battlefield Winner
              </h3>
              <p className="text-gray-600">2023</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Award className="w-16 h-16 text-silver-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Endeavor Entrepreneur Seçimi
              </h3>
              <p className="text-gray-600">2023</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Award className="w-16 h-16 text-bronze-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                TOBB En İyi Dijital Dönüşüm Projesi
              </h3>
              <p className="text-gray-600">2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Bize Katılın
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Lojistik sektörünün geleceğini birlikte şekillendiriyoruz
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button size="lg" variant="secondary">
              Kariyer Fırsatları
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-700">
              İletişime Geç
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}