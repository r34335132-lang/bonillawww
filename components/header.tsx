'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Package, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/search', label: 'Buscar Viajes' },
  { href: '/tracking', label: 'Rastrear Paquete' },
]

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Detectar el estado de la sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setIsLoadingAuth(false)
    }

    checkSession()

    // Escuchar cambios en la sesión (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO OFICIAL DE BONILLA TOURS */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-border/50">
              <img 
                src="https://gisyiiljfplywcfhxxem.supabase.co/storage/v1/object/public/fls/WhatsApp%20Image%202026-05-04%20at%205.53.38%20PM.jpeg" 
                alt="Bonilla Tours Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Bonilla<span className="text-primary">Tours</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-bold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            {/* Si hay usuario, mostramos "Mis Viajes" en la barra de navegación */}
            {user && (
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-bold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary tracking-wide"
              >
                Mis Viajes
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/tracking">
              <Button variant="ghost" size="sm" className="gap-2 font-bold">
                <Package className="h-4 w-4" />
                <span className="hidden lg:inline">Paquetería</span>
              </Button>
            </Link>
            
            {isLoadingAuth ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="default" size="sm" className="gap-2 font-bold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20">
                    <User className="h-4 w-4" />
                    <span>Mi Cuenta</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} title="Cerrar sesión" className="hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm" className="gap-2 font-bold bg-primary text-white hover:bg-primary/90 shadow-md">
                  <User className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary/10 md:hidden"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-lg md:hidden shadow-xl"
          >
            <nav className="flex flex-col px-4 py-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-primary/10 font-bold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {user && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.1 }}>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-primary/10 font-bold"
                  >
                    Mis Viajes
                  </Link>
                </motion.div>
              )}

              <div className="mt-4 flex flex-col gap-3 border-t border-border/50 pt-4 px-2">
                {isLoadingAuth ? (
                  <Button disabled className="w-full h-12"><Loader2 className="h-5 w-5 animate-spin" /></Button>
                ) : user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 h-12 font-bold border-primary/20 text-primary bg-primary/5">
                        <User className="h-5 w-5" /> Mi Cuenta
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="w-full gap-2 h-12 font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <LogOut className="h-5 w-5" /> Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full gap-2 h-12 font-bold bg-primary text-white hover:bg-primary/90 shadow-md">
                      <User className="h-5 w-5" /> Iniciar Sesión / Registro
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}