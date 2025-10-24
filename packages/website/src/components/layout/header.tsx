"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Menu, X, Package, ChevronDown, Sun, Moon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-cargolink-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CargoLink
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Özellikler</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/features"
                      >
                        <Package className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Kargo Takip Sistemi
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Real-time takip ve bildirimler ile kargolarınızı her zaman kontrol altında tutun.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                  <div className="space-y-2">
                    <Link href="/pricing" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Fiyatlandırma</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        İhtiyaçlarınıza uygun paketler
                      </p>
                    </Link>
                    <Link href="/api-docs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">API Dokümantasyonu</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Entegrasyon için geliştirici kaynakları
                      </p>
                    </Link>
                    <Link href="/support" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Destek</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        24/7 müşteri desteği
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Fiyatlandırma
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Hakkımızda
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  İletişim
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="ghost" asChild>
            <Link href="/login">Giriş Yap</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Ücretsiz Başla</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto py-4 px-4 space-y-4">
            <Link
              href="/features"
              className="block py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Özellikler
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Fiyatlandırma
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsMenuOpen(false);
                }}
                className="justify-start"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
              
              <Button variant="ghost" asChild>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Giriş Yap
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  Ücretsiz Başla
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}