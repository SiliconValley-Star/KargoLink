import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
  description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin. Hızlı, güvenilir ve ekonomik kargo çözümleri.',
  keywords: [
    'kargo',
    'lojistik',
    'kargo takibi',
    'kargo gönderimi',
    'yurtiçi kargo',
    'aras kargo',
    'mng kargo',
    'kargo fiyat karşılaştırma',
    'dijital lojistik',
    'CargoLink'
  ].join(', '),
  authors: [{ name: 'CargoLink Team' }],
  creator: 'CargoLink',
  publisher: 'CargoLink',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cargolink.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
    description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin.',
    siteName: 'CargoLink',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CargoLink - Lojistik Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
    description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin.',
    images: ['/twitter-image.png'],
    creator: '@cargolink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          as="style"
          
        />
        
        {/* Analytics - Add your analytics code here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}