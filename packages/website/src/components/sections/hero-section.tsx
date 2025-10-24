"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Shield, Zap, Users, TrendingUp } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-cargolink-200 rounded-full blur-xl opacity-70 animate-float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-blue-200 rounded-full blur-xl opacity-50 animate-float-delayed"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-200 rounded-full blur-lg opacity-60 animate-pulse"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-cargolink-100 dark:bg-cargolink-900 rounded-full text-sm font-medium text-cargolink-800 dark:text-cargolink-200 border border-cargolink-200 dark:border-cargolink-800">
              <Zap className="w-4 h-4 mr-2" />
              Türkiye'nin En Hızlı Büyüyen Lojistik Platformu
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Kargo</span>
                <span className="text-cargolink-600"> Takibinde</span>
                <br />
                <span className="text-gray-900 dark:text-white">Yeni Çağ</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Tüm kargo firmalarını tek platformda yönetin. Real-time takip, 
                akıllı bildirimler ve profesyonel raporlama ile lojistik süreçlerinizi optimize edin.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-cargolink-600">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kargo Firması</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-cargolink-600">1M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Takip Edilen Kargo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-cargolink-600">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime Garantisi</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-cargolink-600 hover:bg-cargolink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <Play className="mr-2 h-5 w-5" />
                Demo İzle
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>ISO 27001 Sertifikalı</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>10,000+ Aktif Kullanıcı</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span>%99.5 Müşteri Memnuniyeti</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Main Dashboard Image */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cargolink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CL</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">CargoLink Dashboard</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cargolink-50 dark:bg-cargolink-900/30 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-cargolink-600">247</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Aktif Kargo</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">189</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Teslim Edildi</div>
                  </div>
                </div>

                {/* Recent Tracking */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Son Takipler</h3>
                  {[
                    { id: 'TK123456789', status: 'Transit', company: 'Aras Kargo', progress: 75 },
                    { id: 'MNG987654321', status: 'Delivered', company: 'MNG Kargo', progress: 100 },
                    { id: 'YC456789123', status: 'Preparing', company: 'Yurtiçi Kargo', progress: 25 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-2 h-2 bg-cargolink-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.id}</div>
                        <div className="text-xs text-gray-500">{item.company}</div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-cargolink-100 dark:bg-cargolink-800 text-cargolink-700 dark:text-cargolink-300 rounded-full">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Real-time Güncellemeler</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-cargolink-600 text-white p-4 rounded-xl shadow-lg animate-float-delayed">
              <div className="text-lg font-bold">%35</div>
              <div className="text-xs opacity-90">Maliyet Tasarrufu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-auto">
          <path d="M0,0V46.29C47.79,22.29 96.58,22 144,46.29C191.42,70.58 240.21,70.58 288,46.29C335.79,22 384.58,22 432,46.29C479.42,70.58 528.21,70.58 576,46.29C623.79,22 672.58,22 720,46.29C767.42,70.58 816.21,70.58 864,46.29C911.79,22 960.58,22 1008,46.29C1055.42,70.58 1104.21,70.58 1152,46.29C1199.79,22 1200,22 1200,46.29V120H0V0Z" fill="currentColor" className="text-white dark:text-gray-900"/>
        </svg>
      </div>
    </section>
  )
}