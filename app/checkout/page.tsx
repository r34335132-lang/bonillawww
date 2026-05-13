'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Clock, MapPin, User, Mail, Phone, 
  CreditCard, Lock, CheckCircle2, Loader2, Shield
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockTrips, generateSeats } from '@/lib/data'
import Link from 'next/link'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('tripId') || '1'
  const seatsParam = searchParams.get('seats') || ''
  const selectedSeats = seatsParam.split(',').filter(Boolean)

  const trip = mockTrips.find((t) => t.id === tripId) || mockTrips[0]
  const seats = generateSeats()

  const [isProcessing, setIsProcessing] = useState(false)
  const [passengerInfo, setPassengerInfo] = useState(
    selectedSeats.map((seat) => ({
      seatId: seat,
      name: '',
      email: '',
      phone: '',
    }))
  )

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return total + trip.price + (seat?.price || 0)
    }, 0)
  }, [selectedSeats, seats, trip.price])

  const handlePassengerChange = (index: number, field: string, value: string) => {
    setPassengerInfo((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push('/checkout/success')
  }

  const isFormValid = passengerInfo.every(
    (p) => p.name.trim() && p.email.trim() && p.phone.trim()
  )

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href={`/seats?tripId=${tripId}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a selección de asientos
            </Button>
          </Link>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Completa tu compra
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ingresa los datos de los pasajeros y procede al pago
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Passenger Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {passengerInfo.map((passenger, index) => (
              <div key={passenger.seatId} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Pasajero {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Asiento {passenger.seatId}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor={`name-${index}`}>Nombre completo</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={`name-${index}`}
                        placeholder="Como aparece en tu identificación"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`email-${index}`}>Correo electrónico</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="tu@email.com"
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`phone-${index}`}>Teléfono</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={`phone-${index}`}
                        type="tel"
                        placeholder="55 1234 5678"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Payment Notice */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Pago seguro con Clip
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Al continuar, serás redirigido a la pasarela de pagos segura de Clip 
                    para completar tu transacción. Aceptamos tarjetas de crédito, débito y otros métodos de pago.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Transacción protegida con encriptación SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card sticky top-24 rounded-2xl p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                Resumen del pedido
              </h3>

              {/* Trip Info */}
              <div className="mb-6 space-y-4 border-b border-border pb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{trip.departureTime}</div>
                    <div className="text-xs text-muted-foreground">{trip.origin.split(' ')[0]}</div>
                  </div>
                  <div className="flex flex-1 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="relative flex-1">
                      <div className="h-px w-full bg-border" />
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{trip.arrivalTime}</div>
                    <div className="text-xs text-muted-foreground">{trip.destination.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{trip.duration}</span>
                  <span className="mx-2">•</span>
                  <span>{trip.serviceType}</span>
                </div>
              </div>

              {/* Seats */}
              <div className="mb-6 space-y-2">
                {selectedSeats.map((seatId) => {
                  const seat = seats.find((s) => s.id === seatId)
                  const seatPrice = trip.price + (seat?.price || 0)
                  return (
                    <div key={seatId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Asiento {seatId}
                        {seat?.type === 'premium' && (
                          <span className="ml-1 text-xs text-amber-600">(Premium)</span>
                        )}
                      </span>
                      <span className="font-medium text-foreground">
                        ${seatPrice.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cargo por servicio</span>
                  <span className="text-foreground">$0</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${totalPrice.toLocaleString()} MXN</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={!isFormValid || isProcessing}
                className="mt-6 w-full gap-2 py-6 text-base transition-all hover:scale-[1.02]"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Pagar ${totalPrice.toLocaleString()} MXN
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Compra segura</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Confirmación inmediata</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
