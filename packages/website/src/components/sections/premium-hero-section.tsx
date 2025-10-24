"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  Play, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  Globe,
  CheckCircle,
  Star,
  Timer,
  Package,
  Target
} from 'lucide-react'

// Real-time animated counter
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

// Premium trust indicators carousel
const TrustIndicators = () => {
  const indicators = [
    { icon: <Shield className="w-5 h-5" />, text: "ISO 27001 Sertifikalı", color: "text-success-500" },
    { icon: <Users className="w-5 h-5" />, text: "25,000+ Aktif Kullanıcı", color: "text-cargolink-500" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "%99.8 Uptime Garantisi", color: "text-purple-500" },
    { icon: <Globe className="w-5 h-5" />, text: "81 İl Kargo Ağı", color: "text-blue-500" },
    { icon: <Star className="w-5 h-5" />, text: "4.9/5 Müşteri Puanı", color: "text-yellow-500" },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
      {indicators.map((item, index) => (
        <div 
          key={index}
          className={`flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in-up`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className={item.color}>{item.icon}</span>
          <span className="text-white/90 font-medium">{item.text}</span>
        </div>
      ))}
    </div>
  )
}

// Interactive dashboard preview
const DashboardPreview = () => {
  const [activeDemo, setActiveDemo] = useState(0)
  
  const demoData = [
    { 
      title: "Real-time Tracking", 
      stats: { active: 1247, delivered: 892, pending: 23 },
      activity: "📦 Yeni gönderi: İstanbul → Ankara"
    },
    { 
      title: "Smart Analytics", 
      stats: { active: 1398, delivered: 945, pending: 18 },
      activity: "📊 Aylık rapor hazırlandı"
    },
    { 
      title: "Multi-carrier", 
      stats: { active: 1156, delivered: 1021, pending: 31 },
      activity: "🚛 Yurtiçi Kargo entegrasyonu aktif"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % demoData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const current = demoData[activeDemo]

  return (
    <div className="relative">
      {/* Main Dashboard Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-cargolink-500 to-cargolink-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">CargoLink Dashboard</h3>
              <p className="text-white/80 text-sm">{current.title}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i === activeDemo ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-cargolink-50 to-cargolink-100 p-4 rounded-2xl border border-cargolink-200">
              <div className="text-2xl font-bold text-cargolink-700">
                <AnimatedCounter end={current.stats.active} />
              </div>
              <div className="text-sm text-cargolink-600 font-medium">Aktif Kargo</div>
            </div>
            <div className="bg-gradient-to-br from-success-50 to-success-100 p-4 rounded-2xl border border-success-200">
              <div className="text-2xl font-bold text-success-700">
                <AnimatedCounter end={current.stats.delivered} />
              </div>
              <div className="text-sm text-success-600 font-medium">Teslim Edildi</div>
            </div>
            <div className="bg-gradient-to-br from-warning-50 to-warning-100 p-4 rounded-2xl border border-warning-200">
              <div className="text-2xl font-bold text-warning-700">
                <AnimatedCounter end={current.stats.pending} />
              </div>
              <div className="text-sm text-warning-600 font-medium">Beklemede</div>
            </div>
          </div>

          {/* Live Activity */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Timer className="w-4 h-4 text-cargolink-500 animate-pulse" />
              Canlı Aktivite
            </h4>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-gray-800 font-medium">{current.activity}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 ml-5">
                {new Date().toLocaleTimeString('tr-TR')} - Şimdi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-6 -right-6 bg-gradient-to-r from-cargolink-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg animate-float">
        <div className="text-lg font-bold">%35</div>
        <div className="text-xs opacity-90">Maliyet Tasarrufu</div>
      </div>
      
      <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-success-500 to-emerald-600 text-white p-3 rounded-xl shadow-lg animate-float-delayed">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>%99.9 Başarı</span>
        </div>
      </div>
    </div>
  )
}

export function PremiumHeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cargolink-900 via-cargolink-800 to-purple-900"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cargolink-400 to-blue-400 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-15 animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-cargolink-300 to-cyan-300 rounded-full blur-2xl opacity-25 animate-pulse-slow"></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-left space-y-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            {/* Premium Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cargolink-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-white/20 animate-scale-in">
              <Zap className="w-5 h-5 mr-3 text-yellow-400" />
              <span className="text-white font-semibold text-lg">Türkiye'nin #1 Lojistik Platformu</span>
            </div>

            {/* Hero Title */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black leading-tight">
                <span className="text-white">Kargo</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cargolink-400 via-blue-400 to-purple-400 animate-gradient-x">
                  Takibinde
                </span>
                <br />
                <span className="text-white">Devrim</span>
              </h1>
              <p className="text-xl lg:text-2xl xl:text-3xl text-white/80 font-light max-w-2xl leading-relaxed">
                Tüm kargo firmalarını tek platformda birleştirin. 
                <span className="font-semibold text-cargolink-300"> AI destekli takip</span>, 
                gerçek zamanlı bildirimler ve premium analytics ile lojistik süreçlerinizi yeni seviyeye taşıyın.
              </p>
            </div>

            {/* Premium Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {[
                { value: 87, suffix: '+', label: 'Kargo Firması', icon: <Target className="w-6 h-6" /> },
                { value: 2500000, suffix: '+', label: 'Takip Edilen Kargo', icon: <Package className="w-6 h-6" /> },
                { value: 99.9, suffix: '%', label: 'Uptime Garantisi', icon: <Shield className="w-6 h-6" /> },
                { value: 25000, suffix: '+', label: 'Mutlu Müşteri', icon: <Users className="w-6 h-6" /> }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-2 text-cargolink-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/70 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Premium CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Link 
                href="/signup" 
                className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-cargolink-500 to-cargolink-600 hover:from-cargolink-600 hover:to-cargolink-700 rounded-2xl shadow-2xl hover:shadow-cargolink-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-cargolink-400/50"
              >
                <span>Ücretsiz Başla</span>
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 hover:border-white/30">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Demo İzle</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8">
              <TrustIndicators />
            </div>
          </div>

          {/* Right Content - Interactive Dashboard */}
          <div className={`relative ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <DashboardPreview />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          fill="none" 
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0V46.29C47.79,22.29 96.58,22 144,46.29C191.42,70.58 240.21,70.58 288,46.29C335.79,22 384.58,22 432,46.29C479.42,70.58 528.21,70.58 576,46.29C623.79,22 672.58,22 720,46.29C767.42,70.58 816.21,70.58 864,46.29C911.79,22 960.58,22 1008,46.29C1055.42,70.58 1104.21,70.58 1152,46.29C1199.79,22 1200,22 1200,46.29V120H0V0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}