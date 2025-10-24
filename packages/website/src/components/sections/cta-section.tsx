"use client"

import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle, Clock } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-cargolink-600 via-blue-600 to-indigo-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Sınırlı Süre Teklifi
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Kargo Yönetiminde
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Devrim Yaratın
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            14 gün boyunca CargoLink'in tüm özelliklerini ücretsiz deneyin. 
            Kurulum sadece 5 dakika, sonuçlar ise anında!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
              <span className="font-medium">Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Clock className="w-6 h-6 text-blue-300 flex-shrink-0" />
              <span className="font-medium">5 dakikada kurulum</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Sparkles className="w-6 h-6 text-purple-300 flex-shrink-0" />
              <span className="font-medium">Anında aktivasyon</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-cargolink-600 bg-white hover:bg-gray-50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <button className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/30 hover:border-white/50">
              <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              Demo İzle
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-white/80 mb-4 text-lg">
              🔒 ISO 27001 Sertifikalı • 🛡️ KVKK Uyumlu • 🇹🇷 Türkçe Destek
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="text-sm">
                <div className="font-bold text-2xl">150K+</div>
                <div>Mutlu Müşteri</div>
              </div>
              <div className="text-sm">
                <div className="font-bold text-2xl">2.5M+</div>
                <div>Takip Edilen Kargo</div>
              </div>
              <div className="text-sm">
                <div className="font-bold text-2xl">99.9%</div>
                <div>Uptime</div>
              </div>
              <div className="text-sm">
                <div className="font-bold text-2xl">4.9/5</div>
                <div>Müşteri Puanı</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>

      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
      <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-white rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full opacity-80 animate-ping" style={{ animationDelay: '2s' }}></div>
    </section>
  )
}