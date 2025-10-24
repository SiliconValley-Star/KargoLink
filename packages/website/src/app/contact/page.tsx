"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    contactType: 'general' as 'general' | 'sales' | 'support' | 'partnership'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const contactTypes = [
    { value: 'general', label: 'Genel Sorular' },
    { value: 'sales', label: 'Satış ve Fiyatlandırma' },
    { value: 'support', label: 'Teknik Destek' },
    { value: 'partnership', label: 'İş Ortaklığı' }
  ]

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      details: ['+90 (212) 555 0123', '+90 (555) 123 4567'],
      description: 'Pazartesi-Cuma 09:00-18:00'
    },
    {
      icon: Mail,
      title: 'E-posta',
      details: ['info@cargolink.com', 'support@cargolink.com'],
      description: '24 saat içinde yanıt'
    },
    {
      icon: MapPin,
      title: 'Adres',
      details: ['Maslak Mahallesi, Büyükdere Caddesi', 'No: 123, Sarıyer/İstanbul'],
      description: 'Ziyaret için randevu alın'
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      details: ['Pazartesi - Cuma: 09:00 - 18:00', 'Cumartesi: 10:00 - 16:00'],
      description: 'Pazar kapalı'
    }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Mesaj gönderilemedi')
      }

      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        contactType: 'general'
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <MessageCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Mesajınız Alındı!
            </h2>
            <p className="mt-4 text-gray-600">
              En kısa sürede size dönüş yapacağız. İlginiz için teşekkür ederiz.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="mt-6"
            >
              Yeni Mesaj Gönder
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Bizimle İletişime Geçin
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın. 
              Uzman ekibimiz size yardımcı olmak için burada.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <info.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {info.title}
                      </h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600">
                          {detail}
                        </p>
                      ))}
                      <p className="text-sm text-gray-500 mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sosyal Medya
                </h3>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bize Mesaj Gönderin
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Contact Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konu Türü
                  </label>
                  <select
                    name="contactType"
                    value={formData.contactType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {contactTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Company and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Konu *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mesajınızın konusunu kısaca özetleyin"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mesajınızı detaylı bir şekilde yazın..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Mesaj Gönder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Sıkça Sorulan Sorular
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hızlı yanıtlar arıyorsanız, bu bölümü kontrol edin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Platform nasıl çalışıyor?
              </h3>
              <p className="text-gray-600 mb-6">
                CargoLink ile kargo firmalarının fiyat ve hizmetlerini karşılaştırabilir, 
                en uygun seçeneği seçerek kargonuzu gönderebilirsiniz.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Hangi kargo firmaları ile çalışıyorsunuz?
              </h3>
              <p className="text-gray-600 mb-6">
                Aras Kargo, MNG Kargo, Yurtiçi Kargo, PTT Kargo ve daha birçok 
                güvenilir kargo firması ile çalışıyoruz.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                API entegrasyonu nasıl yapılır?
              </h3>
              <p className="text-gray-600 mb-6">
                Detaylı API dokümantasyonumuz ve örnek kodlar ile kolayca entegrasyon 
                yapabilirsiniz. Teknik destek ekibimiz size yardımcı olur.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Destek saatleri nedir?
              </h3>
              <p className="text-gray-600 mb-6">
                Pazartesi-Cuma 09:00-18:00 saatleri arasında canlı destek, 
                7/24 e-posta desteği sağlıyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}