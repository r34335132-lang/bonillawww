'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Bus, Lock, Mail, User, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true) // True = Login, False = Registro
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrorMsg('') // Limpiar error al escribir
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        // INICIO DE SESIÓN
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        
        // Redirigir al dashboard tras login exitoso
        router.push('/dashboard')
        router.refresh()
      } else {
        // REGISTRO
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name, // Guardamos el nombre en los metadatos
            }
          }
        })
        if (error) throw error
        
        // Mostrar mensaje de confirmación de correo (dependiendo de tu config de Supabase)
        alert('¡Registro exitoso! Verifica tu correo electrónico o inicia sesión para continuar.')
        setIsLogin(true) // Cambiar a pestaña de login
      }
    } catch (error: any) {
      console.error("Error Auth:", error)
      setErrorMsg(error.message || 'Ocurrió un error. Verifica tus datos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Bus className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-[2rem] shadow-xl overflow-hidden">
            {/* TABS (Login / Registro) */}
            <div className="flex border-b border-border/50">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                  isLogin ? 'bg-background text-primary border-b-2 border-primary' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                  !isLogin ? 'bg-background text-primary border-b-2 border-primary' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-foreground">
                  {isLogin ? 'Bienvenido de nuevo' : 'Únete a Bonilla Tours'}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Crea una cuenta para guardar tus boletos y agilizar tus compras.'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Nombre (Solo en Registro) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input 
                        type="text" 
                        name="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Juan Pérez"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Campo Correo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contraseña</label>
                    {isLogin && (
                      <button type="button" className="text-xs font-bold text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  {!isLogin && (
                    <p className="text-[10px] text-muted-foreground ml-1 mt-1">Mínimo 6 caracteres.</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full gap-2 h-14 text-lg rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-md shadow-primary/20 bg-primary text-white mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    isLogin ? 'Ingresar a mi cuenta' : 'Crear mi cuenta'
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => router.push('/')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al Inicio
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}