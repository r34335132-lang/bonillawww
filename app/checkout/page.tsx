'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Lock, Mail, MapPin, Phone, User, ShieldCheck, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// SUB-COMPONENTE CON LA LÓGICA
function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tripId = searchParams.get('tripId')
  const origin = searchParams.get('origin') || 'Origen'
  const destination = searchParams.get('destination') || 'Destino'
  const label = searchParams.get('label') || 'Boleto'
  const price = Number(searchParams.get('price')) || 0
  const seatsRaw = searchParams.get('seats') || ''
  const selectedSeats = seatsRaw ? seatsRaw.split(',') : []
  
  const totalPrice = selectedSeats.length * price

  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setFormData({
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            phone: user.phone || ''
          })
        }
      } catch (error) {
        console.error("Error al obtener sesión:", error)
      } finally {
        setIsLoadingAuth(false)
      }
    }
    checkUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tripId || selectedSeats.length === 0) return

    setIsProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-clip-payment', {
        body: {
          title: `Viaje ${origin} a ${destination} - Asientos: ${selectedSeats.join(', ')}`,
          quantity: 1, 
          price: totalPrice
        }
      })

      if (error) throw error

      if (data?.ok && data?.payment_url) {
        window.location.href = data.payment_url
      } else {
        alert("No se pudo generar el enlace de pago con Clip. Intenta nuevamente.")
      }
    } catch (err) {
      console.error("Error en el pago:", err)
      alert("Hubo un error al procesar la solicitud de pago.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoadingAuth) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold">Preparando tu reserva...</h2>
      </div>
    )
  }

  if (selectedSeats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center py-32">
        <h2 className="text-2xl font-bold mb-2">No hay asientos seleccionados</h2>
        <p className="text-muted-foreground mb-6">Por favor, busca un viaje y selecciona tus asientos primero.</p>
        <Button onClick={() => router.push('/search')} className="bg-primary text-white">Volver al Buscador</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Modificar Asientos
        </Button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-card border border-border/50 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Detalles del Pasajero</h1>
              <p className="text-muted-foreground">Ingresa los datos de la persona que viajará. Enviaremos tus boletos digitales a este correo.</p>
            </div>

            <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Ej. 618 123 4567"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/60 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tus datos están protegidos. El pago se procesará de manera encriptada y segura a través de la plataforma certificada de <span className="font-bold text-foreground">Clip</span>.
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-card border border-border/50 sticky top-24 rounded-[2rem] p-6 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-foreground">Resumen de tu Viaje</h3>

            <div className="mb-6 space-y-4 border-b border-border/50 pb-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Origen</div>
                  <div className="font-black text-foreground text-lg">{origin}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Destino</div>
                  <div className="font-black text-foreground text-lg">{destination}</div>
                </div>
              </div>
            </div>

            <div className="mb-6 border-b border-border/50 pb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Asientos ({selectedSeats.length})</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black text-xs uppercase">{label}</span>
              </div>
              
              <div className="space-y-3">
                {selectedSeats.map((seatId) => (
                  <div key={seatId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-foreground border border-border">
                        {seatId}
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">Boleto de Pasajero</span>
                    </div>
                    <span className="font-bold text-foreground">${price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">Total a pagar</span>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary">
                    ${totalPrice.toLocaleString()} <span className="text-base text-muted-foreground">MXN</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              disabled={isProcessing}
              className="w-full gap-2 h-14 text-lg rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-md shadow-primary/20 bg-primary text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Conectando con Clip...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Pagar y Reservar Viaje
                </>
              )}
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ESTE ES EL CONTENEDOR PRINCIPAL QUE EVITA EL ERROR 500
export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold">Cargando...</h2>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </main>
  )
}