"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Package, Eye, EyeOff, Mail, Lock, User, Phone, Loader2, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual' as 'individual' | 'business',
    companyName: '',
    taxNumber: '',
    termsAccepted: false,
    marketingConsent: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Account Type, 2: Personal Info, 3: Complete
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }
    
    if (!formData.termsAccepted) {
      setError('Kullanım koşullarını kabul etmelisiniz')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          accountType: formData.accountType,
          businessInfo: formData.accountType === 'business' ? {
            companyName: formData.companyName,
            taxNumber: formData.taxNumber
          } : undefined,
          termsAccepted: formData.termsAccepted,
          marketingConsent: formData.marketingConsent
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Kayıt başarısız')
      }

      const data = await response.json()
      
      // Store token and user data
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('access_token', token);
      }
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('✅ Kayıt başarılı, dashboard\'a yönlendiriliyor...');
      
      // Show success and redirect
      setStep(3)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const nextStep = () => {
    if (step === 1) {
      setStep(2)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Hoş Geldiniz!
            </h2>
            <p className="mt-4 text-gray-600">
              Hesabınız başarıyla oluşturuldu. Dashboard'a yönlendiriliyorsunuz...
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CargoLink'e katılın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş yapın
            </Link>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Hesap türünüzü seçin
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.accountType === 'individual'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, accountType: 'individual' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.accountType === 'individual' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">Bireysel Hesap</h4>
                      <p className="text-sm text-gray-600">Kişisel kargo gönderimleri için</p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.accountType === 'business'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, accountType: 'business' })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.accountType === 'business' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">Kurumsal Hesap</h4>
                      <p className="text-sm text-gray-600">İşletme ve e-ticaret için</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={nextStep} className="w-full">
              Devam Et
            </Button>
          </div>
        )}

        {step === 2 && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Soyadınız"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon numarası
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="5XX XXX XX XX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.accountType === 'business' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Firma adı
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required={formData.accountType === 'business'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Firma adınız"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi numarası
                  </label>
                  <input
                    id="taxNumber"
                    name="taxNumber"
                    type="text"
                    required={formData.accountType === 'business'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Vergi numaranız"
                    value={formData.taxNumber}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="En az 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre tekrarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Şifrenizi tekrar girin"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Kullanım Koşulları
                  </Link>{' '}
                  ve{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Gizlilik Politikası
                  </Link>
                  'nı okudum ve kabul ediyorum
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  id="marketingConsent"
                  name="marketingConsent"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.marketingConsent}
                  onChange={handleChange}
                />
                <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
                  Kampanya ve güncellemeler hakkında bilgi almak istiyorum (isteğe bağlı)
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Hesap Oluştur'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}