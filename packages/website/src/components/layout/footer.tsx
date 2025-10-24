import Link from 'next/link'
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-cargolink-400" />
              <span className="text-xl font-bold">CargoLink</span>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Türkiye'nin en kapsamlı lojistik platformu. Kargolarınızı güvenle takip edin, 
              tüm kargo firmalarını tek platformda yönetin.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://facebook.com/cargolink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cargolink-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com/cargolink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cargolink-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/company/cargolink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cargolink-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com/cargolink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cargolink-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Ürünler</h3>
            <nav className="space-y-3">
              <Link 
                href="/features/tracking" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Kargo Takip
              </Link>
              <Link 
                href="/features/management" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Gönderi Yönetimi
              </Link>
              <Link 
                href="/features/analytics" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Raporlama & Analitik
              </Link>
              <Link 
                href="/features/api" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                API Entegrasyonu
              </Link>
              <Link 
                href="/features/mobile" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Mobil Uygulama
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Destek</h3>
            <nav className="space-y-3">
              <Link 
                href="/help" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Yardım Merkezi
              </Link>
              <Link 
                href="/api-docs" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                API Dokümantasyonu
              </Link>
              <Link 
                href="/status" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Sistem Durumu
              </Link>
              <Link 
                href="/security" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Güvenlik
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-400 hover:text-white transition-colors"
              >
                İletişim
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5 text-cargolink-400" />
                <span>0850 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5 text-cargolink-400" />
                <span>info@cargolink.com</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 text-cargolink-400 mt-0.5" />
                <span>
                  Maslak Mahallesi, Bilim Sokak<br />
                  No: 5, Sarıyer/İstanbul
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium mb-3">Güncellemeler</h4>
              <p className="text-sm text-gray-400 mb-3">
                Yeni özellikler ve güncellemelerden haberdar olun.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cargolink-400"
                />
                <button className="px-4 py-2 bg-cargolink-600 hover:bg-cargolink-700 rounded-md text-sm font-medium transition-colors">
                  Abone Ol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <span>© 2024 CargoLink. Tüm hakları saklıdır.</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Kullanım Şartları
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Çerez Politikası
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>🇹🇷 Türkiye</span>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Site Haritası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}