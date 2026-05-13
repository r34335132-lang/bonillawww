'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, MapPin, Bus, Calendar, Users, CreditCard } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SeatMap } from '@/components/seat-map'
import { Button } from '@/components/ui/button'
import { mockTrips, generateSeats } from '@/lib/data'
import Link from 'next/link'

export default function SeatsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('tripId') || '1'
  
  const trip = mockTrips.find((t) => t.id === tripId) || mockTrips[0]
  const [seats] = useState(() => generateSeats())
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    )
  }

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return total + trip.price + (seat?.price || 0)
    }, 0)
  }, [selectedSeats, seats, trip.price])

  const handleContinue = () => {
    if (selectedSeats.length === 0) return
    const params = new URLSearchParams({
      tripId: trip.id,
      seats: selectedSeats.join(','),
    })
    router.push(`/checkout?${params.toString()}`)
  }

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
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a resultados
            </Button>
          </Link>
        </motion.div>

        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-8 rounded-2xl p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Route Info */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{trip.departureTime}</div>
                <div className="text-sm text-muted-foreground">{trip.origin}</div>
              </div>
              <div className="flex flex-1 items-center min-w-[100px]">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="relative flex-1">
                  <div className="h-px w-full bg-border" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{trip.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{trip.arrivalTime}</div>
                <div className="text-sm text-muted-foreground">{trip.destination}</div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <Bus className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{trip.busType}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium text-primary">{trip.serviceType}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Seat Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Selecciona tus asientos
            </h2>
            <SeatMap
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              maxSelections={6}
            />
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card sticky top-24 rounded-2xl p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                Resumen de tu viaje
              </h3>

              {/* Trip Info */}
              <div className="mb-6 space-y-4 border-b border-border pb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">{trip.origin}</div>
                    <div className="text-sm text-muted-foreground">Salida: {trip.departureTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <div className="font-medium text-foreground">{trip.destination}</div>
                    <div className="text-sm text-muted-foreground">Llegada: {trip.arrivalTime}</div>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Asientos seleccionados</span>
                </div>
                {selectedSeats.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => {
                      const seat = seats.find((s) => s.id === seatId)
                      const seatPrice = trip.price + (seat?.price || 0)
                      return (
                        <div key={seatId} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                          <span className="font-medium text-foreground">Asiento {seatId}</span>
                          <span className="text-muted-foreground">
                            ${seatPrice.toLocaleString()}
                            {seat?.type === 'premium' && (
                              <span className="ml-1 text-xs text-amber-600">(Premium)</span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/50 px-3 py-4 text-center text-sm text-muted-foreground">
                    Selecciona al menos un asiento para continuar
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mb-6 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${totalPrice.toLocaleString()} MXN
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedSeats.length} {selectedSeats.length === 1 ? 'asiento' : 'asientos'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="w-full gap-2 py-6 text-base transition-all hover:scale-[1.02]"
                size="lg"
              >
                <CreditCard className="h-5 w-5" />
                Continuar al pago
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
