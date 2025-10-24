"use client"

import { TrendingUp, Users, Package, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

const stats = [
  {
    id: 'shipments',
    icon: Package,
    value: 2500000,
    label: 'Takip Edilen Kargo',
    suffix: '+',
    color: 'text-blue-600'
  },
  {
    id: 'users',
    icon: Users,
    value: 150000,
    label: 'Aktif Kullanıcı',
    suffix: '+',
    color: 'text-green-600'
  },
  {
    id: 'carriers',
    icon: Globe,
    value: 50,
    label: 'Kargo Firması',
    suffix: '+',
    color: 'text-purple-600'
  },
  {
    id: 'satisfaction',
    icon: TrendingUp,
    value: 99.5,
    label: 'Müşteri Memnuniyeti',
    suffix: '%',
    color: 'text-orange-600'
  }
]

function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K'
    }
    return num.toString()
  }

  return (
    <span className="tabular-nums">
      {suffix === '%' ? count.toFixed(1) : formatNumber(count)}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-cargolink-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-cargolink-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rakamlarla 
            <span className="text-cargolink-600"> CargoLink</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Türkiye'nin lider lojistik platformunun güvenilir verileri
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.id}
                className="relative group"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Background Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group-hover:border-cargolink-200 dark:group-hover:border-cargolink-800 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Floating Decoration */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cargolink-100 to-blue-100 dark:from-cargolink-800 dark:to-blue-800 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${
                      stat.color === 'text-blue-600' ? 'from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900' :
                      stat.color === 'text-green-600' ? 'from-green-100 to-green-200 dark:from-green-800 dark:to-green-900' :
                      stat.color === 'text-purple-600' ? 'from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900' :
                      'from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-900'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </div>

                  {/* Number */}
                  <div className="relative mb-2">
                    <div className={`text-4xl lg:text-5xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="relative">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </p>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cargolink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">ISO 27001 Sertifikalı</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Uluslararası güvenlik standardı</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">99.9% Uptime</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">7/24 kesintisiz hizmet</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 0118 8zM2 8a6 6 0 1010.743 5.743L12 14l-.257-.257A6 6 0 012 8zm8-2a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">KVKK Uyumlu</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tam veri koruma garantisi</p>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}