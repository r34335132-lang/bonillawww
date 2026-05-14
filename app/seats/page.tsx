'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Bus, Users, CreditCard, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SeatMap } from '@/components/seat-map'
import { Button } from '@/components/ui/button'
import { generateSeats } from '@/lib/data'
import { supabase } from '@/lib/supabase'

// LÓGICA OFICIAL DE RUTAS
const BONILLA_ROUTE = [
  "Durango", "Nombre de Dios", "Vicente Guerrero", "Sombrerete",
  "San José de Fénix", "Sain Alto", "Río Florido", "Fresnillo",
  "Calera", "Zacatecas", "Aguascalientes", "San Juan de los Lagos", "Guadalajara"
];

function SeatsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Parámetros de la URL
  const tripId = searchParams.get('tripId')
  const urlPrice = Number(searchParams.get('price')) || 0
  const ticketLabel = searchParams.get('label') || 'Sencillo'
  const searchOrigin = searchParams.get('origin') || ''
  const searchDest = searchParams.get('destination') || ''

  const [trip, setTrip] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTripAndSeats = async () => {
      if (!tripId) return;
      setIsLoading(true);

      try {
        // 1. Obtener detalles del viaje
        const { data: tripData } = await supabase.from('trips').select('*').eq('id', tripId).single();
        
        if (tripData) {
          setTrip({
            id: tripData.id,
            origin: searchOrigin || tripData.origin,
            destination: searchDest || tripData.destination,
            departureTime: tripData.departure_time,
            arrivalTime: tripData.arrival_time,
            duration: tripData.duration || '--',
            busType: tripData.bus_type || 'Ejecutivo',
            price: urlPrice > 0 ? urlPrice : tripData.price,
            totalSeats: tripData.total_seats || 40
          });
        }

        // 2. Obtener reservaciones activas de la BD
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('seats, status, origin, destination')
          .eq('trip_id', tripId)
          .neq('status', 'cancelled');

        // 3. Matemática para saber si los pasajeros chocan en el camino
        const occupied = new Set<string>();
        const sStart = BONILLA_ROUTE.indexOf(searchOrigin);
        const sEnd = BONILLA_ROUTE.indexOf(searchDest);
        const isGoingSouth = sStart < sEnd;

        if (bookingsData) {
          bookingsData.forEach(b => {
            if (sStart === -1 || sEnd === -1) {
              if (Array.isArray(b.seats)) b.seats.forEach(s => occupied.add(String(s)));
              return;
            }

            const bStart = BONILLA_ROUTE.indexOf(b.origin);
            const bEnd = BONILLA_ROUTE.indexOf(b.destination);

            if (bStart === -1 || bEnd === -1) {
              if (Array.isArray(b.seats)) b.seats.forEach(s => occupied.add(String(s)));
              return;
            }

            const bookingGoingSouth = bStart < bEnd;
            if (isGoingSouth !== bookingGoingSouth) return; // Sentido contrario no choca

            if (isGoingSouth) {
              if (bStart < sEnd && bEnd > sStart) {
                if (Array.isArray(b.seats)) b.seats.forEach(s => occupied.add(String(s)));
              }
            } else {
              if (bStart > sEnd && bEnd < sStart) {
                if (Array.isArray(b.seats)) b.seats.forEach(s => occupied.add(String(s)));
              }
            }
          });
        }

        // 4. Mapear asientos con la BD (Fuerza a 'occupied' a los que están en el Set)
        const generatedLayout = generateSeats(tripData?.total_seats || 40); 
        const configuredSeats = generatedLayout.map((seat: any) => {
          return {
            ...seat,
            status: occupied.has(seat.id) ? 'occupied' : 'available'
          };
        });

        setSeats(configuredSeats);

      } catch (error) {
        console.error("Error cargando asientos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripAndSeats();
  }, [tripId, urlPrice, searchOrigin, searchDest]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    )
  }

  const totalPrice = selectedSeats.length * (trip?.price || 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0 || !trip) return
    const params = new URLSearchParams({
      tripId: trip.id,
      seats: selectedSeats.join(','),
      price: trip.price.toString(),
      label: ticketLabel,
      origin: trip.origin,
      destination: trip.destination
    })
    router.push(`/checkout?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold">Cargando disponibilidad real...</h2>
        </div>
        <Footer />
      </main>
    );
  }

  if (!trip) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Volver a resultados
          </Button>
        </motion.div>

        {/* Resumen del Viaje */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 mb-8 rounded-[2rem] p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center justify-between sm:justify-start gap-4 sm:gap-12 w-full lg:w-auto">
              <div className="text-center min-w-[70px]">
                <div className="text-3xl font-black text-foreground">{trip.departureTime}</div>
                <div className="text-xs font-bold uppercase text-muted-foreground">{trip.origin.substring(0, 3)}</div>
              </div>
              <div className="flex flex-1 flex-col items-center px-2 max-w-[200px]">
                <div className="w-full flex items-center relative">
                  <div className="h-2.5 w-2.5 rounded-full border-[2px] border-primary bg-background z-10 shrink-0" />
                  <div className="flex-1 h-[2px] bg-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full bg-primary" />
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-primary z-10 shrink-0" />
                </div>
              </div>
              <div className="text-center min-w-[70px]">
                <div className="text-3xl font-black text-foreground">{trip.arrivalTime}</div>
                <div className="text-xs font-bold uppercase text-muted-foreground">{trip.destination.substring(0, 3)}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Bus className="h-4 w-4" /><span>{trip.busType}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                <span>{ticketLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Mapa de Asientos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Selecciona tus asientos
            </h2>
            <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
              <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} maxSelections={6} />
            </div>
          </motion.div>

          {/* Ticket de Compra */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-card border border-border/50 sticky top-24 rounded-[2rem] p-6 shadow-xl">
              <h3 className="mb-6 text-xl font-bold text-foreground">Resumen de tu viaje</h3>

              <div className="mb-6 space-y-4 border-b border-border/50 pb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">{trip.origin}</div>
                    <div className="text-sm font-medium text-muted-foreground">Salida: {trip.departureTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-bold text-foreground">{trip.destination}</div>
                    <div className="text-sm font-medium text-muted-foreground">Llegada: {trip.arrivalTime}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm uppercase tracking-wider">Asientos</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black text-xs">{selectedSeats.length}/6</span>
                </div>
                
                {selectedSeats.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => (
                      <div key={seatId} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 border border-border/30">
                        <span className="font-bold text-foreground">Asiento {seatId}</span>
                        <span className="text-muted-foreground font-semibold">${trip.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center text-sm font-medium text-muted-foreground">
                    Selecciona al menos un asiento en el mapa para continuar
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-border/50 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">Total a pagar</span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-primary">
                      ${totalPrice.toLocaleString()} <span className="text-base text-muted-foreground">MXN</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleContinue} disabled={selectedSeats.length === 0} className="w-full gap-2 h-14 text-lg rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-md shadow-primary/20">
                <CreditCard className="h-5 w-5" /> Continuar al pago
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function SeatsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <h2 className="text-xl font-bold">Cargando disponibilidad...</h2>
        </div>
        <Footer />
      </main>
    }>
      <SeatsContent />
    </Suspense>
  )
}
